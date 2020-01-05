#!/usr/bin/env sh

set -e

IS_GITHUB_PAGES=true yarn run build

cd dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:el-fuego/grow-calculators.git master:gh-pages

cd -
