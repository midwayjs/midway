#!/bin/bash
set -e

npm run authors
lerna run build
