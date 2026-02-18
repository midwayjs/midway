import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { createApiRspackRule } from '@midwayjs/web-bridge/rspack';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  context: rootDir,
  entry: './src/main.tsx',
  output: {
    path: resolve(rootDir, 'dist/web'),
    filename: 'assets/[name].[contenthash].js',
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    },
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  module: {
    rules: [
      createApiRspackRule({
        root: rootDir,
        apiDir: 'src/server/api',
      }),
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
                development: process.env.NODE_ENV !== 'production',
                refresh: process.env.NODE_ENV !== 'production',
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    host: '127.0.0.1',
    port: 5174,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://127.0.0.1:7001',
      },
    ],
  },
});
