#!/usr/bin/env bash

npm run contributors
npm run build
git add .
git commit -m "chore: ready for publish"
lerna publish $* --conventional-commits

# publish another proxy package
cd packages/midway
mv package.json _package.json
sed 's/"name": "midway"/"name": "midway-mirror"/g' _package.json > package.json

if [ -z $2 ]
then
    echo "tag is [latest] and will publish to npmjs"
    npm publish
else
    echo "tag is [$2] and will publish to npmjs"
    npm publish --tag $2
fi
mv _package.json package.json
