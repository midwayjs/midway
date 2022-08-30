#!/bin/bash

export DIR=midway_benchmark_app

npm init midway -- --template=@midwayjs-examples/application-web-v3 $DIR
echo '[benchmark] create template complete'

cp -f ./scripts/start.js ./$DIR/start.js
cp -f ./scripts/benchmark.js ./$DIR/benchmark.js
echo '[benchmark] script complete'

cd $DIR
npm run build
echo '[benchmark] build example complete'

npm link @midwayjs/web @midwayjs/core @midwayjs/decorator @midwayjs/mock @midwayjs/bootstrap
echo '[benchmark] link package complete'

node benchmark.js
