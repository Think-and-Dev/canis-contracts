const chalk = require('chalk')
const { ethers, getNamedAccounts, getChainId } = require('hardhat')

const { dim, green, yellow, cyan } = require('../utils/utils')
const posters = require('../metadata/posters')
const config = require('../config')

async function main() {
  const { deployer } = await getNamedAccounts()
  const chainId = parseInt(await getChainId(), 10)
  const myconfig = config['CanisNFT'][chainId]
  canisNFT = await ethers.getContract('CanisNFT', deployer)

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  dim(` CanisNFT Contracts - Mint Batch Posters `)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
  /*
    const feeData = await ethers.provider.getFeeData();
    console.log(feeData)
  */
  const name = await this.canisNFT.name()
  const symbol = await this.canisNFT.symbol()
  const cap = await this.canisNFT.CAP()
  const assetToMint = myconfig.assetToMint

  yellow(`\nCurrent status...`)

  cyan(`name: ${name}`)
  cyan(`symbol: ${symbol}`)
  cyan(`cap: ${cap.toNumber()}`)
  cyan(`asset to mint: ${assetToMint}`)


  yellow(`\nsafeMintBatch: ${assetToMint}`)
  const mint = await canisNFT.safeMintBatch(assetToMint, { gasLimit: 999408631 })
  // mint.wait()

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  green('CanisNFT Contracts - Mint Batch Posters Complete!')
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });