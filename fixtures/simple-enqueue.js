const {getContractFactory} = require('@eth-optimism/contracts')
const {setup} = require('../common')

/**
 * Sends 5 enqueues to different targets
 */

;(async () => {
  const env = await setup()

  for (let i = 0; i < 5; i++) {
    const target = '0x' + `${i}`.repeat(40)
    const gasLimit = 210000
    const data = '0x'
    const response = await env.OVM_CanonicalTransactionChain
      .enqueue(target, gasLimit, data)
    await response.wait()
  }
})().catch(err => {
  console.log(err)
  process.exit(1)
})
