#!/bin/bash

npm install @midwayjs/cli autocannon
./node_modules/.bin/mw new midway_benchmark_app
cp start.js ./midway_benchmark_app/start.js
cp benchmark.js ./midway_benchmark_app/benchmark.js
echo pwd
cd midway_benchmark_app
npm run build
npm i heapdump
npm link @midwayjs/web @midwayjs/core @midwayjs/decorator midway @midwayjs/mock @midwayjs/bootstrap
node benchmark.js
