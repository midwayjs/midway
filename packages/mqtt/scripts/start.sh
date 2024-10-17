#!/usr/bin/env bash

docker run -it -d --name mqtt-local -p 1883:1883 -p 9001:9001 -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto
