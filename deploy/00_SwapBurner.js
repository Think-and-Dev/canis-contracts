const { getUnnamedAccounts } = require('hardhat')
const { dim, green, cyan, chainName, displayResult } = require('../utils/utils')
const config = require('../config')
const version = 'v0.1.0'
const contractName = 'SwapBurner'
const { verifyContract } = require('../utils/verifyContracts')

module.exports = async (hardhat) => {
  const { getNamedAccounts, deployments, getChainId, network } = hardhat
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const accounts = await getUnnamedAccounts()

  const chainId = parseInt(await getChainId(), 10)

  const {
    uniswapRouter,
    ubiToken,
    swapDeadline
  } = config[contractName][chainId]

  const isTestEnvironment = chainId === 31337 || chainId === 1337

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  dim(`Blockchain Canis Contracts - Deploy ${contractName}`)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? 'local' : 'remote'})`)
  dim(`deployer: ${deployer}`)

  const constructorArguments = [uniswapRouter, ubiToken, swapDeadline]

  cyan(`\nDeploying ${contractName}...`)
  const SwapBurnerResult = await deploy(contractName, {
    args: constructorArguments,
    contract: contractName,
    from: deployer,
    skipIfAlreadyDeployed: false
  })

  displayResult(contractName, SwapBurnerResult)

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  green('Contract Deployments Complete!')
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  await verifyContract(network, SwapBurnerResult, contractName, constructorArguments)


  return true
}

const id = contractName + version
module.exports.tags = [contractName, version]
module.exports.id = id
