const {getContractFactory} = require('@eth-optimism/contracts')
const {OptimismProvider} = require('@eth-optimism/provider')
const ethers = require('ethers');
const {providers, Wallet, utils} = ethers;
const {JsonRpcProvider} = providers;

/**
 * Common setup function for each test. Relies
 * on environment variables being set correctly.
 */
async function setup() {
  const env = process.env

  if (!env.ADDRESS_MANAGER_ADDRESS)
    throw new Error('ADDRESS_MANAGER_ADDRESS not set')

  if (!env.L1_NODE_WEB3_URL)
    throw new Error('L1_NODE_WEB3_URL not set')

  if (!env.PRIVATE_KEY)
    throw new Error('MNEMONIC not set')

  const L1Provider = new JsonRpcProvider(env.L1_NODE_WEB3_URL)
  const L1Wallet = new Wallet(env.PRIVATE_KEY)
    .connect(L1Provider)

  const addr = await L1Wallet.getAddress()

  const manager = getContractFactory('Lib_AddressManager')
    .connect(L1Wallet)
    .attach(env.ADDRESS_MANAGER_ADDRESS)

  // Add any L1 contracts required for testing here
  const contracts = [
    'OVM_CanonicalTransactionChain'
  ]

  const out = {}
  for (const contract of contracts) {
    const addr = await manager.getAddress(contract)
    const factory = getContractFactory(contract)
    out[contract] = factory.attach(addr).connect(L1Wallet)
  }

  return out
}

function getProviders() {
  const env = process.env

  if (!env.L1_NODE_WEB3_URL)
    throw new Error('L1_NODE_WEB3_URL not set')

  if (!env.L2_NODE_WEB3_URL)
    throw new Error('L2_NODE_WEB3_URL not set')

  const L1Provider = new JsonRpcProvider(env.L1_NODE_WEB3_URL)
  const L2Provider = new OptimismProvider(env.L2_NODE_WEB3_URL)

  return {L1Provider, L2Provider}
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  setup,
  getProviders,
  sleep,
}
