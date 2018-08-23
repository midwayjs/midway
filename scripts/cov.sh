#!/bin/bash

set -e
pkgs=`find packages -maxdepth 1 -mindepth 1`
cwd=`pwd`
if [ -d "${cwd}/.nyc_output" ]; then
  rm -rf "${cwd}/.nyc_output"
fi
mkdir "${cwd}/.nyc_output"
echo "${cwd}"
for pkg in $pkgs
do
    cd $cwd
    if [ -e "${pkg}/package.json" ] && [ -d "${pkg}/test" ]
    then
      cd $pkg
      if [ -d ".nyc_output" ]; then
        rm -rf ".nyc_output"
      fi
      echo "*****************************************"
      echo "********** Midway Coverage ******* X ***"
      echo "*****************************************"
      echo ">>>>>>" $pkg
      echo "*****************************************"
      echo "************************ © Midway.js **"
      npm run cov
      if [ -d ".nyc_output" ]; then
        cp .nyc_output/* $cwd/.nyc_output/
      fi
      if [ -d "./node_modules/.nyc_output" ]; then
        cp ./node_modules/.nyc_output/* $cwd/.nyc_output/
      fi
    fi
done
wait
cd $cwd
./node_modules/.bin/nyc report
