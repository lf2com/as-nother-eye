import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

// @ts-expect-error ignore non-ts import
import pluginGridAreas from '@savvywombat/tailwindcss-grid-areas';

const config: Config = {
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '50%': '50%',
      },
      dropShadow: {
        white: [
          '1px 0 0 #fff',
          '-1px 0 0 #fff',
          '0 1px 0 #fff',
          '0 -1px 0 #fff',
        ],
      },
      textShadow: {
        white: [
          '-1px -1px 0 #fff',
          '-1px 1px 0 #fff',
          '1px -1px 0 #fff',
          '1px 1px 0 #fff',
        ].join(','),
      },
      animation: {
        shining: 'shining 0.4s linear infinite',
        shot: 'shot 0.25s linear forwards',
        show: 'show 0.5s ease forwards',
      },
      keyframes: {
        shining: {
          '0%,100%': { color: 'inherit' },
          '50%': { color: 'transparent' },
        },
        shot: {
          '0%': { filter: 'contrast(0)' },
          '100%': { filter: 'contrast(1)' },
        },
        show: {
          '0%': { transform: 'scale(0)' },
          '95%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    pluginGridAreas,
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        { 'text-shadow': textShadow => ({ textShadow }) },
        { values: theme('textShadow') }
      );
    }),
  ],
};

export default config;
