import React from 'react';
import { Box, Typography, Chip, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import { sceneOptions } from '../data/scenes';
import { volcModels } from '../data/volcModels';
import { getStoredModel, saveModel } from '../utils/imageGenerator';

interface SceneSelectorProps {
  isDark: boolean;
  selectedScene: string;
  onSceneChange: (scene: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

/** Scene selector with API model switcher (no API Key UI — read from env) */
const SceneSelector: React.FC<SceneSelectorProps> = ({
  isDark,
  selectedScene,
  onSceneChange,
  selectedModel,
  onModelChange,
}) => {
  const handleModelChange = (event: SelectChangeEvent) => {
    const model = event.target.value;
    onModelChange(model);
    saveModel(model);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Scene selection */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1.5,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            fontWeight: 600,
          }}
        >
          应用场景
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sceneOptions.map((scene) => {
            const isSelected = selectedScene === scene.key;
            return (
              <Chip
                key={scene.key}
                label={`${scene.icon} ${scene.label}`}
                onClick={() => onSceneChange(scene.key)}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  borderColor: isSelected
                    ? 'rgba(240,147,251,0.5)'
                    : isDark
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(0,0,0,0.15)',
                  bgcolor: isSelected ? 'rgba(240,147,251,0.15)' : 'transparent',
                  color: isSelected
                    ? '#f093fb'
                    : isDark
                      ? 'rgba(255,255,255,0.7)'
                      : 'rgba(0,0,0,0.7)',
                  fontWeight: isSelected ? 700 : 500,
                  '&:hover': {
                    bgcolor: isSelected
                      ? 'rgba(240,147,251,0.25)'
                      : isDark
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.03)',
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* API Model selection */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <ModelTrainingIcon sx={{ fontSize: 16 }} />
          API 接口
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedModel || getStoredModel()}
            onChange={handleModelChange}
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              color: isDark ? '#e0e0e0' : '#333',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(240,147,251,0.4)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#f093fb',
              },
              '& .MuiSelect-icon': {
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              },
            }}
          >
            {volcModels.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {model.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {model.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'block',
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
          }}
        >
          额度用尽时会自动提示，切换模型即可继续使用
        </Typography>
      </Box>
    </Box>
  );
};

export default SceneSelector;
