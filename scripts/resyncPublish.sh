#!/bin/bash

pkgs=`find packages -maxdepth 1 -mindepth 1`
cwd=`pwd`
for pkg in $pkgs
do
    cd $cwd
    if [ -e "${pkg}/package.json" ]
    then
      cd $pkg
      echo ">>>>>> Publishing"
      echo ">>>>>>" $pkg
      npm publish
    fi
done
cd $cwd

# publish another proxy package
cd packages/midway
mv package.json _package.json
sed 's/"name": "midway"/"name": "midway-mirror"/g' _package.json > package.json
npm publish
mv _package.json package.json
