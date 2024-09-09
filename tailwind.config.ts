import type { Config } from 'tailwindcss';
import pluginAnimate from 'tailwindcss-animate';
// @ts-expect-error ignore non-ts import
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
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
        show: 'show 0.25s ease-in-out forwards',
        hide: 'hide 0.25s ease-in-out forwards',
        'bg-slide': 'bg-slide 1s linear infinite',
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
          '95%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        hide: {
          '0%': { transform: 'scale(1)' },
          '5%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(0)' },
        },
        'bg-slide': {
          '0%': { backgroundPosition: '0 0' },
          '100%': {
            backgroundPosition: 'var(--bg-size-x,0) var(--bg-size-y,0)',
          },
        },
      },
    },
  },
  plugins: [
    pluginAnimate,
    pluginGridAreas,
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        { 'text-shadow': value => ({ textShadow: value }) },
        {
          type: 'shadow',
          values: theme('textShadow'),
        }
      );
    }),
    plugin(({ matchUtilities, theme }) => {
      const BG_SIZE = 'bg-size';
      const VAR_BG_SIZE_X = `--${BG_SIZE}-x`;
      const VAR_BG_SIZE_Y = `--${BG_SIZE}-y`;

      matchUtilities<string>(
        {
          [BG_SIZE]: value => {
            const [x, y = x] = value.split(' ');

            return {
              [VAR_BG_SIZE_X]: x,
              [VAR_BG_SIZE_Y]: y,
              backgroundSize: `var(${VAR_BG_SIZE_X}) var(${VAR_BG_SIZE_Y})`,
            };
          },
        },
        {
          type: 'length',
          values: theme('spacing'),
        }
      );

      const BG_SLASH = 'bg-slash';
      const BG_SLASH_FG = `${BG_SLASH}-fg`;
      const BG_SLASH_BG = `${BG_SLASH}-bg`;
      const VAR_BG_SLASH_FG = `--${BG_SLASH_FG}`;
      const VAR_BG_SLASH_BG = `--${BG_SLASH_BG}`;

      matchUtilities<string>(
        {
          [BG_SLASH]: value => {
            const args = value.split(',').map(str => str.trim());
            const fg = args[0] || theme('colors.gray.300');
            const bg = args[1] || theme('colors.transparent');

            return {
              [VAR_BG_SLASH_FG]: fg,
              [VAR_BG_SLASH_BG]: bg,
              backgroundImage: [
                'linear-gradient(-45deg',
                `var(${VAR_BG_SLASH_FG}) 25%`,
                `var(${VAR_BG_SLASH_BG}) 25%`,
                `var(${VAR_BG_SLASH_BG}) 50%`,
                `var(${VAR_BG_SLASH_FG}) 50%`,
                `var(${VAR_BG_SLASH_FG}) 75%`,
                `var(${VAR_BG_SLASH_BG}) 75%)`,
              ].join(','),
              backgroundRepeat: 'repeat',
            };
          },
        },
        {
          type: ['color', 'color'],
          values: {
            DEFAULT: '',
          },
        }
      );

      matchUtilities<string>(
        {
          [BG_SLASH_FG]: value => ({ [VAR_BG_SLASH_FG]: value }),
          [BG_SLASH_BG]: value => ({ [VAR_BG_SLASH_BG]: value }),
        },
        {
          type: 'color',
          values: flattenColorPalette(theme('colors')),
        }
      );
    }),
  ],
};

export default config;
