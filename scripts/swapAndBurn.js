const {ethers, getNamedAccounts, getChainId} = require('hardhat')

const {dim, green, yellow, cyan} = require('../utils/utils')
const config = require('../config')

async function main() {
  const signers = await ethers.getSigners()
  const deployer = signers[0]
  const chainId = parseInt(await getChainId(), 10)
  const myconfig = config['SwapBurner'][chainId]
  const swapBurner = await ethers.getContract('SwapBurner', deployer)

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  dim(` SwapBurner Contracts - swapAndBurn`)
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
  const ubiAddress = await swapBurner.UBI()
  const ubiToken = await ethers.getContractAt('MockToken', ubiAddress)
  const uniswapAddress = await swapBurner.Uniswap()
  const uniswap = await ethers.getContractAt('MockUniswapRouter', uniswapAddress)
  const WETH = await uniswap.WETH()
  const allowance = await ubiToken.allowance(swapBurner.address, myconfig.uniswapRouter)
  let tx = await deployer.sendTransaction({to: swapBurner.address, value: '10000000000000000'}) //0,01 eth
  await tx.wait()
  const balance = await ethers.provider.getBalance(swapBurner.address)

  yellow(`\nCurrent status...`)

  cyan(`deployer: ${deployer.address}`)
  cyan(`UBI: ${ubiAddress}`)
  cyan(`Uniswap: ${uniswapAddress}`)
  cyan(`WETH: ${WETH}`)
  cyan(`allowance: ${allowance}`)
  cyan(`balance: ${ethers.utils.formatEther(balance)}`)

  yellow(`\nswapAndBurn: ${balance}`)
  await uniswap.callStatic.swapExactETHForTokens(1, [WETH, ubiAddress], swapBurner.address, 1704215473, {
    value: balance
  })
  await swapBurner.callStatic.swapAndBurn()
  tx = await swapBurner.swapAndBurn()
  await tx.wait()

  dim('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  green('SwapBurner Contracts - swapAndBurn Complete!')
  dim('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
