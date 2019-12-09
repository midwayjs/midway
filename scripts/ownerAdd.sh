#!/bin/bash
user=$1
pkgs=`find packages -maxdepth 1 -mindepth 1`
cwd=`pwd`
for pkg in $pkgs
do
    cd $cwd
    if [ -e "${pkg}/package.json" ]
    then
      cd $pkg
      echo ">>>>>> Owner Adding"
      echo ">>>>>>" $pkg
      npm owner add $user
    fi
done
cd $cwd
