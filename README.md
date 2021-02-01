# Sync Tests

Test suite for syncing related tests. Transactions and state roots are posted
to a layer one smart contract without execution. These transactions are
synced and then executed offchain so that the state roots that are computed
offchain can be compared against the state roots that were posted to layer one.
If a difference is noticed, then a fraud proof can be submitted.

These tests use a Hardhat node for L1

### Requirements

- docker
- docker-compose
- jq
- node.js

### Usage

The `test` and `fixtures` directories should have matching file prefixes by name.
Before a `test` file runs, the corresponding fixture will run beforehand and
initialize a L1 state. This L1 state is used to sync.

```bash
$ ./test.sh
```
