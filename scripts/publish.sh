source `dirname $0`/build.sh
git add .
lerna publish $* --conventional-commits
