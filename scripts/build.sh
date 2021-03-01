#!/bin/bash
set -e

# cp ./README.md ./packages/midway/README.md
lerna run build
lerna exec -- rm -rf ./dist/.mwcc-cache
