import { VolcModel } from '../types';

/**
 * Available Volcengine image generation models.
 *
 * Model IDs are verified against the Ark API (ark.cn-beijing.volces.com).
 * When a model's free quota is exhausted, the system automatically switches
 * to the next model in this list.
 *
 * Last verified: 2026-05-19
 */
export const volcModels: VolcModel[] = [
  {
    id: 'doubao-seedream-4-5-251128',
    label: 'Seedream 4.5',
    description: '高品质版，支持2K/4K，多图融合，提示词优化',
    maxResolution: '4K',
  },
  {
    id: 'doubao-seedream-4-0-250828',
    label: 'Seedream 4.0',
    description: '经典版，支持2K/4K，多图融合',
    maxResolution: '4K',
  },
];

/** Resolution options per model tier */
export const resolutionOptions: Record<string, string[]> = {
  '2K': ['2048x2048', '2304x1728', '1728x2304', '2560x1440', '1440x2560', '2496x1664', '1664x2496', '3024x1296', '1296x3024'],
  '3K': ['3072x3072', '3456x2592', '2592x3456', '4096x2304', '2304x4096', '3744x2496', '2496x3744', '4704x2016', '2016x4704'],
  '4K': ['4096x4096', '4694x3520', '3520x4694', '4992x3328', '3328x4992', '5404x3040', '3040x5404', '6198x2656', '2656x6198'],
};
