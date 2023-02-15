/* eslint-disable no-undef */
const {expect} = require('chai')
const {ethers, getNamedAccounts} = require('hardhat')

describe('Swap Burner', function () {
  before(async () => {
    const signers = await ethers.getSigners()
    const {deployer} = await getNamedAccounts()
    this.deployer = deployer
    this.alice = signers[1]
    this.bob = signers[2]
    this.charly = signers[3]
    this.MockToken = await ethers.getContractFactory('MockToken')
    this.MockUniswapRouter = await ethers.getContractFactory('MockUniswapRouter')
    this.SwapBurner = await ethers.getContractFactory('SwapBurner')
  })

  beforeEach(async () => {
    this.UBI = await this.MockToken.deploy('UBI Token', 'UBI', '1000000000000')
    this.WETH = await this.MockToken.deploy('WRAPPED ETH', 'WETH', '1000000000000')
    this.uniswapRouter = await this.MockUniswapRouter.deploy(this.WETH.address, this.UBI.address, 2)
    this.swapBurner = await this.SwapBurner.deploy(this.uniswapRouter.address, this.UBI.address)
  })

  it('Should have initialized correctly', async () => {
    //GIVEN
    const expectedUniswapAddress = this.uniswapRouter.address
    const expectedUBIToken = this.UBI.address
    const expectedOwner = this.deployer
    //WHEN
    const uniswapRouter = await this.swapBurner.Uniswap()
    const ubiToken = await this.swapBurner.UBI()
    const owner = await this.swapBurner.owner()
    //THEN
    expect(expectedUniswapAddress).to.be.equal(uniswapRouter)
    expect(expectedUBIToken).to.be.equal(ubiToken)
    expect(owner).to.be.equal(expectedOwner)
  })

  it('Should be able to approve UniswapRouter', async () => {
    //GIVEN
    const initialAllowance = await this.UBI.allowance(this.swapBurner.address, this.uniswapRouter.address)
    //WHEN
    await this.swapBurner.approveUniSwap()
    const finalAllowance = await this.UBI.allowance(this.swapBurner.address, this.uniswapRouter.address)
    //THEN
    expect(initialAllowance).to.be.equal(0)
    expect(finalAllowance).to.be.equal(ethers.constants.MaxUint256)
  })

  it('Should be able to receive ether, swap and burn UBI tokens', async () => {
    //GIVEN
    await this.swapBurner.approveUniSwap()
    /**
     * REQUIRED TO MOCK CONTRACT WITH UBI TOKENS
     */
    await this.UBI.transfer(this.uniswapRouter.address, '1000')
    const initialSwapBurnerUBIBalance = await this.UBI.balanceOf(this.swapBurner.address)
    const initialTotalUBISupply = await this.UBI.totalSupply()
    const mockSwapFactor = await this.uniswapRouter.mulFactor()
    this.alice.sendTransaction({to: this.swapBurner.address, value: '200'})
    //WHEN
    const swapBurnerInitialETHBalance = await ethers.provider.getBalance(this.swapBurner.address)
    await this.swapBurner.connect(this.alice).swapAndBurn()
    const finalSwapBurnerUBIBalance = await this.UBI.balanceOf(this.swapBurner.address)
    const expectedFinalUBISupply = 1000000000000 - 200 / mockSwapFactor
    const finalTotalUBISupply = await this.UBI.totalSupply()
    const swapBurnerFinalETHBalance = await ethers.provider.getBalance(this.swapBurner.address)
    //THEN
    expect(initialSwapBurnerUBIBalance).to.be.equal(0)
    expect(finalSwapBurnerUBIBalance).to.be.equal(0)
    expect(initialTotalUBISupply).to.be.equal(1000000000000)
    expect(finalTotalUBISupply).to.be.equal(expectedFinalUBISupply)
    expect(swapBurnerFinalETHBalance).to.be.lte(swapBurnerInitialETHBalance)
  })

  it('Should emit event when swapAndBurn', async () => {
    //GIVEN
    await this.swapBurner.approveUniSwap()
    this.alice.sendTransaction({to: this.swapBurner.address, value: '200'})
    /**
     * REQUIRED TO MOCK CONTRACT WITH UBI TOKENS
     */
    await this.UBI.transfer(this.uniswapRouter.address, '1000')
    //WHEN THEN
    await expect(this.swapBurner.connect(this.alice).swapAndBurn())
      .to.emit(this.swapBurner, 'SwapAndBurn')
      .withArgs(this.alice.address, 200, 100)
  })
})
