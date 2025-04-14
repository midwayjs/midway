#!/usr/bin/env bash

docker run -d \
  --name=consul \
  -p 8500:8500 \
  -p 8600:8600/udp \
  hashicorp/consul:latest \
  agent -dev -client=0.0.0.0
