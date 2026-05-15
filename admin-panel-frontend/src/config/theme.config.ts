export const THEME_CONFIG = {
  colors: {
    light: {
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222.2, 84%, 4.9%)',
      primary: 'hsl(221.2, 83.2%, 53.3%)',
      secondary: 'hsl(210, 40%, 96.1%)',
      accent: 'hsl(210, 40%, 96.1%)',
      muted: 'hsl(210, 40%, 96.1%)',
      destructive: 'hsl(0, 84.2%, 60.2%)',
      border: 'hsl(214.3, 31.8%, 91.4%)',
    },
    dark: {
      background: 'hsl(222.2, 84%, 4.9%)',
      foreground: 'hsl(210, 40%, 98%)',
      primary: 'hsl(217.2, 91.2%, 59.8%)',
      secondary: 'hsl(217.2, 32.6%, 17.5%)',
      accent: 'hsl(217.2, 32.6%, 17.5%)',
      muted: 'hsl(217.2, 32.6%, 17.5%)',
      destructive: 'hsl(0, 62.8%, 30.6%)',
      border: 'hsl(217.2, 32.6%, 17.5%)',
    },
  },
  fonts: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
};

export default THEME_CONFIG;
