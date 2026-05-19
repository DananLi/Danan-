import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Slide,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { ImageResult } from '../types';
import {
  generateImageWithFallback,
  downloadImage,
  isQuotaExhausted,
  FallbackResult,
} from '../utils/imageGenerator';
import { volcModels } from '../data/volcModels';

interface OutputPanelProps {
  isDark: boolean;
  /** Prompt text to generate image from */
  prompt: string;
  /** Image width in pixels */
  imageWidth: number;
  /** Image height in pixels */
  imageHeight: number;
  /** Selected model ID */
  model: string;
  /** Callback to switch model (from parent) */
  onModelChange: (model: string) => void;
  /** Callback to regenerate (re-trigger from parent) */
  onRegenerate: () => void;
}

/** Right panel displaying generated image */
const OutputPanel: React.FC<OutputPanelProps> = ({
  isDark,
  prompt,
  imageWidth,
  imageHeight,
  model,
  onModelChange,
  onRegenerate,
}) => {
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<FallbackResult | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [allQuotaExhausted, setAllQuotaExhausted] = useState(false);

  /** Handle image generation with automatic model fallback */
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setGenLoading(true);
    setGenError(null);
    setGenResult(null);
    setAllQuotaExhausted(false);

    try {
      const result = await generateImageWithFallback(prompt, imageWidth, imageHeight, model);
      setGenResult(result);

      // If fallback occurred, update the parent's model to the one that actually worked
      if (result.fellBack && result.model !== model) {
        onModelChange(result.model);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '图片生成失败';
      setGenError(message);

      // Check if ALL models exhausted
      if (message.includes('所有模型免费额度均已用尽')) {
        setAllQuotaExhausted(true);
      }
    } finally {
      setGenLoading(false);
    }
  }, [prompt, imageWidth, imageHeight, model, onModelChange]);

  /** Handle switching to next available model */
  const handleSwitchModel = useCallback(() => {
    const currentIndex = volcModels.findIndex((m) => m.id === model);
    const nextIndex = (currentIndex + 1) % volcModels.length;
    onModelChange(volcModels[nextIndex].id);
  }, [model, onModelChange]);

  /** Handle image download */
  const handleDownload = useCallback(() => {
    if (!genResult) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadImage(genResult.url, `promptcraft-${timestamp}.png`);
  }, [genResult]);

  /** Open image in new tab */
  const handleOpenInNew = useCallback(() => {
    if (genResult) window.open(genResult.url, '_blank');
  }, [genResult]);

  /** Copy prompt text */
  const handleCopyPrompt = useCallback(async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }
  }, [prompt]);

  /** Get display label for a model ID */
  const getModelLabel = (modelId: string): string => {
    return volcModels.find((m) => m.id === modelId)?.label ?? modelId;
  };

  /** Empty state - no prompt yet */
  if (!prompt) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark
              ? 'rgba(233,30,99,0.1)'
              : 'rgba(233,30,99,0.05)',
          }}
        >
          <Typography sx={{ fontSize: 40 }}>✨</Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            textAlign: 'center',
          }}
        >
          填写左侧表单后点击生成
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
            textAlign: 'center',
          }}
        >
          基于火山引擎 AI 直接生成图片
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Header with actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            fontWeight: 600,
          }}
        >
          AI 生成结果
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="复制提示词">
            <IconButton
              size="small"
              onClick={handleCopyPrompt}
              sx={{
                color: promptCopied ? '#4caf50' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease',
              }}
            >
              {promptCopied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Generate button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleGenerate}
        disabled={genLoading}
        startIcon={genLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <AutoAwesomeIcon />}
        sx={{
          background: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 50%, #673ab7 100%)',
          color: '#fff',
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          boxShadow: '0 4px 20px rgba(233,30,99,0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d81b60 0%, #8e24aa 50%, #5e35b1 100%)',
            boxShadow: '0 6px 28px rgba(233,30,99,0.5)',
          },
          '&:disabled': {
            background: isDark ? 'rgba(233,30,99,0.3)' : 'rgba(233,30,99,0.2)',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)',
          },
          transition: 'all 0.3s ease',
          mb: 2,
        }}
      >
        {genLoading ? 'AI 生成中...' : '生成图片'}
      </Button>

      {/* Auto-fallback notice */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.3,
          mb: 1.5,
          borderRadius: 1,
          bgcolor: isDark ? 'rgba(33,150,243,0.06)' : 'rgba(33,150,243,0.04)',
          border: isDark ? '1px solid rgba(33,150,243,0.12)' : '1px solid rgba(33,150,243,0.08)',
        }}
      >
        <SwapHorizIcon sx={{ fontSize: 14, color: '#2196f3' }} />
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
            fontSize: '0.7rem',
          }}
        >
          额度用尽时自动切换模型（{volcModels.map((m) => m.label).join(' → ')}）
        </Typography>
      </Box>

      {/* Prompt info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: isDark ? 'rgba(233,30,99,0.06)' : 'rgba(233,30,99,0.04)',
          border: isDark ? '1px solid rgba(233,30,99,0.12)' : '1px solid rgba(233,30,99,0.08)',
          mb: 2,
        }}
      >
        <ImageIcon sx={{ fontSize: 16, color: '#e91e63' }} />
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            fontSize: '0.72rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {prompt.length > 80 ? `${prompt.slice(0, 80)}...` : prompt}
        </Typography>
      </Box>

      {/* Loading state */}
      {genLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <LinearProgress
            sx={{
              borderRadius: 1,
              height: 4,
              bgcolor: isDark ? 'rgba(233,30,99,0.1)' : 'rgba(233,30,99,0.06)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #e91e63, #9c27b0, #673ab7)',
                borderRadius: 1,
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              gap: 2,
            }}
          >
            <CircularProgress size={48} sx={{ color: '#e91e63' }} />
            <Typography
              variant="body2"
              sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
            >
              AI 正在创作中，请稍候（约15-60秒）...
            </Typography>
          </Box>
        </Box>
      )}

      {/* All models quota exhausted warning */}
      {allQuotaExhausted && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ borderRadius: 2, mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleGenerate}>
              重试
            </Button>
          }
        >
          所有模型免费额度均已用尽，请稍后重试
        </Alert>
      )}

      {/* Fallback success notice */}
      {genResult?.fellBack && !genLoading && (
        <Slide direction="down" in mountOnEnter unmountOnExit>
          <Alert
            severity="info"
            variant="filled"
            sx={{ borderRadius: 2, mb: 2 }}
            icon={<SwapHorizIcon />}
          >
            {getModelLabel(genResult.originalModel)} 额度已用尽，已自动切换至 {getModelLabel(genResult.model)}
          </Alert>
        </Slide>
      )}

      {/* Error state (non-quota errors) */}
      {genError && !allQuotaExhausted && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ borderRadius: 2, mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleGenerate}>
              重试
            </Button>
          }
        >
          {genError}
        </Alert>
      )}

      {/* Generated image display */}
      {genResult && !genLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
          {/* Image container */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              border: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(233,30,99,0.15)',
              '& img': {
                width: '100%',
                display: 'block',
              },
            }}
          >
            <img
              src={genResult.url}
              alt="AI Generated"
            />
          </Box>

          {/* Image info chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            <Chip
              size="small"
              label={`${genResult.width}×${genResult.height}`}
              sx={{
                bgcolor: isDark ? 'rgba(233,30,99,0.1)' : 'rgba(233,30,99,0.06)',
                color: '#e91e63',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
            <Chip
              size="small"
              label={getModelLabel(genResult.model)}
              sx={{
                bgcolor: isDark ? 'rgba(156,39,176,0.1)' : 'rgba(156,39,176,0.06)',
                color: '#9c27b0',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
            <Chip
              size="small"
              label="火山引擎"
              sx={{
                bgcolor: isDark ? 'rgba(103,58,183,0.1)' : 'rgba(103,58,183,0.06)',
                color: '#673ab7',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                flex: 1,
                background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d81b60, #8e24aa)',
                },
              }}
            >
              下载图片
            </Button>
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={handleOpenInNew}
              sx={{
                flex: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#e91e63',
                  color: '#e91e63',
                  bgcolor: 'rgba(233,30,99,0.05)',
                },
              }}
            >
              查看大图
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleGenerate}
              sx={{
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  bgcolor: 'rgba(156,39,176,0.05)',
                },
              }}
            >
              换一张
            </Button>
          </Box>
        </Box>
      )}

      {/* Empty state - prompt exists but no image generated yet */}
      {!genResult && !genLoading && !genError && prompt && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            gap: 1.5,
            flex: 1,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark
                ? 'rgba(233,30,99,0.1)'
                : 'rgba(233,30,99,0.05)',
            }}
          >
            <ImageIcon sx={{ fontSize: 32, color: '#e91e63' }} />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              textAlign: 'center',
            }}
          >
            点击「生成图片」按钮，AI 将基于描述直接出图
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
              textAlign: 'center',
            }}
          >
            由火山引擎 Seedream 提供支持
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OutputPanel;
