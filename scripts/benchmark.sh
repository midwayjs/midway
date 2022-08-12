#!/bin/bash

npm install autocannon
npm install -g create-midway
# npm >= 8 drop parameters (?), so call directly.
create-midway --template=@midwayjs-examples/application-web-v3 midway_benchmark_app
cp ./scripts/start.js ./midway_benchmark_app/start.js
cp ./scripts/benchmark.js ./midway_benchmark_app/benchmark.js
cd midway_benchmark_app
npm run build
npm link @midwayjs/web @midwayjs/core @midwayjs/decorator @midwayjs/mock @midwayjs/bootstrap
# failed here ⬆️ with following message:
# npm ERR! Cannot read properties of null (reading 'package')

# npm ERR! A complete log of this run can be found in:
# npm ERR!     /home/yyc/.npm/_logs/2022-08-12T03_47_10_153Z-debug-0.log
node benchmark.js
