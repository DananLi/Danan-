import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

/** Top navigation bar with branding and theme toggle */
const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 },
        py: 1.5,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        bgcolor: isDark ? 'rgba(15, 12, 41, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AutoAwesomeIcon
          sx={{
            fontSize: 32,
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          PromptCraft
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            display: { xs: 'none', sm: 'block' },
            ml: 1,
          }}
        >
          AI 图片提示词生成器
        </Typography>
      </Box>

      <Tooltip title={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
        <IconButton
          onClick={onToggleTheme}
          sx={{
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isDark ? (
            <LightModeIcon sx={{ color: '#f093fb' }} />
          ) : (
            <DarkModeIcon sx={{ color: '#5c6bc0' }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Header;
