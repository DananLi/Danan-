import { PrintSizePreset } from '../types';

/** Predefined print size presets for printing scenarios (mm) */
export const printSizePresets: PrintSizePreset[] = [
  {
    key: 'A0',
    label: 'A0',
    width: 841,
    height: 1189,
    description: '展会背景墙/大型海报',
  },
  {
    key: 'A1',
    label: 'A1',
    width: 594,
    height: 841,
    description: '展会海报/KV主视觉',
  },
  {
    key: 'A2',
    label: 'A2',
    width: 420,
    height: 594,
    description: '展会海报/宣传画',
  },
  {
    key: 'A3',
    label: 'A3',
    width: 297,
    height: 420,
    description: '展架/小型海报',
  },
  {
    key: 'A4',
    label: 'A4',
    width: 210,
    height: 297,
    description: '宣传单页/手册封面',
  },
  {
    key: 'A5',
    label: 'A5',
    width: 148,
    height: 210,
    description: '折页/传单',
  },
  {
    key: 'A6',
    label: 'A6',
    width: 105,
    height: 148,
    description: '明信片/邀请函',
  },
  {
    key: 'business_card',
    label: '名片',
    width: 90,
    height: 54,
    description: '商务名片',
  },
  {
    key: 'x_banner',
    label: 'X展架',
    width: 600,
    height: 1600,
    description: 'X展架 (60×160cm)',
  },
  {
    key: 'roll_up',
    label: '易拉宝',
    width: 850,
    height: 2000,
    description: '易拉宝 (85×200cm)',
  },
];
