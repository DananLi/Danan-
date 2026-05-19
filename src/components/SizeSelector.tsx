import React from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, TextField, Tooltip } from '@mui/material';
import { sizePresets } from '../data/sizes';
import { printSizePresets } from '../data/printSizes';
import { SizeMode } from '../types';

interface SizeSelectorProps {
  isDark: boolean;
  sizeMode: SizeMode;
  selectedSize: string;
  customWidth: number;
  customHeight: number;
  selectedPrintSize: string;
  customPrintWidth: number;
  customPrintHeight: number;
  onSizeModeChange: (mode: SizeMode) => void;
  onSizeChange: (size: string) => void;
  onCustomWidthChange: (width: number) => void;
  onCustomHeightChange: (height: number) => void;
  onPrintSizeChange: (size: string) => void;
  onCustomPrintWidthChange: (width: number) => void;
  onCustomPrintHeightChange: (height: number) => void;
}

/** Toggle button styling shared across both mode sections */
const toggleButtonSx = (isDark: boolean) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.75,
  '& .MuiToggleButtonGroup-grouped': {
    border: isDark
      ? '1px solid rgba(255,255,255,0.1)'
      : '1px solid rgba(0,0,0,0.1)',
    borderRadius: '8px !important',
    mr: '0 !important',
    ml: '0 !important',
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    '&.Mui-selected': {
      bgcolor: 'rgba(102,126,234,0.15)',
      color: '#667eea',
      borderColor: 'rgba(102,126,234,0.5)',
      '&:hover': {
        bgcolor: 'rgba(102,126,234,0.25)',
      },
    },
    '&:hover': {
      bgcolor: isDark
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.03)',
    },
  },
});

/** Size preset selector with digital/print mode switching */
const SizeSelector: React.FC<SizeSelectorProps> = ({
  isDark,
  sizeMode,
  selectedSize,
  customWidth,
  customHeight,
  selectedPrintSize,
  customPrintWidth,
  customPrintHeight,
  onSizeModeChange,
  onSizeChange,
  onCustomWidthChange,
  onCustomHeightChange,
  onPrintSizeChange,
  onCustomPrintWidthChange,
  onCustomPrintHeightChange,
}) => {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1.5,
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          fontWeight: 600,
        }}
      >
        尺寸选择
      </Typography>

      {/* Mode toggle: 数字尺寸 / 印刷尺寸 */}
      <ToggleButtonGroup
        value={sizeMode}
        exclusive
        onChange={(_, value) => {
          if (value !== null) {
            onSizeModeChange(value);
          }
        }}
        size="small"
        sx={{
          mb: 2,
          '& .MuiToggleButtonGroup-grouped': {
            border: isDark
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '8px !important',
            mr: '0 !important',
            ml: '0 !important',
            px: 2,
            py: 0.5,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            fontSize: '0.8rem',
            fontWeight: 600,
            '&.Mui-selected': {
              bgcolor: 'rgba(255,152,0,0.15)',
              color: '#ff9800',
              borderColor: 'rgba(255,152,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(255,152,0,0.25)',
              },
            },
            '&:hover': {
              bgcolor: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.03)',
            },
          },
        }}
      >
        <ToggleButton value="digital">数字尺寸</ToggleButton>
        <ToggleButton value="print">印刷尺寸</ToggleButton>
      </ToggleButtonGroup>

      {/* Digital size mode */}
      {sizeMode === 'digital' && (
        <>
          <ToggleButtonGroup
            value={selectedSize}
            exclusive
            onChange={(_, value) => {
              if (value !== null) {
                onSizeChange(value);
              }
            }}
            sx={toggleButtonSx(isDark)}
          >
            {sizePresets.map((preset) => (
              <Tooltip key={preset.label} title={preset.description} arrow>
                <ToggleButton value={preset.label} sx={{ px: 1.5, py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {preset.label}
                  </Typography>
                </ToggleButton>
              </Tooltip>
            ))}
            <ToggleButton value="custom" sx={{ px: 1.5, py: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                自定义
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          {selectedSize === 'custom' && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mt: 2,
                alignItems: 'center',
              }}
            >
              <TextField
                label="宽度 (px)"
                type="number"
                size="small"
                value={customWidth}
                onChange={(e) => onCustomWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 4096 }}
                sx={{ flex: 1 }}
              />
              <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                ×
              </Typography>
              <TextField
                label="高度 (px)"
                type="number"
                size="small"
                value={customHeight}
                onChange={(e) => onCustomHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 4096 }}
                sx={{ flex: 1 }}
              />
            </Box>
          )}
        </>
      )}

      {/* Print size mode */}
      {sizeMode === 'print' && (
        <>
          <ToggleButtonGroup
            value={selectedPrintSize}
            exclusive
            onChange={(_, value) => {
              if (value !== null) {
                onPrintSizeChange(value);
              }
            }}
            sx={toggleButtonSx(isDark)}
          >
            {printSizePresets.map((preset) => (
              <Tooltip key={preset.key} title={preset.description} arrow>
                <ToggleButton value={preset.key} sx={{ px: 1.5, py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {preset.label}
                  </Typography>
                </ToggleButton>
              </Tooltip>
            ))}
            <ToggleButton value="custom" sx={{ px: 1.5, py: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                自定义
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          {selectedPrintSize === 'custom' && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mt: 2,
                alignItems: 'center',
              }}
            >
              <TextField
                label="宽度 (mm)"
                type="number"
                size="small"
                value={customPrintWidth}
                onChange={(e) => onCustomPrintWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                sx={{ flex: 1 }}
              />
              <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                ×
              </Typography>
              <TextField
                label="高度 (mm)"
                type="number"
                size="small"
                value={customPrintHeight}
                onChange={(e) => onCustomPrintHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                sx={{ flex: 1 }}
              />
            </Box>
          )}

          {/* Print size hint */}
          {selectedPrintSize !== 'custom' && (
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                display: 'block',
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
              }}
            >
              {(() => {
                const preset = printSizePresets.find((p) => p.key === selectedPrintSize);
                return preset
                  ? `${preset.width}×${preset.height}mm — ${preset.description}`
                  : '';
              })()}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default SizeSelector;
