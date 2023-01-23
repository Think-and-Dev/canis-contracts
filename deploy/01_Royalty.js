const { dim, green, cyan, chainName, displayResult } = require('../utils/utils')
const config = require('../config')
const { verifyContract } = require('../utils/verifyContracts')
const version = 'v0.1.0'
const contractName = 'Royalty'

module.exports = async (hardhat) => {
  const { getNamedAccounts, deployments, getChainId, network } = hardhat
  const { deploy } = deployments
  const { admin, deployer } = await getNamedAccounts()

  const chainId = parseInt(await getChainId(), 10)
  const {
    royaltyReceiver,
    percentageReceiver,
    percentageUBI
  } = config['Royalty'][chainId]

  const defaultSwapBurner = (await ethers.getContract('SwapBurner', this.deployer)).address

  const constructorArguments = [[royaltyReceiver, defaultSwapBurner], [percentageReceiver, percentageUBI]]

  const isTestEnvironment = chainId === 31337 || chainId === 1337

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  dim(`Blockchain Canis Contracts - Deploy ${contractName}`)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? 'local' : 'remote'})`)
  dim(`deployer: ${deployer}`)

  cyan(`\nDeploying ${contractName}...`)
  const result = await deploy(contractName, {
    args: constructorArguments,
    contract: contractName,
    from: deployer,
    skipIfAlreadyDeployed: false
  })

  displayResult(contractName, result)

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  green('Contract Deployments Complete!')
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  await verifyContract(network, result, contractName, constructorArguments)

  return true
}

const id = contractName + version
module.exports.tags = [contractName, version]
module.exports.id = id
