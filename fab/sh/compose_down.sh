#!/bin/sh
. ./fab/sh/constants.sh

docker compose \
    -f fab/d/docker-compose.yaml \
    --project-name ${PARENT_PROJECT} \
    --project-directory ${REPO_FOLDER} \
    down
