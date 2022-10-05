module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'import',
    'simple-import-sort',
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '*.html',
    '*.d.ts',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: '.',
      },
      // node: {
      //   extensions: ['.js', '.ts', '.tsx'],
      // },
    },
  },
  rules: {
    'react/jsx-filename-extension': ['warn', {
      extensions: ['.tsx'],
    }],

    // prevent argument of function error in .ts
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],

    // prevent enum declaration error in .ts
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],

    // enable console
    // 'no-console': 'off',

    'import/extensions': ['error', 'never'],

    // method overload
    'no-dupe-class-members': 'off',

    'object-curly-spacing': ['error', 'always'],

    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          // packages
          ['^@?\\w'],
          ['/contexts/?'],
          ['/components/?'],
          ['/hooks/?'],
          ['/utils/?'],
          ['/\\w+.scss$'],
        ],
      },
    ],
  },
};
