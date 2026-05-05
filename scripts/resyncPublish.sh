#!/bin/bash

set -e

pnpm publish -r --filter "./packages/*" --no-git-checks
