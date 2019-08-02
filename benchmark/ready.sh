#!/bin/bash

pkgs=`find fixtures -maxdepth 1 -mindepth 1`
cwd=`pwd`
for pkg in $pkgs
do
    cd $cwd
    if [ -e "${pkg}/package.json" ]
    then
      cd $pkg
      rm -rf node_modules
      echo ">>>>>> install dependency"
      echo ">>>>>>" $pkg
      cnpm i
      npm run ready
    fi
done
cd $cwd
