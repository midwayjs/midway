#!/bin/bash

npm install @midwayjs/cli autocannon
./node_modules/.bin/mw new midway_benchmark_app
cd midway_benchmark_app
npm run build
npm i heapdump
npm link @midwayjs/web @midwayjs/core @midwayjs/decorator midway @midwayjs/mock @midwayjs/bootstrap
mv ../benchmark.js ./benchmark.js
node benchmark.js
