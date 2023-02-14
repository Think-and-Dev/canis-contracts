const networks = require('./hardhat.networks')

require('@nomicfoundation/hardhat-toolbox')
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-abi-exporter')
require('hardhat-gas-reporter')
require('hardhat-docgen')
require('hardhat-contract-sizer')

const config = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks,
  gasReporter: {
    currency: 'USD',
    gasPrice: 30,
    enabled: process.env.REPORT_GAS ? true : false
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      avalanche: process.env.AVALANCHE_API_KEY,
      avalancheFujiTestnet: process.env.AVALANCHE_API_KEY
    }
  },
  mocha: {
    timeout: 30000
  },
  abiExporter: {
    path: './abis',
    runOnCompile: true,
    clear: true,
    flat: true,
    except: ['PaymentSplitter']
  }
}

module.exports = config
