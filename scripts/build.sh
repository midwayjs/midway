#!/bin/bash
set -e

# cp ./README.md ./packages/midway/README.md
lerna exec -- rm -rf ./dist
lerna run build --concurrency=4
