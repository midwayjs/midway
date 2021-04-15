#!/bin/bash
set -e

# cp ./README.md ./packages/midway/README.md
lerna run build --concurrency=4
lerna exec -- rm -rf ./dist/.mwcc-cache
rm -rf ./node_modules/@midwayjs/decorator
rm -rf ./node_modules/@midwayjs/core
