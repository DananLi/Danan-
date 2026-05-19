/**
 * Web search utility for finding brand/image style references.
 * Uses Google Custom Search JSON API to search the web and images,
 * then extracts style keywords to enhance the image generation prompt.
 *
 * Setup:
 * 1. Go to https://console.cloud.google.com/ → Enable "Custom Search API"
 * 2. Create API key (Credentials → Create credentials → API key)
 * 3. Go to https://programmablesearchengine.google.com/ → Create a new search engine
 *    - Sites to search: "Search the entire web" (enable)
 *    - Image search: ON
 *    - Copy the Search Engine ID (cx)
 * 4. Set VITE_GOOGLE_SEARCH_KEY and VITE_GOOGLE_SEARCH_CX in .env
 */

import { SearchResult, StyleContext } from '../types';

/** Get Google Search API key from env */
export function getSearchApiKey(): string {
  return import.meta.env.VITE_GOOGLE_SEARCH_KEY ?? '';
}

/** Get Google Custom Search Engine ID from env */
export function getSearchCx(): string {
  return import.meta.env.VITE_GOOGLE_SEARCH_CX ?? '';
}

/** Check if search API is configured */
export function isSearchConfigured(): boolean {
  const key = getSearchApiKey();
  const cx = getSearchCx();
  return key.trim().length > 0 && cx.trim().length > 0;
}

/** Style-related keyword categories for extraction */
const COLOR_PATTERNS = [
  /([\u4e00-\u9fff]*(?:色|色彩|色调|配色|色系|渐变|palette|color|gradient)[\u4e00-\u9fff]*)/gi,
  /(?:red|blue|green|yellow|orange|purple|pink|gold|silver|white|black|grey|cyan|magenta|pastel|neon|monochrome|vibrant|warm|cool|earth tone)/gi,
  /(?:红色|蓝色|绿色|黄色|橙色|紫色|粉色|金色|银色|白色|黑色|灰色|青色|暖色|冷色|莫兰迪|马卡龙|渐变色|低饱和|高饱和)/gi,
];

const STYLE_PATTERNS = [
  /([\u4e00-\u9fff]*(?:风格|风|式|设计|design|style)[\u4e00-\u9fff]*)/gi,
  /(?:minimalist|minimal|modern|classic|vintage|retro|futuristic|abstract|geometric|organic|flat|3d|illustration|photo|realistic|cartoon|hand-drawn|sketch|watercolor|oil painting|digital art|vector)/gi,
  /(?:极简|简约|现代|经典|复古|未来|抽象|几何|扁平|立体|插画|照片|写实|卡通|手绘|素描|水彩|油画|数字艺术|矢量|国风|ins风|日式|北欧|工业风)/gi,
];

const MOOD_PATTERNS = [
  /(?:warm|cool|bright|dark|soft|bold|gentle|dramatic|calm|energetic|peaceful|luxurious|cozy|fresh|elegant|playful|serious|cheerful|melancholic|mysterious)/gi,
  /(?:温暖|明亮|暗调|柔和|大胆|温和|戏剧|平静|活力|宁静|奢华|温馨|清新|优雅|活泼|严肃|欢快|忧郁|神秘|高端|大气|小清新|文艺|质感)/gi,
];

const BRAND_PATTERNS = [
  /([\u4e00-\u9fff]*(?:品牌|logo|标识|视觉|形象|调性|定位|brand|identity)[\u4e00-\u9fff]*)/gi,
  /(?:premium|professional|trustworthy|friendly|youthful|mature|innovative|traditional|luxury|affordable|eco-friendly|sustainable|organic|natural|synthetic|clinical|medical|fun|educational)/gi,
  /(?:高端|专业|可信|友好|年轻|成熟|创新|传统|奢侈|亲民|环保|有机|天然|医用|趣味|教育|安全|健康|科技感|品质|匠心)/gi,
];

/**
 * Extract keywords matching patterns from text.
 */
function extractByPatterns(text: string, patterns: RegExp[]): string[] {
  const keywords = new Set<string>();

  for (const pattern of patterns) {
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const word = match[1] ?? match[0];
      if (word && word.trim().length >= 2 && word.trim().length <= 20) {
        keywords.add(word.trim());
      }
    }
  }

  return Array.from(keywords).slice(0, 8);
}

/**
 * Build search queries from user description.
 * Generates multiple queries targeting different aspects.
 */
export function buildSearchQueries(description: string): string[] {
  const desc = description.trim();
  if (!desc) return [];

  const queries: string[] = [];

  // Query 1: Original description + "brand design"
  queries.push(`${desc} 品牌设计`);

  // Query 2: Original description + "visual style"
  queries.push(`${desc} 视觉风格`);

  // Query 3: English version for broader results (if Chinese)
  if (/[\u4e00-\u9fff]/.test(desc)) {
    // Simple keyword extraction for English search
    const coreWords = desc
      .replace(/[，。、！？；：""''（）【】《》\s]+/g, ' ')
      .split(' ')
      .filter(w => w.length >= 2)
      .slice(0, 5)
      .join(' ');
    if (coreWords) {
      queries.push(`${coreWords} design style reference`);
    }
  }

  return queries;
}

