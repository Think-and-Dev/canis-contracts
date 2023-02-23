const {dim, green, cyan, chainName, displayResult} = require('../utils/utils')
const version = 'v0.1.0'
const contractName = 'CanisNFT'
const config = require('../config')
const {verifyContract} = require('../utils/verifyContracts')

module.exports = async (hardhat) => {
  const {getNamedAccounts, deployments, getChainId, network, ethers} = hardhat
  const {deploy} = deployments
  const {deployer} = await getNamedAccounts()

  const chainId = parseInt(await getChainId(), 10)

  const defaultRoyaltyReceiver = (await ethers.getContract('Royalty', this.deployer)).address

  const {owner, minter, cap, name, symbol, defaultFeeNumerator, contractUri, primarySalePrice, primarySaleReceiverAddress} =
    config[contractName][chainId]
  
  const defaultOwner = owner ? owner : deployer
  const isTestEnvironment = chainId === 31337 || chainId === 1337

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  dim(`Blockchain Canis Contracts - Deploy ${contractName}`)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? 'local' : 'remote'})`)
  dim(`deployer: ${deployer}`)
  const constructorArguments = [
    defaultOwner,
    minter,
    cap,
    name,
    symbol,
    defaultRoyaltyReceiver,
    defaultFeeNumerator,
    contractUri,
    primarySalePrice,
    primarySaleReceiverAddress
  ]

  cyan(`\nDeploying ${contractName}...`)
  const CanisNFTResult = await deploy(contractName, {
    deterministicDeployment: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(process.env.SALT)),
    args: constructorArguments,
    contract: contractName,
    from: deployer
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
