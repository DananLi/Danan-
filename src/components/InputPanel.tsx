import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SizeSelector from './SizeSelector';
import SceneSelector from './SceneSelector';
import { PromptInput } from '../types';

interface InputPanelProps {
  isDark: boolean;
  input: PromptInput;
  onInputChange: (input: PromptInput) => void;
  onGenerate: () => void;
}

/** Left panel containing user inputs for image generation */
const InputPanel: React.FC<InputPanelProps> = ({
  isDark,
  input,
  onInputChange,
  onGenerate,
}) => {
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleGenerate = () => {
    if (!input.description.trim()) {
      setSnackbarOpen(true);
      return;
    }
    onGenerate();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: { xs: 2, sm: 3 },
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Image Description */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            fontWeight: 600,
          }}
        >
          图片内容 <span style={{ color: '#f093fb' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={8}
          placeholder="描述你想要生成的图片内容，例如：一只穿着宇航服的猫咪漂浮在太空中，背景是绚丽的星云..."
          value={input.description}
          onChange={(e) => onInputChange({ ...input, description: e.target.value })}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              color: isDark ? '#e0e0e0' : '#333',
              '& fieldset': {
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(102,126,234,0.4)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
            '& .MuiInputBase-placeholder': {
              color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Size Selector */}
      <SizeSelector
        isDark={isDark}
        sizeMode={input.sizeMode}
        selectedSize={input.size}
        customWidth={input.customWidth}
        customHeight={input.customHeight}
        selectedPrintSize={input.printSize}
        customPrintWidth={input.customPrintWidth}
        customPrintHeight={input.customPrintHeight}
        onSizeModeChange={(mode) => onInputChange({ ...input, sizeMode: mode })}
        onSizeChange={(size) => onInputChange({ ...input, size })}
        onCustomWidthChange={(w) => onInputChange({ ...input, customWidth: w })}
        onCustomHeightChange={(h) => onInputChange({ ...input, customHeight: h })}
        onPrintSizeChange={(size) => onInputChange({ ...input, printSize: size })}
        onCustomPrintWidthChange={(w) => onInputChange({ ...input, customPrintWidth: w })}
        onCustomPrintHeightChange={(h) => onInputChange({ ...input, customPrintHeight: h })}
      />

      {/* Scene + API Model + API Key */}
      <SceneSelector
        isDark={isDark}
        selectedScene={input.scene}
        onSceneChange={(scene) => onInputChange({ ...input, scene })}
        selectedModel={input.model}
        onModelChange={(model) => onInputChange({ ...input, model })}
      />

      {/* Generate Button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleGenerate}
        startIcon={<AutoAwesomeIcon />}
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
          transition: 'all 0.3s ease',
        }}
      >
        生成图片
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          请先输入图片描述！
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InputPanel;
