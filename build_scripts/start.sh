#!/bin/bash

sudo docker stop bettery_app
sudo docker stop app_redis_1
sudo docker rm bettery_app
sudo docker rm app_redis_1
sudo docker rmi app_app

cp -r /home/ubuntu/node/keys /home/ubuntu/app/
cd /home/ubuntu/app/
sudo docker-compose up & ^C