/**
 * Call Google Custom Search API.
 * Returns search results (text + images).
 */
async function callGoogleSearch(
  query: string,
  searchType: 'web' | 'image' = 'web',
): Promise<SearchResult[]> {
  const key = getSearchApiKey();
  const cx = getSearchCx();

  if (!key || !cx) return [];

  const params = new URLSearchParams({
    key,
    cx,
    q: query,
    num: '6', // 6 results per query
  });

  if (searchType === 'image') {
    params.set('searchType', 'image');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
    );

    if (!response.ok) {
      console.warn(`[WebSearch] Search API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) return [];

    return data.items.map((item: Record<string, unknown>) => {
      const result: SearchResult = {
        title: (item.title as string) ?? '',
        snippet: (item.snippet as string) ?? '',
        link: (item.link as string) ?? '',
        context: (item.displayLink as string) ?? '',
      };

      // Image-specific fields
      if (item.image) {
        const img = item.image as Record<string, unknown>;
        result.thumbnailUrl = (img.thumbnailLink as string) ?? undefined;
        result.imageUrl = (img.contextLink as string) ?? (item.link as string);
        result.imageWidth = (img.width as number) ?? undefined;
        result.imageHeight = (img.height as number) ?? undefined;
      }

      // Page map image (for web search results that have thumbnails)
      if (item.pagemap?.cse_thumbnail?.[0]) {
        const thumb = item.pagemap.cse_thumbnail[0] as Record<string, string>;
        result.thumbnailUrl = thumb.src ?? undefined;
      }

      return result;
    });
  } catch (err) {
    console.warn('[WebSearch] Search request failed:', err);
    return [];
  }
}

/**
 * Search the web for brand and style references.
 * Combines text search and image search results.
 */
export async function searchReferences(
  description: string,
): Promise<{ webResults: SearchResult[]; imageResults: SearchResult[] }> {
  const queries = buildSearchQueries(description);

  // Run all searches in parallel
  const searchPromises = queries.flatMap((query) => [
    callGoogleSearch(query, 'web'),
    callGoogleSearch(query, 'image'),
  ]);

  const results = await Promise.all(searchPromises);

  // Merge and deduplicate
  const webResults = mergeAndDedup(
    results.filter((_, i) => i % 2 === 0).flat(),
  );
  const imageResults = mergeAndDedup(
    results.filter((_, i) => i % 2 === 1).flat(),
  );

  return {
    webResults: webResults.slice(0, 10),
    imageResults: imageResults.slice(0, 9),
  };
}

/**
 * Merge search results and deduplicate by link URL.
 */
function mergeAndDedup(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.link)) return false;
    seen.add(r.link);
    return true;
  });
}

/**
 * Extract style context from search results.
 * Analyzes titles, snippets, and descriptions to find style keywords.
 */
export function extractStyleContext(
  webResults: SearchResult[],
  imageResults: SearchResult[],
): StyleContext {
  // Combine all text from search results
  const allText = [...webResults, ...imageResults]
    .map((r) => `${r.title} ${r.snippet} ${r.context ?? ''}`)
    .join(' ');

  const colorKeywords = extractByPatterns(allText, COLOR_PATTERNS);
  const styleKeywords = extractByPatterns(allText, STYLE_PATTERNS);
  const moodKeywords = extractByPatterns(allText, MOOD_PATTERNS);
  const brandKeywords = extractByPatterns(allText, BRAND_PATTERNS);

  // Build enhancement text
  const parts: string[] = [];

  if (colorKeywords.length > 0) {
    parts.push(`Color palette: ${colorKeywords.join(', ')}`);
  }
  if (styleKeywords.length > 0) {
    parts.push(`Design style: ${styleKeywords.join(', ')}`);
  }
  if (moodKeywords.length > 0) {
    parts.push(`Mood: ${moodKeywords.join(', ')}`);
  }
  if (brandKeywords.length > 0) {
    parts.push(`Brand tone: ${brandKeywords.join(', ')}`);
  }

  const enhancementText = parts.length > 0 ? parts.join('. ') : '';

  return {
    colorKeywords,
    styleKeywords,
    moodKeywords,
    brandKeywords,
    enhancementText,
  };
}

/**
 * Build an enhanced prompt by combining original prompt with search-derived style context.
 */
export function buildEnhancedPrompt(
  originalPrompt: string,
  styleContext: StyleContext,
): string {
  if (!styleContext.enhancementText) return originalPrompt;

  return `${originalPrompt}. ${styleContext.enhancementText}`;
}
