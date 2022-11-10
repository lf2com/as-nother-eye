module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss',
  ],
  rules: {
    'color-function-notation': null,
    'alpha-value-notation': null,
    'block-opening-brace-space-before': 'always',
    'block-opening-brace-newline-after': 'always',
    'block-closing-brace-newline-after': 'always',
    'declaration-block-semicolon-newline-after': 'always',
    'no-missing-end-of-source-newline': true,
    'rule-empty-line-before': 'always-multi-line',
    'max-empty-lines': 1,
    'block-no-empty': true,
    'block-closing-brace-empty-line-before': 'never',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
};
