#!/bin/bash

npm install autocannon
npm init midway --template=@midwayjs-examples/application-web-v3 midway_benchmark_app
cp ./scripts/start.js ./midway_benchmark_app/start.js
cp ./scripts/benchmark.js ./midway_benchmark_app/benchmark.js
cd midway_benchmark_app
npm run build
npm link @midwayjs/web @midwayjs/core @midwayjs/decorator midway @midwayjs/mock @midwayjs/bootstrap
node benchmark.js
