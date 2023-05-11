#!/bin/sh

if [ -z $1 ]
then
  COMMAND="bash"
else
  COMMAND="${@}"
fi

. ./fab/sh/constants.sh
. ./fab/sh/docker_network_create.sh

#Make more verbose now
set -x
#Commenting recurring checks because we aren't using a private docker repo
# docker-compose -f fab/d/docker-compose.yaml pull
docker compose \
  -f fab/d/docker-compose.yaml \
  -p ${PARENT_PROJECT} \
  --project-directory ${REPO_FOLDER} \
  ps --services --filter status=running | grep ${REPO_NAME} > /dev/null
#$? is 0 if already running, 1 if not (0=no error)
ALREADY_RUNNING=$?
#Make less verbose now
set +x

if [ "$ALREADY_RUNNING" -eq 0 ];
then
  echo "Service already running, only opening shell"
else
  docker compose \
    -f fab/d/docker-compose.yaml \
    --project-name ${PARENT_PROJECT} \
    --project-directory ${REPO_FOLDER} \
    up -d
fi

echo "Connecting to docker shell and running command $COMMAND..."
docker compose \
  -f fab/d/docker-compose.yaml \
  --project-name ${PARENT_PROJECT} \
  --project-directory ${REPO_FOLDER} \
  exec $REPO_NAME $COMMAND
