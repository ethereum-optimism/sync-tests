#!/bin/bash

# set -eou pipefail

BASE_PATH=node_modules/@eth-optimism/hardhat-state-dumps/dumps

if [ ! -d $BASE_PATH ]; then
    echo "Be sure to run npm install first"
    exit 1
fi

for FILENAME in $BASE_PATH/*.json; do
    BASE=$(basename $FILENAME)
    echo "Running $BASE"

    FILE=$(readlink -f $FILENAME)

    HARDHAT_INITIAL_STATE=$FILE \
        docker-compose up \
            --abort-on-container-exit \
            --exit-code-from test_suite
        docker-compose down -v
done
