#!/usr/bin/env bash

lerna exec -- rm -rf ./dist
source `dirname $0`/build.sh
git add .
lerna publish $*
