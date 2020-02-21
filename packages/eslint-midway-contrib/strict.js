module.exports = {
  extends: ['./recommended.js'],
  rules: {
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
    '@typescript-eslint/await-thenable': 2,
    '@typescript-eslint/member-ordering': [0],
    '@typescript-eslint/no-empty-function': 2,
    '@typescript-eslint/no-explicit-any': [1, { ignoreRestArgs: true } ],
    '@typescript-eslint/no-extraneous-class': 2,
    '@typescript-eslint/no-floating-promises': 2,
    '@typescript-eslint/no-for-in-array': 2,
    '@typescript-eslint/no-require-imports': 2,
    '@typescript-eslint/no-this-alias': 2,
    '@typescript-eslint/no-unnecessary-type-assertion': 2,
    '@typescript-eslint/prefer-includes': 1,
    '@typescript-eslint/prefer-string-starts-ends-with': 1,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/restrict-plus-operands': 2,
    // "@typescript-eslint/strict-boolean-expressions": 2,
    '@typescript-eslint/unbound-method': 2,

    // https://eslint.org/docs/rules/
    'no-floating-decimal': 2,
    'no-implied-eval': 2,
    'no-new-wrappers': 2,
    'no-octal-escape': 2,
    'no-param-reassign': 2,
    'no-return-assign': 2,
    'no-return-await': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-template-curly-in-string': 1,
    'no-undef-init': 1,
    radix: 2,

    // https://eslint.org/docs/rules/#nodejs-and-commonjs
    'no-path-concat': 2,

    // https://eslint.org/docs/rules/#stylistic-issues
    'no-array-constructor': 2,
    'no-bitwise': 2,
    'no-mixed-operators': 1,
    'no-new-object': 2,
    'no-tabs': 1,
    'no-unneeded-ternary': 1,
    'prefer-object-spread': 1,
    'prefer-arrow-callback': 1,
    'prefer-const': 1,
    'prefer-destructuring': 1,
    'prefer-rest-params': 1,
    'rest-spread-spacing': [1, 'never'],

    // https://github.com/benmosher/eslint-plugin-import
    'import/no-extraneous-dependencies': [2, { devDependencies: false, optionalDependencies: false, peerDependencies: false } ],
  },
};
