#!/usr/bin/env bash

source `dirname $0`/build.sh
git add .
lerna publish $* --tag-version-prefix='serverless-'
