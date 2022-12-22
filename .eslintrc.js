module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
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
    'jest',
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
        project: '**/*/tsconfig.json',
      },
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

    'import/no-unresolved': ['error', {
      ignore: ['^@/'],
    }],
    'import/extensions': ['error', 'never'],

    // method overload
    'comma-spacing': ['error', { before: false, after: true }],
    'no-dupe-class-members': 'off',

    'object-curly-spacing': ['error', 'always'],
    'no-param-reassign': ['error', { props: false }],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'import/order': 'off',
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          ['^@?\\w'],
          ['/contexts/?'],
          ['/components/?'],
          ['/hooks/?'],
          ['/utils/?'],
          ['/types/?'],
          ['/pages/?'],
          ['/\\w+.scss$'],
        ],
      },
    ],

    indent: ['error', 2, {
      SwitchCase: 1,
    }],
  },
};
