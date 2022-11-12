module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss',
  ],
  rules: {
    'color-function-notation': null,
    'alpha-value-notation': null,
    'no-empty-first-line': true,
    'block-no-empty': true,
    'block-opening-brace-space-before': 'always',
    'block-opening-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-empty-line-before': 'never',
    'declaration-block-semicolon-newline-after': 'always',
    'no-missing-end-of-source-newline': true,
    // 'rule-empty-line-before': ['always-multi-line', {
      // except: {
      //   'first-nested': 'always',
      // },
    // }],
    'max-empty-lines': 1,
    'indentation': 2,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
};
