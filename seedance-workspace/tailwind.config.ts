import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#131311',
        panel: '#1C1C18',
        'panel-raised': '#232320',
        line: '#34342C',
        'line-strong': '#48473C',
        paper: '#ECE8DC',
        ash: '#9A968A',
        smoke: '#65625A',
        tally: '#E0A23D',
        'tally-strong': '#C7841F',
        wrap: '#6FA76B',
        fail: '#C1543C'
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'ui-monospace',
          'SF Mono',
          'Cascadia Code',
          'Roboto Mono',
          'monospace'
        ]
      },
      letterSpacing: {
        slate: '0.14em'
      }
    }
  },
  plugins: []
};

export default config;
