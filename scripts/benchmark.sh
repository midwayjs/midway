#!/bin/bash

npm init midway -- --template=@midwayjs-examples/application-web-v3 midway_benchmark_app
echo '[benchmark] create template complete'
cp ./scripts/start.js ./midway_benchmark_app/start.js
cp ./scripts/benchmark.js ./midway_benchmark_app/benchmark.js
echo '[benchmark] script complete'
cd midway_benchmark_app
npm run build
echo '[benchmark] build example complete'
npm link @midwayjs/web @midwayjs/core @midwayjs/decorator @midwayjs/mock @midwayjs/bootstrap
echo '[benchmark] link package complete'
node benchmark.js
