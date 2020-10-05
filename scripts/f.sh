#!/bin/bash

./scripts/tag.sh latest

## freeze
npm dist-tag add @midwayjs/core@2.1.4 latest
npm dist-tag add @midwayjs/decorator@2.1.4 latest
npm dist-tag add @midwayjs/faas@1.2.15 latest
