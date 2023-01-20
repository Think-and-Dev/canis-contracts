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
  dim(` CanisNFT Contracts - Mint Posters `)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
  /*
    const feeData = await ethers.provider.getFeeData();
    console.log(feeData)
  */
  const name = await this.canisNFT.name()
  const symbol = await this.canisNFT.symbol()
  const cap = await this.canisNFT.CAP()
  const { receiver, royaltyAmount } = await this.canisNFT.royaltyInfo(1, 1000)
  const startGiftingIndex = await this.canisNFT.startGiftingIndex()
  const endGiftingIndex = await this.canisNFT.endGiftingIndex()
  const contractUri = await this.canisNFT.contractURI()
  const owner = await this.canisNFT.owner()

  yellow(`\nCurrent status...`)

  cyan(`name: ${name}`)
  cyan(`symbol: ${symbol}`)
  cyan(`cap: ${cap.toNumber()}`)
  cyan(`receiver: ${receiver}`)
  cyan(`royaltyAmount: ${royaltyAmount.toNumber()}`)
  cyan(`startGiftingIndex: ${startGiftingIndex.toNumber()}`)
  cyan(`endGiftingIndex: ${endGiftingIndex.toNumber()}`)
  cyan(`contractUri: ${contractUri}`)
  cyan(`owner: ${owner}`)

  yellow(`\nsafeMintBatch: ${endGiftingIndex.toNumber()}`)
  await canisNFT.safeMintBatch(endGiftingIndex.toNumber())

  yellow(`\setTokenURI from tokenId 1 to ${endGiftingIndex.toNumber()}`)
  for (let i = 4; i <= endGiftingIndex.toNumber(); i = i + 3) {
    await canisNFT.setTokenURI(i, posters["dog1"].ipfs)
    await canisNFT.setTokenURI(i + 1, posters["dog2"].ipfs)
    await canisNFT.setTokenURI(i + 2, posters["dog3"].ipfs)
    cyan(`tokenId ${i}, ${i + 1}, ${i + 2} tokenURI setted`)
    await new Promise(r => setTimeout(r, 30000));
  }

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  green('CanisNFT Contracts - Mint Posters Complete!')
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });