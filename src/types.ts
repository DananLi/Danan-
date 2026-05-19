/** Size mode: digital (pixels) or print (mm) */
export type SizeMode = 'digital' | 'print';

/** Volcengine API model definition */
export interface VolcModel {
  /** Model ID for API call */
  id: string;
  /** Display label */
  label: string;
  /** Description */
  description: string;
  /** Max resolution tier */
  maxResolution: '1K' | '2K' | '3K' | '4K';
}

/** User input for image generation */
export interface PromptInput {
  /** Image description (required) */
  description: string;
  /** Selected size preset key, e.g. "1:1", "16:9", or "custom" */
  size: string;
  /** Custom width when size is "custom" */
  customWidth: number;
  /** Custom height when size is "custom" */
  customHeight: number;
  /** Application scene key, e.g. "social_avatar" */
  scene: string;
  /** Size mode: digital (pixels) or print (mm) */
  sizeMode: SizeMode;
  /** Selected print size preset key, e.g. "A4", "A3", or "custom" */
  printSize: string;
  /** Custom print width in mm when printSize is "custom" */
  customPrintWidth: number;
  /** Custom print height in mm when printSize is "custom" */
  customPrintHeight: number;
  /** Selected Volcengine model ID */
  model: string;
}

/** Generated image result */
export interface ImageResult {
  /** URL of the generated image */
  url: string;
  /** Width of the generated image */
  width: number;
  /** Height of the generated image */
  height: number;
  /** Model used for generation */
  model: string;
  /** Timestamp of generation */
  created: number;
}

/** Size preset definition */
export interface SizePreset {
  /** Display label, e.g. "1:1" */
  label: string;
  /** Aspect ratio string for Midjourney */
  ratio: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Description */
  description: string;
}

/** Print size preset definition (for printing scenarios) */
export interface PrintSizePreset {
  /** Unique key, e.g. "A4", "business_card" */
  key: string;
  /** Display label, e.g. "A4" */
  label: string;
  /** Width in mm */
  width: number;
  /** Height in mm */
  height: number;
  /** Description of typical usage */
  description: string;
}

/** Scene definition */
export interface SceneOption {
  /** Unique key */
  key: string;
  /** Display label in Chinese */
  label: string;
  /** English keywords added to prompt for this scene */
  keywords: string[];
  /** Emoji icon */
  icon: string;
}

/** API configuration stored in localStorage */
export interface ApiConfig {
  /** Volcengine API Key */
  apiKey: string;
  /** Volcengine model endpoint ID */
  modelEndpoint: string;
}

/** A single search result item from web search */
export interface SearchResult {
  /** Title of the result */
  title: string;
  /** Snippet / description */
  snippet: string;
  /** URL of the result page */
  link: string;
  /** Thumbnail image URL (if available) */
  thumbnailUrl?: string;
  /** Full-size image URL (if available) */
  imageUrl?: string;
  /** Image width (if available) */
  imageWidth?: number;
  /** Image height (if available) */
  imageHeight?: number;
  /** Source context / display link */
  context?: string;
}

/** Extracted style context from search results */
export interface StyleContext {
  /** Color palette keywords extracted from search results */
  colorKeywords: string[];
  /** Design style keywords (e.g., minimalist, vibrant) */
  styleKeywords: string[];
  /** Mood / atmosphere keywords (e.g., warm, professional) */
  moodKeywords: string[];
  /** Brand attribute keywords (e.g., premium, playful) */
  brandKeywords: string[];
  /** Combined enhancement text to append to the original prompt */
  enhancementText: string;
}
