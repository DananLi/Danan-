/**
 * Image generation utility using Volcengine Ark API.
 * API Endpoint: POST https://ark.cn-beijing.volces.com/api/v3/images/generations
 * Auth: Bearer Token
 *
 * API Key is read from environment variable VITE_VOLC_API_KEY (set in .env).
 * Model selection with automatic fallback when quota is exhausted.
 */

import { ImageResult } from '../types';
import { volcModels } from '../data/volcModels';

/** localStorage key for model endpoint */
const STORAGE_KEY_MODEL = 'promptcraft_volc_model';

/** Default timeout for image generation (120 seconds — Volcengine can be slow) */
const GENERATION_TIMEOUT_MS = 120_000;

/**
 * Get the API key from environment variable (injected at build time via .env).
 */
export function getApiKey(): string {
  return import.meta.env.VITE_VOLC_API_KEY ?? '';
}

/**
 * Get the stored model endpoint from localStorage.
 */
export function getStoredModel(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_MODEL) ?? 'doubao-seedream-4-5-251128';
  } catch {
    return 'doubao-seedream-4-5-251128';
  }
}

/**
 * Save the model endpoint to localStorage.
 */
export function saveModel(model: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODEL, model);
  } catch {
    // Silently fail
  }
}

/**
 * Build the size string for Volcengine Ark API.
 * Always returns pixel format "WxH" for maximum compatibility.
 * For seedream-4-5 and seedream-4-0, enforces minimum 3,686,400 pixels.
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param model - Model ID (to check model-specific requirements)
 * @returns Size string in pixel format e.g. "2048x2048"
 */
export function buildSizeString(width: number, height: number, model?: string): string {
  // Ensure minimum dimensions
  let w = Math.max(width, 1024);
  let h = Math.max(height, 1024);

  // seedream models require at least 3,686,400 total pixels
  const MIN_PIXELS = 3_686_400;
  const isSeedream = model?.includes('seedream') ?? false;

  if (isSeedream && w * h < MIN_PIXELS) {
    // Scale up to meet minimum while preserving aspect ratio
    const scaleFactor = Math.sqrt(MIN_PIXELS / (w * h));
    w = Math.ceil(w * scaleFactor);
    h = Math.ceil(h * scaleFactor);
    // Round to nearest 64 for cleaner output
    w = Math.ceil(w / 64) * 64;
    h = Math.ceil(h / 64) * 64;
  }

  return `${w}x${h}`;
}

/**
 * Check if an API error indicates quota exhaustion.
 * Volcengine returns specific error codes when free quota is used up.
 */
export function isQuotaExhausted(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  // Common Volcengine quota/billing error patterns
  return (
    msg.includes('quota') ||
    msg.includes('exceeded') ||
    msg.includes('limit') ||
    msg.includes('余额') ||
    msg.includes('欠费') ||
    msg.includes('额度') ||
    msg.includes('insufficient') ||
    msg.includes('billing') ||
    msg.includes('resource exhausted') ||
    msg.includes('429') ||
    (msg.includes('402') && !msg.includes('payment required'))
  );
}

/**
 * Check if an HTTP response status/code indicates quota exhaustion.
 */
function isQuotaResponse(status: number, errorJson: Record<string, unknown>): boolean {
  if (status === 429 || status === 402) return true;
  const code = (errorJson.error as Record<string, string>)?.code || (errorJson as Record<string, string>).code || '';
  return ['QuotaExceeded', 'InsufficientBalance', 'ResourceExhausted'].includes(code);
}

/**
 * Generate an image using a specific model via the Volcengine Ark API.
 * This is the low-level function — use generateImageWithFallback for auto-switching.
 */
