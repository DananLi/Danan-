import { SizePreset } from '../types';

/** Predefined size presets for image generation */
export const sizePresets: SizePreset[] = [
  {
    label: '1:1',
    ratio: '1:1',
    width: 1024,
    height: 1024,
    description: '正方形，适合头像、社交媒体',
  },
  {
    label: '16:9',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    description: '横屏宽幅，适合博客封面、视频',
  },
  {
    label: '9:16',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: '竖屏，适合手机壁纸、Stories',
  },
  {
    label: '4:3',
    ratio: '4:3',
    width: 1024,
    height: 768,
    description: '传统横屏，适合演示文稿',
  },
  {
    label: '3:4',
    ratio: '3:4',
    width: 768,
    height: 1024,
    description: '传统竖屏，适合海报',
  },
  {
    label: '3:2',
    ratio: '3:2',
    width: 1440,
    height: 960,
    description: '经典摄影比例，横屏',
  },
  {
    label: '2:3',
    ratio: '2:3',
    width: 960,
    height: 1440,
    description: '经典摄影比例，竖屏',
  },
];
