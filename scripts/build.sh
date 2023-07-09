#!/bin/bash
set -e

# 获取node版本
NODE_VERSION=$(node -v | cut -dv -f2 | cut -d. -f1)

# 如果 为 node 14，则重新安装高版本的 npm，并重新安装
if [ "$NODE_VERSION" = "14" ]; then
  echo 'npm versin is 14, reinstall npm'
  npm install -g npm@latest
  rm -rf node_modules
  rm -rf package-lock.json
  npm install
fi

# cp ./README.md ./packages/midway/README.md
lerna exec -- rm -rf ./dist
lerna run build --concurrency=4