async function callApi(
  prompt: string,
  width: number,
  height: number,
  model: string,
): Promise<ImageResult> {
  const apiKey = getApiKey();

  if (!apiKey.trim()) {
    throw new Error('API Key 未配置，请在 .env 文件中设置 VITE_VOLC_API_KEY');
  }

  const sizeStr = buildSizeString(width, height, model);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    const response = await fetch('/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        prompt: prompt.trim(),
        size: sizeStr,
        response_format: 'url',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = `API 请求失败 (${response.status})`;
      let isQuotaError = false;
      try {
        const errorJson = JSON.parse(errorText);
        if ((errorJson.error as Record<string, string>)?.message) {
          errorMessage = (errorJson.error as Record<string, string>).message;
        } else if ((errorJson as Record<string, string>).message) {
          errorMessage = (errorJson as Record<string, string>).message;
        }
        isQuotaError = isQuotaResponse(response.status, errorJson);
      } catch {
        // Use default error message
      }

      if (isQuotaError) {
        const quotaError = new Error(`QUOTA_EXHAUSTED:${model}`);
        quotaError.name = 'QuotaExhaustedError';
        throw quotaError;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('API 未返回图片数据，请重试');
    }

    const imageData = data.data[0];
    const imageUrl = imageData.url || imageData.b64_json;

    if (!imageUrl) {
      throw new Error('API 返回数据格式异常');
    }

    // If b64_json, convert to data URL
    const finalUrl = imageData.b64_json
      ? `data:image/png;base64,${imageData.b64_json}`
      : imageUrl;

    // Use actual returned size if available, otherwise use requested dimensions
    const returnedSize = typeof imageData.size === 'string' && imageData.size.includes('x')
      ? imageData.size.split('x').map(Number)
      : [width, height];

    return {
      url: finalUrl,
      width: returnedSize[0] || width,
      height: returnedSize[1] || height,
      model,
      created: data.created ?? Date.now(),
    };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('图片生成超时（120秒），请稍后重试');
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('图片生成失败，请检查网络和 API 配置');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Result of generateImageWithFallback — includes info about which model was used
 * and whether a fallback occurred.
 */
export interface FallbackResult extends ImageResult {
  /** Whether the generation fell back from the originally requested model */
  fellBack: boolean;
  /** The original model that was requested (before fallback) */
  originalModel: string;
  /** Models that were tried and failed due to quota */
  exhaustedModels: string[];
}

/**
 * Generate an image with automatic model fallback.
 *
 * Tries the requested model first. If its free quota is exhausted,
 * automatically switches to the next available model in the list.
 * All models exhausted → throws error with details.
 *
 * @param prompt - The text prompt for image generation
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param preferredModel - Model ID to try first (defaults to stored model)
 * @returns FallbackResult with image data and fallback info
 */
export async function generateImageWithFallback(
  prompt: string,
  width: number,
  height: number,
  preferredModel?: string,
): Promise<FallbackResult> {
  if (!prompt.trim()) {
    throw new Error('请输入图片描述');
  }

  const startModel = preferredModel ?? getStoredModel();

  // Build ordered model list: start with preferred, then the rest
  const modelIds = volcModels.map((m) => m.id);
  const startIndex = modelIds.indexOf(startModel);
  const orderedModels =
    startIndex >= 0
      ? [...modelIds.slice(startIndex), ...modelIds.slice(0, startIndex)]
      : modelIds;

  const exhaustedModels: string[] = [];

  for (const modelId of orderedModels) {
    try {
      const result = await callApi(prompt, width, height, modelId);

      // Success! Save this model as the new default
      saveModel(modelId);

      const fellBack = modelId !== startModel;
      if (fellBack) {
        console.log(
          `[PromptCraft] 自动切换模型: ${volcModels.find((m) => m.id === startModel)?.label ?? startModel} → ${volcModels.find((m) => m.id === modelId)?.label ?? modelId}`,
        );
      }

      return {
        ...result,
        fellBack,
        originalModel: startModel,
        exhaustedModels,
      };
    } catch (err: unknown) {
      // Check if this is a quota error
      if (err instanceof Error && err.name === 'QuotaExhaustedError') {
        exhaustedModels.push(modelId);
        const modelLabel = volcModels.find((m) => m.id === modelId)?.label ?? modelId;
        console.warn(`[PromptCraft] ${modelLabel} 额度已用尽，尝试下一个模型...`);
        continue; // Try next model
      }

      // Non-quota error — don't try other models, just throw
      throw err;
    }
  }

  // All models exhausted
  const exhaustedLabels = exhaustedModels
    .map((id) => volcModels.find((m) => m.id === id)?.label ?? id)
    .join('、');

  throw new Error(
    `所有模型免费额度均已用尽（${exhaustedLabels}），请稍后重试或联系管理员`,
  );
}

/**
 * Generate an image using the Volcengine Ark API.
 * This is the backward-compatible wrapper that calls generateImageWithFallback.
 * @deprecated Use generateImageWithFallback for full fallback support
 */
export async function generateImage(
  prompt: string,
  width: number,
  height: number,
  model: string,
): Promise<ImageResult> {
  const result = await generateImageWithFallback(prompt, width, height, model);
  return {
    url: result.url,
    width: result.width,
    height: result.height,
    model: result.model,
    created: result.created,
  };
}

/**
 * Download a generated image.
 * @param url - The image URL or data URL
 * @param filename - The filename to save as
 */
export async function downloadImage(url: string, filename: string = 'generated-image.png'): Promise<void> {
  // For data URLs (base64), download directly
  if (url.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // For regular URLs, try fetch-based download
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
}
