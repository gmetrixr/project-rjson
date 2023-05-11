#!/bin/bash
set -x
echo "Image ENTRYPOINT executing in `pwd` with arguments $*"

#Run command passed as argument (Else CMD gets executed, and persisted on commit)
sh -c "$*"
