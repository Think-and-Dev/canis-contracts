const { dim, green, cyan, chainName, displayResult } = require('../utils/utils')
const version = 'v0.1.0'
const contractName = 'CanisNFT'
const config = require('../config')
const { verifyContract } = require('../utils/verifyContracts')

module.exports = async (hardhat) => {
  const { getNamedAccounts, deployments, getChainId, network } = hardhat
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = parseInt(await getChainId(), 10)

  defaultRoyaltyReceiver = (await ethers.getContract('Royalty', this.deployer)).address

  const {
    cap,
    name,
    symbol,
    defaultFeeNumerator,
    startGiftingIndex,
    endGiftingIndex,
    contractUri } = config[contractName][chainId]

  const isTestEnvironment = chainId === 31337 || chainId === 1337

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  dim(`Blockchain Canis Contracts - Deploy ${contractName}`)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? 'local' : 'remote'})`)
  dim(`deployer: ${deployer}`)
  const constructorArguments = [cap, name, symbol, defaultRoyaltyReceiver, defaultFeeNumerator, startGiftingIndex, endGiftingIndex, contractUri]

  cyan(`\nDeploying ${contractName}...`)
  const CanisNFTResult = await deploy(contractName, {
    args: constructorArguments,
    contract: contractName,
    from: deployer,
    skipIfAlreadyDeployed: false
  })

  displayResult(contractName, CanisNFTResult)

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  green('Contract Deployments Complete!')
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
  await verifyContract(network, CanisNFTResult, contractName, constructorArguments)

  return true
}

const id = contractName + version
module.exports.tags = [contractName, version]
module.exports.id = id
