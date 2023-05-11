#!/bin/sh
export PARENT_PROJECT=gmetri
export REPO_FOLDER=`git rev-parse --show-toplevel`

export REPO_NAME=$(basename $REPO_FOLDER)
export SHORT_REF=`git rev-parse --short HEAD`
