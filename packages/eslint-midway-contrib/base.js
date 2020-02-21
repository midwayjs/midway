module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['./plugins/import.yml'],
  globals: {
    Atomics: 'readonly',
    document: 'readonly',
    globalThis: 'readonly',
    navigator: 'readonly',
    SharedArrayBuffer: 'readonly',
    window: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
    },
    ecmaVersion: 2019,
    // see: https://github.com/typescript-eslint/typescript-eslint/releases/tag/v2.0.0 
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'unicorn'],
  root: true,
};

