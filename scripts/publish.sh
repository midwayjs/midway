#!/usr/bin/env bash
set -e

rm -f ./packages/.DS* 
source `dirname $0`/build.sh
npm run build:skill-midway
git add .

RELEASE_TYPE="$1"

case "$RELEASE_TYPE" in
  "beta")
    SKIP_VERSION_SCRIPTS=true lerna version --yes --force-publish=*
    lerna publish from-git --yes --dist-tag beta
    ;;
  "next")
    SKIP_VERSION_SCRIPTS=true lerna version --yes
    lerna publish from-git --yes --dist-tag next
    ;;
  "canary")
    SKIP_VERSION_SCRIPTS=true lerna version major --yes
    lerna publish from-git --yes --canary --preid alpha --dist-tag alpha
    ;;
  *)
    # release (default) - 只有这个会执行完整的 version 脚本
    lerna version --yes
    lerna publish from-git --yes
    ;;
esac
