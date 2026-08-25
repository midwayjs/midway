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

version_if_needed() {
  if [ "$VERSION_BUMP" != "existing" ]; then
    version "$@"
  fi
}

publish_packages() {
  if [ "$VERSION_BUMP" = "existing" ]; then
    lerna publish from-package --yes "$@"
  else
    lerna publish from-git --yes "$@"
  fi
}

case "$RELEASE_TYPE" in
  "beta")
    SKIP_VERSION_SCRIPTS=true version_if_needed --force-publish=*
    publish_packages --dist-tag beta
    ;;
  "next")
    SKIP_VERSION_SCRIPTS=true version_if_needed
    publish_packages --dist-tag next
    ;;
  "canary")
    SKIP_VERSION_SCRIPTS=true lerna version major --yes
    publish_packages --canary --preid alpha --dist-tag alpha
    ;;
  *)
    # release (default) - 只有这个会执行完整的 version 脚本
    version_if_needed
    publish_packages
    node scripts/create_github_release.js
    ;;
esac
