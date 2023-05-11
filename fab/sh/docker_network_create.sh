#!/bin/sh
#Externalizing the network creation step allows multiple docker composes to independently connect
#to the same network without worrying about start order

. ./fab/sh/constants.sh

NETWORK_EXISTS=0
#This is necessary instead of using $? (previous command exit code) as we are set -e mode,
#which exists the script on any error
docker network ls | grep ${PARENT_PROJECT} || NETWORK_EXISTS=1
#0 if already exists, 1 if doesn't exist (0=no error)

if [ "$NETWORK_EXISTS" -eq 0 ];
then
  echo "Network exists"
else
  docker network create --attachable ${PARENT_PROJECT} || true
fi
