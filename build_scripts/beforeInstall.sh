#!/bin/bash

sudo docker stop bettery_app
sudo docker stop app_redis_1
sudo docker rm bettery_app
sudo docker rm app_redis_1
sudo docker rmi app_app
