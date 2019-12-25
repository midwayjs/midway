#!/bin/bash
pkgs=`find packages -maxdepth 1 -mindepth 1`
cwd=`pwd`

for pkg in $pkgs
do
    cd $cwd
    if [ -f "${pkg}/package.json" ]; then
      cd $pkg
      NAME=$(node -pe "require('./package.json').name")
      SHH="tnpm sync ${NAME}"
      echo $SHH
      $SHH
    fi
done
cd $cwd
