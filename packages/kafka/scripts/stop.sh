#!/bin/bash

# 停用&删除容器
docker stop zookeeper-test kafka-test
docker rm zookeeper-test kafka-test

# 删除数据卷
docker volume rm zookeeper_vol kafka_vol
docker volume rm kafka-group_kafka_vol kafka-group_zookeeper_vol
