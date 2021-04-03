#!/usr/bin/env bash

export LERNA_RELEASE=true
node scripts/generate_version.js
source `dirname $0`/build.sh
git add .
lerna publish $*
