const {OptimismProvider} = require('@eth-optimism/provider')
const {getProviders, sleep} = require('../common')
const assert = require('assert')

describe('Simple Enqueue', () => {
  const {L2Provider} = getProviders()

  before(async () => {
    while (true) {
      const tip = await L2Provider.getBlock('latest')
      if (tip.number >= 5)
        break
      await sleep(1000)
    }
  })

  it('should enqueue 5 transactions', async () => {
    for (let i = 1; i < 6; i++) {
      const block = await L2Provider.getBlockWithTransactions(i)
      assert.equal(block.transactions.length, 1)
      const tx = block.transactions[0]
      assert.equal(tx.from, '0x0000000000000000000000000000000000000000')
      assert.equal(tx.txType, 'EIP155')
      assert.equal(tx.queueOrigin, 'l1')
      assert.equal(tx.to, '0x' + `${i-1}`.repeat(40))
    }
  })
})
