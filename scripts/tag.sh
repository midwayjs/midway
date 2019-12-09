#!/bin/bash
pkgs=`find packages -maxdepth 1 -mindepth 1`
cwd=`pwd`
TAG=$1;

if [ -z "$TAG" ]; then
   echo Please provide a valid tag name!;
   exit 1;
fi

for pkg in $pkgs
do
    cd $cwd
    if [ -f "${pkg}/package.json" ]; then
      cd $pkg
      NAME=$(node -pe "require('./package.json').name")
      VERSION=$(node -pe "require('./package.json').version")
      SHH="npm dist-tag add ${NAME}@${VERSION} $TAG"
      echo $SHH
      $SHH
    fi
done
cd $cwd
