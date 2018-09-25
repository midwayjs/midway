source `dirname $0`/build.sh
git add .
lerna publish $* --conventional-commits
# publish another proxy package
cd packages/midway
mv package.json _package.json
sed 's/"name": "midway"/"name": "midway-mirror"/g' _package.json > package.json
npm run publish
mv _package.json package.json
