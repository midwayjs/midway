#!/bin/bash

npm install @midwayjs/cli autocannon tree-kill
./node_modules/.bin/mw new midway_benchmark_app
cp ./scripts/start.js ./midway_benchmark_app/start.js
cp ./scripts/benchmark.js ./midway_benchmark_app/benchmark.js
cd midway_benchmark_app
npm run build
npm link @midwayjs/web @midwayjs/core @midwayjs/decorator midway @midwayjs/mock @midwayjs/bootstrap
node benchmark.js
