#!/bin/bash
set -e
cwd=`pwd`
lerna run cov
rm -rf "${cwd}/.nyc_output" || true
mkdir "${cwd}/.nyc_output"
cp -r ./packages/*/.nyc_output/* $cwd/.nyc_output/ || true
cp -r ./packages/*/node_modules/.nyc_output/* $cwd/.nyc_output/ || true
./node_modules/.bin/nyc report
