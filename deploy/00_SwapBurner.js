const {dim, green, cyan, chainName, displayResult} = require('../utils/utils')
const config = require('../config')
const version = 'v0.1.0'
const contractName = 'SwapBurner'
const {verifyContract} = require('../utils/verifyContracts')

module.exports = async (hardhat) => {
  const {getNamedAccounts, deployments, getChainId, network, ethers} = hardhat
  const {deploy} = deployments
  const {deployer} = await getNamedAccounts()

  const chainId = parseInt(await getChainId(), 10)

  const {uniswapRouter, ubiToken} = config[contractName][chainId]

  const isTestEnvironment = chainId === 31337 || chainId === 1337

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  dim(`Blockchain Canis Contracts - Deploy ${contractName}`)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? 'local' : 'remote'})`)
  dim(`deployer: ${deployer}`)

  // If avalanch we don't deploy the swap burner because UBI token does not exists in that network
  if (!uniswapRouter || !ubiToken) {
    cyan(`Network ${chainName(chainId)} does not have UBI token, so swapBurner is not going to be deployed`)
    return
  }
  const constructorArguments = [uniswapRouter, ubiToken]

  cyan(`\nDeploying ${contractName}...`)
  const SwapBurnerResult = await deploy(contractName, {
    args: constructorArguments,
    contract: contractName,
    from: deployer
  })

  displayResult(contractName, SwapBurnerResult)

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  green('Contract Deployments Complete!')
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  await verifyContract(network, SwapBurnerResult, contractName, constructorArguments)

  if (!isTestEnvironment) {
    cyan(`Approving ${contractName} Uniswap UBI...`)
    const swapBurner = await ethers.getContract('SwapBurner', deployer)
    await swapBurner.approveUniSwap()
  } else {
    cyan(`Network ${chainName(chainId)} is testnet skiping approve`)
  }

  return true
}

const id = contractName + version
module.exports.tags = [contractName, version]
module.exports.id = id
