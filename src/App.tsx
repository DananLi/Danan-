import React, { useState, useCallback } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
} from '@mui/material';
import { darkTheme, lightTheme } from './theme';
import { PromptInput, SizePreset, PrintSizePreset, StyleContext } from './types';
import { sizePresets } from './data/sizes';
import { printSizePresets } from './data/printSizes';
import { sceneOptions } from './data/scenes';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { saveModel, getStoredModel } from './utils/imageGenerator';

/** Default input state */
const defaultInput: PromptInput = {
  description: '',
  size: '1:1',
  customWidth: 1024,
  customHeight: 1024,
  scene: 'social_post',
  sizeMode: 'digital',
  printSize: 'A4',
  customPrintWidth: 210,
  customPrintHeight: 297,
  model: getStoredModel(),
};

/** Build the prompt text from user input, adding scene keywords */
function buildPrompt(input: PromptInput): string {
  const description = input.description.trim();
  if (!description) return '';

  const parts: string[] = [description];

  // Add scene keywords
  const scene = sceneOptions.find((s) => s.key === input.scene);
  if (scene && scene.keywords.length > 0) {
    parts.push(`suitable for ${scene.keywords.join(', ')}`);
  }

  // Add quality boosters
  parts.push('high quality, detailed, professional');

  return parts.join('. ');
}

/** Compute image pixel dimensions based on current input */
function getImageDimensions(input: PromptInput): { width: number; height: number } {
  if (input.sizeMode === 'print') {
    const printPreset: PrintSizePreset | undefined = printSizePresets.find((s) => s.key === input.printSize);
    const widthMm = input.printSize === 'custom' ? input.customPrintWidth : (printPreset?.width ?? 210);
    const heightMm = input.printSize === 'custom' ? input.customPrintHeight : (printPreset?.height ?? 297);
    // 300 DPI: 1mm ≈ 11.81px, cap at 2048 for API
    const widthPx = Math.min(Math.round(widthMm * 11.81), 2048);
    const heightPx = Math.min(Math.round(heightMm * 11.81), 2048);
    return { width: widthPx, height: heightPx };
  }

  if (input.size === 'custom') {
    return { width: Math.min(input.customWidth, 2048), height: Math.min(input.customHeight, 2048) };
  }

  const preset: SizePreset | undefined = sizePresets.find((s) => s.label === input.size);
  return {
    width: Math.min(preset?.width ?? 1024, 2048),
    height: Math.min(preset?.height ?? 1024, 2048),
  };
}

/** Main application component */
const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [input, setInput] = useState<PromptInput>(defaultInput);
  const [generationTrigger, setGenerationTrigger] = useState(0);
  const [searchEnhancedPrompt, setSearchEnhancedPrompt] = useState<string | null>(null);

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const handleModelChange = useCallback((newModel: string) => {
    setInput((prev) => ({ ...prev, model: newModel }));
    saveModel(newModel);
  }, []);

  const handleGenerate = useCallback(() => {
    // Increment trigger to signal OutputPanel to generate
    setGenerationTrigger((prev) => prev + 1);
  }, []);

  /** Handle search-enhanced prompt: set the enhanced prompt and trigger generation */
  const handleSearchEnhance = useCallback((enhancedPrompt: string, _styleContext: StyleContext) => {
    setSearchEnhancedPrompt(enhancedPrompt);
    // Auto-trigger generation with the enhanced prompt
    setGenerationTrigger((prev) => prev + 1);
  }, []);

  const prompt = searchEnhancedPrompt ?? buildPrompt(input);
  const dims = getImageDimensions(input);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        className={isDark ? 'animated-bg' : 'animated-bg-light'}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Header isDark={isDark} onToggleTheme={handleToggleTheme} />

        {/* Main content area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 0, md: 2 },
            p: { xs: 1, sm: 2, md: 3 },
            maxHeight: { md: 'calc(100vh - 64px)' },
          }}
        >
          {/* Left panel - Input */}
          <Box
            className={isDark ? 'glass' : 'glass-light'}
            sx={{
              flex: { xs: 'none', md: '1 1 50%' },
              maxWidth: { md: '50%' },
              borderRadius: 3,
              overflow: 'hidden',
              mb: { xs: 2, md: 0 },
              animation: 'fadeInUp 0.5s ease forwards',
            }}
          >
            <InputPanel
              isDark={isDark}
              input={input}
              onInputChange={(newInput) => {
                setInput(newInput);
                // Clear search enhancement when input changes
                setSearchEnhancedPrompt(null);
              }}
              onGenerate={handleGenerate}
              onSearchEnhance={handleSearchEnhance}
            />
          </Box>

          {/* Right panel - Output */}
          <Box
            className={isDark ? 'glass' : 'glass-light'}
            sx={{
              flex: { xs: 'none', md: '1 1 50%' },
              maxWidth: { md: '50%' },
              borderRadius: 3,
              overflow: 'hidden',
              animation: 'fadeInUp 0.5s ease 0.1s forwards',
              opacity: 0,
            }}
          >
            <OutputPanel
              isDark={isDark}
              prompt={prompt}
              imageWidth={dims.width}
              imageHeight={dims.height}
              model={input.model}
              onModelChange={handleModelChange}
              onRegenerate={handleGenerate}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
