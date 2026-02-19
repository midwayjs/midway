const path = require('node:path');
const mwtsConfig = require('mwts/eslint.config.js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '**/node_modules',
      'packages/version',
      '**/dist',
      '**/test',
      '**/jest.config.js',
      'interface.ts',
      'interface',
      'app.js',
      'agent.js',
      'site',
      'function.js',
    ],
  },
  ...mwtsConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
      parserOptions: {
        project: [path.join(__dirname, 'tsconfig.json')],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      'no-control-regex': 'off',
      '@typescript-eslint/no-floating-promises': 'off',

      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
];
