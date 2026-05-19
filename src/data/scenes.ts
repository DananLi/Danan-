import { SceneOption } from '../types';

/** Available application scenes for prompt generation */
export const sceneOptions: SceneOption[] = [
  {
    key: 'social_avatar',
    label: '社交媒体头像',
    keywords: ['portrait', 'centered composition', 'clean background', 'eye-catching'],
    icon: '👤',
  },
  {
    key: 'social_post',
    label: '社交媒体帖子',
    keywords: ['eye-catching', 'vibrant', 'engaging', 'share-worthy', 'trending aesthetic'],
    icon: '📱',
  },
  {
    key: 'blog_cover',
    label: '博客封面',
    keywords: ['editorial', 'clean layout', 'professional', 'inviting'],
    icon: '📝',
  },
  {
    key: 'ecommerce',
    label: '电商产品图',
    keywords: ['product photography', 'studio lighting', 'white background', 'commercial', 'professional product shot'],
    icon: '🛍️',
  },
  {
    key: 'ui_design',
    label: 'UI 设计稿',
    keywords: ['UI/UX', 'wireframe', 'clean interface', 'modern design', 'user-friendly'],
    icon: '🖥️',
  },
  {
    key: 'wallpaper',
    label: '壁纸',
    keywords: ['wallpaper', 'immersive', 'full frame', 'atmospheric', 'stunning visual'],
    icon: '🖼️',
  },
  {
    key: 'poster',
    label: '海报',
    keywords: ['poster design', 'bold typography', 'graphic design', 'eye-catching', 'large format'],
    icon: '🎬',
  },
  {
    key: 'icon_logo',
    label: '图标/Logo',
    keywords: ['icon design', 'logo', 'simple shape', 'scalable', 'recognizable', 'vector style'],
    icon: '✨',
  },
  {
    key: 'illustration',
    label: '插画',
    keywords: ['illustration', 'artistic', 'creative', 'storytelling', 'expressive'],
    icon: '🎭',
  },
  {
    key: 'other',
    label: '其他',
    keywords: ['versatile', 'high quality', 'adaptable'],
    icon: '🎯',
  },
  {
    key: 'exhibition_kv',
    label: '展会KV主视觉',
    keywords: ['exhibition key visual', 'large format', 'bold visual impact', 'brand identity', 'wide viewing distance'],
    icon: '🏛️',
  },
  {
    key: 'exhibition_booth',
    label: '展位设计',
    keywords: ['exhibition booth design', 'spatial graphic', 'backwall design', 'brand showcase', 'booth graphic'],
    icon: '🎪',
  },
  {
    key: 'print_flyer',
    label: '宣传物料',
    keywords: ['flyer design', 'brochure', 'promotional material', 'information layout', 'print design'],
    icon: '📄',
  },
  {
    key: 'packaging',
    label: '包装设计',
    keywords: ['packaging design', 'product box', 'label design', 'shelf appeal', 'die-cut template'],
    icon: '📦',
  },
  {
    key: 'banner_standee',
    label: '展架/易拉宝',
    keywords: ['roll-up banner', 'standee design', 'vertical format', 'eye-level readability', 'promotional display'],
    icon: '🪧',
  },
];

/** Random variation words for the "Regenerate" feature */
export const variationWords: string[] = [
  'cinematic lighting',
  'golden hour',
  'dramatic shadows',
  'soft glow',
  'ambient light',
  'volumetric fog',
  'depth of field',
  'lens flare',
  'moody atmosphere',
  'ethereal',
  'dreamlike',
  'hyperrealistic',
  'ultra detailed',
  'breathtaking',
  'stunning composition',
  'award-winning',
  'trending on ArtStation',
  'unreal engine',
  'digital art',
  'concept art',
];
