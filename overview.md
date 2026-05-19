# PromptCraft — 图片提示词生成器

## 项目概述
PromptCraft 是一个纯前端图片生成提示词工具，用户输入图片描述、尺寸、场景、风格等信息，自动生成适用于 Midjourney、DALL-E、Stable Diffusion 的精准提示词，并支持 AI 直接生成图片。

## 技术栈
- Vite 5 + React 18 + TypeScript 5
- MUI 5 组件库 + Tailwind CSS 3
- 纯前端实现，无后端依赖
- AI 图片生成：Pollinations.ai（免费、无需 API Key）

## 核心功能
1. **多维度输入**：图片描述、双模式尺寸（数字像素+印刷mm，含10种印刷预设）、应用场景（15种）、艺术风格（14种多选）、参考图片上传、负面提示词
2. **四种格式输出**：Midjourney（含 --ar/--v/--no 参数）、DALL-E（自然语言）、Stable Diffusion（含 Negative prompt + 采样参数）、印刷版（含印刷规格+场景适配）
3. **AI 直接生图**：第5个 Tab「AI生图」，基于 DALL-E 格式提示词通过 Pollinations.ai 直接生成图片，支持下载和换一张
4. **交互功能**：一键复制、提示词可编辑、重新生成（随机变化词）、亮/暗主题切换
5. **UI设计**：毛玻璃效果、左右分栏（desktop）/ 上下布局（mobile）、响应式

## 质量验证
- 135 个单元测试全部通过
- TypeScript 类型检查无错误
- 生产构建成功
- QA 回归验证 IS_PASS: YES

## 启动方式
```bash
cd C:\Users\oholv-066\WorkBuddy\2026-05-18-task-1
npm run dev
```

## 项目结构
```
src/
├── main.tsx              # React 入口
├── App.tsx               # 主组件（主题切换 + 状态管理 + 生成逻辑 + 尺寸计算）
├── index.css             # 全局样式（毛玻璃、动画背景）
├── theme.ts              # MUI 亮/暗主题
├── types.ts              # TypeScript 类型定义
├── utils/
│   ├── promptGenerator.ts  # 核心提示词生成引擎
│   └── imageGenerator.ts   # AI 图片生成工具（Pollinations.ai）
├── components/
│   ├── Header.tsx        # 顶部导航 + 主题切换
│   ├── InputPanel.tsx    # 左侧输入面板
│   ├── OutputPanel.tsx   # 右侧输出面板（5个Tab含AI生图）
│   ├── SizeSelector.tsx  # 双模式尺寸选择器
│   ├── StyleSelector.tsx # 风格选择器
│   ├── SceneSelector.tsx # 场景选择器
│   └── ImageUploader.tsx # 图片上传器
├── data/
│   ├── sizes.ts          # 数字尺寸预设数据
│   ├── printSizes.ts     # 印刷尺寸预设数据
│   ├── styles.ts         # 风格数据 + 质量词映射
│   └── scenes.ts         # 场景数据 + 变化词
└── __tests__/
    ├── promptGenerator.test.ts  # 87 个单元测试
    └── qa-verification.test.ts  # 48 个QA验证测试
```
