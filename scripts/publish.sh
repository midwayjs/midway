#!/usr/bin/env bash
set -e

rm -f ./packages/.DS* 
source `dirname $0`/build.sh
pnpm -w run build:skill-midway
git add .

RELEASE_TYPE="$1"
VERSION_BUMP="$2"

version() {
  if [ -n "$VERSION_BUMP" ]; then
    lerna version "$VERSION_BUMP" --yes "$@"
  else
    lerna version --yes "$@"
  fi
}

case "$RELEASE_TYPE" in
  "beta")
    SKIP_VERSION_SCRIPTS=true version --force-publish=*
    lerna publish from-git --yes --dist-tag beta
    ;;
  "next")
    SKIP_VERSION_SCRIPTS=true version
    lerna publish from-git --yes --dist-tag next
    ;;
  "canary")
    SKIP_VERSION_SCRIPTS=true lerna version major --yes
    lerna publish from-git --yes --canary --preid alpha --dist-tag alpha
    ;;
  *)
    # release (default) - 只有这个会执行完整的 version 脚本
    version
    lerna publish from-git --yes
    ;;
esac
