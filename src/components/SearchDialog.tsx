import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  Alert,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { SearchResult, StyleContext } from '../types';
import {
  searchReferences,
  extractStyleContext,
  buildEnhancedPrompt,
  isSearchConfigured,
} from '../utils/webSearch';

interface SearchDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** The user's original description */
  description: string;
  /** Callback when user confirms using the enhanced prompt */
  onConfirm: (enhancedPrompt: string, styleContext: StyleContext) => void;
  /** Dark mode flag */
  isDark: boolean;
}

/** Modal dialog for web search references and prompt enhancement */
const SearchDialog: React.FC<SearchDialogProps> = ({
  open,
  onClose,
  description,
  onConfirm,
  isDark,
}) => {
  const [loading, setLoading] = useState(false);
  const [webResults, setWebResults] = useState<SearchResult[]>([]);
  const [imageResults, setImageResults] = useState<SearchResult[]>([]);
  const [styleContext, setStyleContext] = useState<StyleContext | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchDone, setSearchDone] = useState(false);

  /** Run search when dialog opens with a description */
  const doSearch = useCallback(async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setSearchDone(false);
    setWebResults([]);
    setImageResults([]);
    setStyleContext(null);
    setEnhancedPrompt('');

    try {
      const { webResults: web, imageResults: img } = await searchReferences(description);
      setWebResults(web);
      setImageResults(img);

      // Extract style keywords
      const ctx = extractStyleContext(web, img);
      setStyleContext(ctx);

      // Build enhanced prompt
      const basePrompt = description.trim();
      const enhanced = buildEnhancedPrompt(basePrompt, ctx);
      setEnhancedPrompt(enhanced);
      setSearchDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '搜索失败，请重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [description]);

  /** Trigger search when dialog opens */
  useEffect(() => {
    if (open && description.trim()) {
      doSearch();
    }
  }, [open, description, doSearch]);

  /** Handle confirm */
  const handleConfirm = () => {
    if (styleContext && enhancedPrompt) {
      onConfirm(enhancedPrompt, styleContext);
    }
    onClose();
  };

  /** Handle skip (use original prompt) */
  const handleSkip = () => {
    onClose();
  };

  const apiConfigured = isSearchConfigured();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#1a1a2e' : '#fff',
          color: isDark ? '#e0e0e0' : '#333',
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon sx={{ color: '#e91e63' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            搜索品牌与风格参考
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* API not configured warning */}
        {!apiConfigured && (
          <Alert
            severity="warning"
            variant="filled"
            sx={{ borderRadius: 2, mb: 2 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              搜索功能需要配置 Google Custom Search API
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              1. 前往{' '}
              <a href="https://console.cloud.google.com/apis/library/customsearch" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Google Cloud Console
              </a>{' '}
              启用 Custom Search API 并创建 API Key
              <br />
              2. 前往{' '}
              <a href="https://programmablesearchengine.google.com/" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Programmable Search Engine
              </a>{' '}
              创建搜索引擎，选择「搜索整个网络」，开启图片搜索
              <br />
              3. 在 .env 文件中设置 VITE_GOOGLE_SEARCH_KEY 和 VITE_GOOGLE_SEARCH_CX
            </Typography>
          </Alert>
        )}

        {/* Search query display */}
        <Box
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(233,30,99,0.06)' : 'rgba(233,30,99,0.04)',
            border: isDark ? '1px solid rgba(233,30,99,0.12)' : '1px solid rgba(233,30,99,0.08)',
          }}
        >
          <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', mb: 0.5, display: 'block' }}>
            搜索关键词
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#e0e0e0' : '#333' }}>
            {description}
          </Typography>
        </Box>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
            <CircularProgress size={48} sx={{ color: '#e91e63' }} />
            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              正在搜索品牌与风格参考...
            </Typography>
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Alert severity="error" variant="filled" sx={{ borderRadius: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search results */}
        {searchDone && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Reference images grid */}
            {imageResults.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  参考图片
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                  }}
                >
                  {imageResults.map((img, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: 'relative',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                        aspectRatio: '4/3',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.85 },
                        transition: 'opacity 0.2s',
                      }}
                      onClick={() => img.imageUrl && window.open(img.imageUrl, '_blank')}
                    >
                      {img.thumbnailUrl ? (
                        <img
                          src={img.thumbnailUrl}
                          alt={img.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          }}
                        >
                          <SearchIcon />
                        </Box>
                      )}
                      {/* Overlay with title */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 0.5,
                          bgcolor: 'rgba(0,0,0,0.6)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#fff',
                            fontSize: '0.6rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {img.title}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Web search results */}
            {webResults.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  相关网页
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {webResults.slice(0, 5).map((result, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: '#2196f3', fontSize: '0.65rem', cursor: 'pointer' }}
                          onClick={() => window.open(result.link, '_blank')}
                        >
                          {result.context}
                        </Typography>
                        <OpenInNewIcon sx={{ fontSize: 10, color: '#2196f3' }} />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                          fontSize: '0.8rem',
                          mb: 0.3,
                          cursor: 'pointer',
                          '&:hover': { color: '#2196f3' },
                        }}
                        onClick={() => window.open(result.link, '_blank')}
                      >
                        {result.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                          fontSize: '0.7rem',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {result.snippet}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Extracted style keywords */}
            {styleContext && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                  <AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle', color: '#e91e63' }} />
                  提取的风格关键词
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Color keywords */}
                  {styleContext.colorKeywords.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', minWidth: 40 }}>
                        配色
                      </Typography>
                      {styleContext.colorKeywords.map((kw, i) => (
                        <Chip key={i} label={kw} size="small" sx={{ bgcolor: 'rgba(233,30,99,0.1)', color: '#e91e63', fontSize: '0.7rem', fontWeight: 600 }} />
                      ))}
                    </Box>
                  )}
                  {/* Style keywords */}
                  {styleContext.styleKeywords.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', minWidth: 40 }}>
                        风格
                      </Typography>
                      {styleContext.styleKeywords.map((kw, i) => (
                        <Chip key={i} label={kw} size="small" sx={{ bgcolor: 'rgba(156,39,176,0.1)', color: '#9c27b0', fontSize: '0.7rem', fontWeight: 600 }} />
                      ))}
                    </Box>
                  )}
                  {/* Mood keywords */}
                  {styleContext.moodKeywords.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', minWidth: 40 }}>
                        氛围
                      </Typography>
                      {styleContext.moodKeywords.map((kw, i) => (
                        <Chip key={i} label={kw} size="small" sx={{ bgcolor: 'rgba(103,58,183,0.1)', color: '#673ab7', fontSize: '0.7rem', fontWeight: 600 }} />
                      ))}
                    </Box>
                  )}
                  {/* Brand keywords */}
                  {styleContext.brandKeywords.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', minWidth: 40 }}>
                        品牌
                      </Typography>
                      {styleContext.brandKeywords.map((kw, i) => (
                        <Chip key={i} label={kw} size="small" sx={{ bgcolor: 'rgba(33,150,243,0.1)', color: '#2196f3', fontSize: '0.7rem', fontWeight: 600 }} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* No results */}
            {searchDone && imageResults.length === 0 && webResults.length === 0 && (
              <Alert severity="info" variant="filled" sx={{ borderRadius: 2 }}>
                未找到相关参考，将使用原始描述生成
              </Alert>
            )}

            {/* Enhanced prompt preview */}
            {styleContext && styleContext.enhancementText && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    增强后的提示词
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={8}
                  value={enhancedPrompt}
                  onChange={(e) => setEnhancedPrompt(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                      color: isDark ? '#e0e0e0' : '#333',
                      fontSize: '0.85rem',
                      '& fieldset': {
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(102,126,234,0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Button
          onClick={handleSkip}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          }}
        >
          跳过，使用原始描述
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!searchDone || loading}
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          sx={{
            background: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 50%, #673ab7 100%)',
            color: '#fff',
            fontWeight: 700,
            px: 3,
            '&:disabled': {
              background: isDark ? 'rgba(233,30,99,0.3)' : 'rgba(233,30,99,0.2)',
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)',
            },
          }}
        >
          使用增强提示词生成
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;
