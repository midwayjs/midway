#!/usr/bin/env bash

#docker pull mongo
docker run -d --name mongodb -p 27017:27017 mongo
