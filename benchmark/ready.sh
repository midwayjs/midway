#!/bin/bash

pkgs=`find fixtures -maxdepth 1 -mindepth 1`
cwd=`pwd`
(cd .. && npm install)
for pkg in $pkgs
do
    cd $cwd
    if [ -e "${pkg}/package.json" ]
    then
      cd $pkg
      rm -rf node_modules
      echo ">>>>>> install dependency"
      echo ">>>>>>" $pkg
      npm install
      npm run build
    fi
done
cd $cwd
