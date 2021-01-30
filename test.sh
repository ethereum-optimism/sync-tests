#!/bin/bash

# Bring the local environment variables into scope
source local.env

BASE_PATH=fixtures

function is_installed() {
    if ! [ -x "$(command -v $1)" ]; then
        echo "Error: $1 is not installed." >&2
        exit 1
    fi
}

function wait() {
    JSON='{"jsonrpc":"2.0","id":0,"method":"net_version","params":[]}'
    RETRIES=10
    until $(curl --silent --fail \
        --output /dev/null "$1"); do
            sleep 2
            echo "Will wait $((RETRIES--)) more times for $1 to be up..."

            if [ "$RETRIES" -lt 0 ]; then
                echo "Timeout waiting for layer one node at $1"
                docker-compose down -v
                exit 1
            fi
        done
}

is_installed docker
is_installed docker-compose
is_installed jq

for FILENAME in $BASE_PATH/*.js; do
    BASE=$(basename $FILENAME)
    echo "Running $BASE"

    docker-compose up -d deployer l1_chain
    wait $DEPLOYER_HTTP

    ADDRESS_MANAGER_ADDRESS=$(curl --silent \
        $DEPLOYER_HTTP/addresses.json \
        | jq -r .AddressManager)

    env \
        PRIVATE_KEY=$PRIVATE_KEY \
        ADDRESS_MANAGER_ADDRESS=$ADDRESS_MANAGER_ADDRESS \
        L1_NODE_WEB3_URL=$L1_NODE_WEB3_URL \
        node $FILENAME

    ETH1_ADDRESS_RESOLVER_ADDRESS=$ADDRESS_MANAGER_ADDRESS \
        docker-compose up -d geth_l2
    wait $L2_NODE_WEB3_URL

    docker-compose logs -f &

    L1_NODE_WEB3_URL=$L1_NODE_WEB3_URL \
    L2_NODE_WEB3_URL=$L2_NODE_WEB3_URL \
      npx mocha test/${BASE%%.*}-test.js --timeout 10000

    docker-compose down -v
done
