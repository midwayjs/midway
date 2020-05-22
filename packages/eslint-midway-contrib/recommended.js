module.exports = {
  extends: [
    './base.js',
    'eslint:recommended',
    // 'plugin:@typescript-eslint/eslint-recommended',  included in @typescript-eslint/recommended
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    'sort-imports': 0,
    'require-atomic-updates': 0,

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
    '@typescript-eslint/array-type': [2],
    '@typescript-eslint/ban-ts-comment': [0],
    'brace-style': 0,
    '@typescript-eslint/brace-style': [1, 'stroustrup', { allowSingleLine: true } ],
    '@typescript-eslint/consistent-type-definitions': [2, 'interface'],
    'default-param-last': 0,
    '@typescript-eslint/default-param-last': 2,
    '@typescript-eslint/explicit-function-return-type': 0,
    'func-call-spacing': 0,
    '@typescript-eslint/func-call-spacing': [1, 'never'],
    indent: 0,
    '@typescript-eslint/indent': [2, 2, { SwitchCase: 1 } ],
    '@typescript-eslint/member-delimiter-style': [
      2,
      {
        overrides: {
          interface: {
            multiline: {
              delimiter: 'none',
              requireLast: false,
            },
          },
        },
      },
    ],
    '@typescript-eslint/no-base-to-string': 2,
    'no-dupe-class-members': 0,
    '@typescript-eslint/no-dupe-class-members': 2,
    '@typescript-eslint/no-empty-function': 1,
    '@typescript-eslint/no-explicit-any': [0],
    'no-extra-parens': 0,
    '@typescript-eslint/no-extra-parens': 2,
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/no-this-alias': [
      2,
      {
        allowDestructuring: true,
        allowedNames: ['self'],
      },
    ],
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': [2, { functions: false, typedefs: false } ],
    '@typescript-eslint/require-await': 0,
    semi: 0,
    '@typescript-eslint/semi': [1, 'always'],
    'space-before-function-paren': 0,
    '@typescript-eslint/space-before-function-paren': [
      1, {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    '@typescript-eslint/type-annotation-spacing': 1,

    // https://eslint.org/docs/rules/#best-practices
    curly: 2,
    'dot-notation': 1,
    eqeqeq: 2,
    'no-eval': 2,
    'no-multi-spaces': 1,
    'no-throw-literal': 2,
    'no-unmodified-loop-condition': 2,

    // https://eslint.org/docs/rules/#variables
    'no-restricted-globals': [2, 'isFinite', 'isNaN'],
    'no-shadow': 2,

    // https://eslint.org/docs/rules/#stylistic-issues
    'array-bracket-newline': [1, { multiline: true } ],
    'array-bracket-spacing': [1, 'never', { singleValue: false, objectsInArrays: true, arraysInArrays: true } ],
    'block-spacing': 1,
    'comma-dangle': [
      1, {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    'comma-style': 1,
    'computed-property-spacing': 1,
    'eol-last': [1, 'always'],
    'function-paren-newline': [1, 'multiline-arguments'],
    'implicit-arrow-linebreak': 2,
    'key-spacing': 1,
    'keyword-spacing': 1,
    'linebreak-style': [1, 'unix'],
    'new-parens': [1],
    'newline-per-chained-call': [1, { ignoreChainWithDepth: 6 } ],
    'no-mixed-spaces-and-tabs': 2,
    'no-multiple-empty-lines': [1, { max: 4, maxBOF: 1, maxEOF: 1 } ],
    'no-trailing-spaces': [2, { skipBlankLines: false, ignoreComments: true } ],
    'no-whitespace-before-property': 1,
    'object-curly-newline': [
      1,
      {
        ObjectExpression: { multiline: true, minProperties: 4, consistent: true },
        ObjectPattern: { multiline: true, minProperties: 4, consistent: true },
        ImportDeclaration: { multiline: true, minProperties: 6 },
        ExportDeclaration: { multiline: true, minProperties: 2 },
      },
    ],
    'object-curly-spacing': [1, 'always'],
    'object-property-newline': [1, { allowAllPropertiesOnSameLine: true } ],
    'quote-props': [1, 'as-needed'],
    quotes: [1, 'single'],
    'semi-spacing': [1, { before: false, after: true } ],
    'semi-style': [2, 'last'],
    'space-before-blocks': [1, 'always'],
    'spaced-comment': [
      1, 'always',
      {
        line: {
          markers: ['/'],
          exceptions: ['-', '+'],
        },
        block: {
          markers: ['!'],
          exceptions: ['*'],
          balanced: true,
        },
      },
    ],
    'space-in-parens': [1, 'never'],
    'space-infix-ops': [1],
    'space-unary-ops': [
      2,
      {
        words: true,
        nonwords: false,
        overrides: {
          '!': true,
          '!!': true,
        },
      },
    ],
    'template-tag-spacing': [1, 'never'],
    'unicode-bom': [2, 'never'],

    // https://eslint.org/docs/rules/#ecmascript-6
    'arrow-body-style': [0, 'as-needed', { requireReturnForObjectLiteral: true } ],
    'arrow-parens': [1, 'as-needed', { requireForBlockBody: true } ],
    'arrow-spacing': 1,
    // conflict with @typescript-eslint/no-extra-parens
    'no-confusing-arrow': [0, { allowParens: true } ],
    'no-duplicate-imports': 2,
    'no-useless-computed-key': 1,
    'no-useless-rename': 1,
    'no-var': 2,
    'object-shorthand': [1, 'always'],
  },
};

