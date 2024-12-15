#!/usr/bin/env bash

#docker pull rabbitmq:management
docker run -d --name rabbitmq -p 5672:5672 rabbitmq
