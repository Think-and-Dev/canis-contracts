/* eslint-disable no-undef */
const { throws } = require('assert')
const { expect } = require('chai')
const { ethers, deployments, getNamedAccounts, getChainId } = require('hardhat')
const config = require('../config')

/**
 * By default, ContractFactory and Contract instances are connected to the first signer.
 */
describe('Canis NFT', function () {
  before(async () => {
    const signers = await ethers.getSigners()
    const { deployer } = await getNamedAccounts()
    const chainId = parseInt(await getChainId(), 10)
    this.config = config['CanisNFT'][chainId]
    this.deployer = deployer
    this.owner = signers[0]
    this.alice = signers[1]
    this.bob = signers[2]
    this.charly = signers[3]
    this.royaltyReceiver = signers[4]
    this.CanisNFT = await ethers.getContractFactory('CanisNFT')
    this.Royalty = await ethers.getContractFactory('Royalty')
    this.maxClaim = config['CanisNFT'].maxClaim
  })

  beforeEach(async () => {
    await deployments.fixture(['Royalty', 'CanisNFT'])
    this.canisNFT = await ethers.getContract('CanisNFT', this.deployer)
    //await ethers.getContract('Royalty', deployer)
    this.defaultRoyaltyReceiver = (await ethers.getContract('Royalty', this.deployer)).address
  })

  it('Should have initialized correctly', async () => {
    //GIVEN
    const expectedName = this.config.name
    const expectedSymbol = this.config.symbol
    const expectedCap = this.config.cap
    const expectedDefaultRoyaltyReceiver = this.defaultRoyaltyReceiver
    const expectedDefaultFeeNumerator = this.config.defaultFeeNumerator
    const expectedStartGiftingIndex = this.config.startGiftingIndex
    const expectedEndGiftingIndex = this.config.endGiftingIndex
    const expectedContractUri = this.config.contractUri
    const expectedOwner = this.deployer
    const expectedMaxClaim = this.maxClaim

    const salePrice = 1000
    const expectedRoyaltyAmount = salePrice * (expectedDefaultFeeNumerator / 10000)

    //WHEN
    const name = await this.canisNFT.name()
    const symbol = await this.canisNFT.symbol()
    const cap = await this.canisNFT.CAP()
    const { receiver, royaltyAmount } = await this.canisNFT.royaltyInfo(1, 1000)
    const startGiftingIndex = await this.canisNFT.startGiftingIndex()
    const endGiftingIndex = await this.canisNFT.endGiftingIndex()
    const contractUri = await this.canisNFT.contractURI()
    const owner = await this.canisNFT.owner()
    const maxClaim = await this.canisNFT.maxClaim();
    //THEN
    expect(name).to.be.equal(expectedName)
    expect(symbol).to.be.equal(expectedSymbol)
    expect(cap).to.be.equal(expectedCap)
    expect(receiver).to.be.equal(expectedDefaultRoyaltyReceiver)
    expect(royaltyAmount).to.be.equal(expectedRoyaltyAmount)
    expect(startGiftingIndex).to.be.equal(expectedStartGiftingIndex)
    expect(endGiftingIndex).to.be.equal(expectedEndGiftingIndex)
    expect(contractUri).to.be.equal(expectedContractUri)
    expect(owner).to.be.equal(expectedOwner)
    expect(maxClaim).to.be.equal(expectedMaxClaim)
  })

  it('Should not create contract if cap is zero', async () => {
    //GIVEN
    const name = this.config.name
    const symbol = this.config.symbol
    const cap = 0
    const defaultRoyaltyReceiver = this.defaultRoyaltyReceiver
    const defaultFeeNumerator = this.config.defaultFeeNumerator
    const startGiftingIndex = this.config.startGiftingIndex
    const endGiftingIndex = this.config.endGiftingIndex
    const contractUri = this.config.contractUri
    const expectedOwner = this.deployer
    //WHEN //THEN

    await expect(this.CanisNFT.deploy(cap, name, symbol, defaultRoyaltyReceiver, defaultFeeNumerator, startGiftingIndex, endGiftingIndex, contractUri)).to.be.revertedWith(
      'NFTCapped: cap is 0'
    )
  })

  it('Should be able to set max claim', async () => {
    //set up
    const actualMaxClaim = this.maxClaim
    const newMaxClaim = 1
    await expect(this.canisNFT.setMaxClaim(newMaxClaim))
      .to.emit(this.canisNFT, 'MaxClaimUpdated')
      .withArgs(actualMaxClaim, newMaxClaim)
    const maxClaim = await this.canisNFT.maxClaim()
    expect(maxClaim).to.be.equal(newMaxClaim)
  })

  it('Should not be able to set max claim no-owner', async () => {
    await expect(this.canisNFT.connect(this.bob).setMaxClaim(2)).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('Should be able to mint owner', async () => {
    //GIVEN
    const aliceInitialBalance = await this.canisNFT.balanceOf(this.alice.address)
    //WHEN
    await expect(this.canisNFT.safeMint())
      .to.emit(this.canisNFT, 'Transfer')
      .withArgs(ethers.constants.AddressZero, this.deployer, 1)
  })

  it('Should not be able to mint no-owner', async () => {
    //GIVEN
    const aliceInitialBalance = await this.canisNFT.balanceOf(this.alice.address)
    //WHEN
    await expect(this.canisNFT.connect(this.alice).safeMint()).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('Should revert to get a not minted tokenUri', async () => {
    //GIVEN
    const bobInitialBalance = await this.canisNFT.balanceOf(this.bob.address)
    expect(bobInitialBalance).to.be.equal(0)
    //WHEN //THEN
    await expect(this.canisNFT.connect(this.bob).tokenURI(2)).to.be.revertedWith('ERC721: invalid token ID')
  })

  it.only('Should able to claim max claim is set as zero', async () => {
    //GIVEN
    await this.canisNFT.safeMint()
    await this.canisNFT.connect(this.alice).claim();
    const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
    //WHEN //THEN
    expect(aliceBalance).to.be.equal(1)
  })

  it('Should not claim if user has already max claim value', async () => {
    //SET UP
    await this.canisNFT.setMaxClaim(1)
    const maxClaim = await this.canisNFT.maxClaim()
    expect(maxClaim).to.be.equal(1)
    //GIVEN
    await this.canisNFT.safeMint()
    await this.canisNFT.connect(this.alice).claim();
    const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
    //WHEN //THEN
    expect(aliceBalance).to.be.equal(1)
    await expect(this.canisNFT.connect(this.alice).claim()).to.be.revertedWith('CANISNFT: OWNER CANNOT HAVE MORE THAN ONE NFT')
  })

  it('Should not be able to mint once gap limit is reached', async () => {
    //GIVEN
    const cap = this.config.cap
    for (let i = 0; i < cap; i++) {
      await this.canisNFT.safeMint()
    }
    //WHEN //THEN
    await expect(this.canisNFT.safeMint()).to.be.revertedWith('NFTCAPPED: cap exceeded')
  })

  it('Should be able to change owner', async () => {
    //GIVEN
    const currentOwner = await this.canisNFT.owner()
    const newOwner = this.owner.address
    //WHEN
    await this.canisNFT.transferOwnership(newOwner)
    const expectedNewOwner = await this.canisNFT.owner()
    //THEN
    expect(currentOwner).to.be.equal(this.deployer)
    expect(newOwner).to.be.equal(expectedNewOwner)
  })

  it('Should set default token royalty', async () => {
    //GIVEN
    const royaltyReceiver = this.royaltyReceiver.address
    const feeNumerator = 100
    //WHEN //THEN
    await expect(this.canisNFT.setDefaultRoyalty(royaltyReceiver, feeNumerator))
      .to.emit(this.canisNFT, 'DefaultRoyaltyUpdated')
      .withArgs(royaltyReceiver, feeNumerator)
  })

  it('If not set, royalty info should return constructor values', async () => {
    //GIVEN //WHEN
    const tokenId = 0
    const salePrice = 1000
    const expectedRoyaltyAmount = salePrice * (this.config.defaultFeeNumerator / 10000)
    const { receiver, royaltyAmount } = await this.canisNFT.royaltyInfo(tokenId, salePrice)
    //THEN
    expect(receiver).to.be.equal(this.defaultRoyaltyReceiver)
    expect(royaltyAmount).to.be.equal(expectedRoyaltyAmount)
  })

  it('Should be able to get default token royalty for a non-minted token', async () => {
    //GIVEN
    const expectedRoyaltyReceiver = this.royaltyReceiver.address
    const expectedFeeNumerator = '10'
    await this.canisNFT.setDefaultRoyalty(expectedRoyaltyReceiver, expectedFeeNumerator)
    //WHEN
    const tokenId = 0
    const salePrice = 1000
    const { receiver, royaltyAmount } = await this.canisNFT.royaltyInfo(tokenId, salePrice)
    //THEN
    expect(receiver).to.be.equal(expectedRoyaltyReceiver)
    expect(royaltyAmount).to.be.equal('1')
  })

  it('Should be able to get token default royalty for minted token', async () => {
    //GIVEN
    await this.canisNFT.safeMint()
    const salePrice = 1000
    const expectedRoyaltyAmount = salePrice * (this.config.defaultFeeNumerator / 10000)
    //WHEN
    const { receiver, royaltyAmount } = await this.canisNFT.royaltyInfo(1, salePrice)
    //THEN
    expect(receiver).to.be.equal(this.defaultRoyaltyReceiver)
    expect(royaltyAmount).to.be.equal(expectedRoyaltyAmount)
  })

  it('Should be able to set custom royalty', async () => {
    //GIVEN
    const defaultRoyaltyReceiver = this.defaultRoyaltyReceiver
    const defaultFeeNumerator = this.config.defaultFeeNumerator
    const customRoyaltyReceiver = this.royaltyReceiver.address
    const customFeeNumerator = 10
    const salePrice = 1000
    //WHEN
    const { receiver: defaultReceiver, royaltyAmount: defaultRoyaltyAmount } = await this.canisNFT.royaltyInfo(
      1,
      salePrice
    )
    await this.canisNFT.setTokenRoyalty(2, customRoyaltyReceiver, customFeeNumerator)
    const { receiver: customReceiver, royaltyAmount: customRoyalty } = await this.canisNFT.royaltyInfo(2, salePrice)
    //THEN
    expect(defaultReceiver).to.be.equal(defaultRoyaltyReceiver)
    expect(defaultRoyaltyAmount).to.be.equal(salePrice * (defaultFeeNumerator / 10000))
    expect(customReceiver).to.be.equal(customRoyaltyReceiver)
    expect(customRoyalty).to.be.equal(salePrice * (customFeeNumerator / 10000))
  })

  it('Should be able to reset token royalty for a token', async () => {
    //GIVEN
    const salePrice = 1000
    const initialFeeNumberator = 10
    const updatedFeeNumberator = 1000

    const { receiver: initialRoyaltyReceiver, royaltyAmount: initialRoyaltyAmount } = await this.canisNFT.royaltyInfo(
      0,
      initialFeeNumberator
    )
    await this.canisNFT.setTokenRoyalty(0, this.royaltyReceiver.address, initialFeeNumberator)
    const { receiver: updatedRoyaltyReceiver, royaltyAmount: updatedRoyaltyAmount } = await this.canisNFT.royaltyInfo(
      0,
      updatedFeeNumberator
    )
    //WHEN
    await this.canisNFT.resetTokenRoyalty(0)
    const { receiver: finalRoyaltyReceiver, royaltyAmount: finalRoyaltyAmount } = await this.canisNFT.royaltyInfo(0, salePrice)
    //THEN
    expect(initialRoyaltyReceiver).to.be.equal(this.defaultRoyaltyReceiver)
    expect(initialRoyaltyAmount).to.be.equal(salePrice * (initialFeeNumberator / 10000))
    expect(updatedRoyaltyReceiver).to.be.equal(this.royaltyReceiver.address)
    expect(finalRoyaltyReceiver).to.be.equal(initialRoyaltyReceiver)
    expect(finalRoyaltyAmount).to.be.equal(salePrice * (updatedFeeNumberator / 10000))
  })

  it('Should have a default value for contractUri', async () => {
    //GIVEN
    const expectedContractUri = this.config.contractUri;
    //WHEN
    const value = await this.canisNFT.contractURI()
    //THEN
    expect(value).to.be.equal(expectedContractUri)
  })

  it('Should be able to set token uri owner', async () => {
    //GIVEN
    const tokenOneUri = "ipfs://hash1"
    const tokenTwoUri = "ipfs://hash2"
    await this.canisNFT.safeMint()
    await this.canisNFT.safeMint()
    //WHEN
    await this.canisNFT.setTokenURI(1, tokenOneUri)
    await this.canisNFT.setTokenURI(2, tokenTwoUri)
    //THEN
    expect(tokenOneUri).to.be.equal(await this.canisNFT.tokenURI(1))
    expect(tokenTwoUri).to.be.equal(await this.canisNFT.tokenURI(2))
  })

  it('Should not be able to set token uri no-owner', async () => {
    //GIVEN
    const tokenOneUri = "ipfs://hash1"
    await this.canisNFT.safeMint()
    //WHEN //THEN
    await expect(this.canisNFT.connect(this.alice).setTokenURI(1, tokenOneUri)).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('Should be able to mint batch tokens owner', async () => {
    //GIVEN
    const cap = this.config.cap
    //WHEN
    await this.canisNFT.safeMintBatch(cap)
    const balance = await this.canisNFT.balanceOf(this.deployer)
    //THEN
    expect(balance).to.be.equal(cap)
    await expect(this.canisNFT.safeMint()).to.be.revertedWith('NFTCAPPED: cap exceeded')
  })

  it('Should not be able to mint batch tokens no-owner', async () => {
    //GIVEN //WHEN //THEN
    await expect(this.canisNFT.connect(this.alice).safeMintBatch(5)).to.be.revertedWith('Ownable: caller is not the owner')
  })

  it('Should be able to set token uri batch owner', async () => {
    //GIVEN
    const tokenUris = ["ipfs://hash1", "ipfs://hash2"]
    await this.canisNFT.safeMint()
    await this.canisNFT.safeMint()
    //WHEN
    const actualTokenUri1 = await this.canisNFT.tokenURI(1)
    const actualTokenUri2 = await this.canisNFT.tokenURI(2)
    await this.canisNFT.setTokenURIBatch(1, tokenUris)
    //THEN
    expect(actualTokenUri1.length).to.be.equal(0)
    expect(actualTokenUri2.length).to.be.equal(0)
    expect(tokenUris[0]).to.be.equal(await this.canisNFT.tokenURI(1))
    expect(tokenUris[1]).to.be.equal(await this.canisNFT.tokenURI(2))
  })

  it('Should not be able to set token uri batch no-owner', async () => {

  })

  it('Should be able to claim no-owner', async () => {
    //GIVEN
    const tokenUris = ["ipfs://hash1", "ipfs://hash2"]
    await this.canisNFT.safeMint()
    await this.canisNFT.safeMint()
    await this.canisNFT.tokenURI(1)
    await this.canisNFT.tokenURI(2)
    //WHEN
    await this.canisNFT.connect(this.alice).claim();
    await this.canisNFT.connect(this.bob).claim();
    const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
    const bobBalance = await this.canisNFT.balanceOf(this.bob.address)
    //WHEN //THEN
    expect(aliceBalance).to.be.equal(1)
    expect(bobBalance).to.be.equal(1)
  })

  it('Should not be able to claim no-owner', async () => {
    //GIVEN
    const tokenUris = ["ipfs://hash1", "ipfs://hash2"]
    await this.canisNFT.safeMint()
    await this.canisNFT.safeMint()
    await this.canisNFT.tokenURI(1)
    await this.canisNFT.tokenURI(2)
    //WHEN
    await this.canisNFT.connect(this.alice).claim();
    await this.canisNFT.connect(this.bob).claim();
    const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
    const bobBalance = await this.canisNFT.balanceOf(this.bob.address)
    //WHEN //THEN
    expect(aliceBalance).to.be.equal(1)
    expect(bobBalance).to.be.equal(1)
    await expect(this.canisNFT.connect(this.charly).claim()).to.be.revertedWith('CANISNFT: CANNOT MINT NON GIFTABLE NFT')
  })

  it('Should not have a default value for contractUri', async () => {
    //GIVEN
    //WHEN
    const value = await this.canisNFT.contractURI()
    //THEN
    expect(value.length).to.be.equal(0)
  })

  it('Should return setted value for contractUri', async () => {
    //GIVEN
    const contractUri = 'https://ipfs.io/ipfs/QmbBXi3zGaFZ4S2cAea56cGhpD6eSRNL9b6BCUnrTpukT6'
    //WHEN //THEN
    await expect(this.canisNFT.setContractURI(contractUri))
      .to.emit(this.canisNFT, 'ContractURIUpdated')
      .withArgs(contractUri)
  })

  it('Should be able to gift owner', async () => {
    //GIVEN
    const tokenUris = ["ipfs://hash1", "ipfs://hash2"]
    await this.canisNFT.safeMint()
    await this.canisNFT.safeMint()
    await this.canisNFT.tokenURI(1)
    await this.canisNFT.tokenURI(2)
    //WHEN
    await this.canisNFT.gift(this.alice.address);
    const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
    //THEN
    expect(aliceBalance).to.be.equal(1)
  })

  it('Should not be able to gift no-owner', async () => {
    //GIVEN
    const tokenUris = ["ipfs://hash1", "ipfs://hash2"]
    await this.canisNFT.safeMint()
    await this.canisNFT.safeMint()
    await this.canisNFT.tokenURI(1)
    await this.canisNFT.tokenURI(2)
    //WHEN //THEN
    await expect(this.canisNFT.connect(this.charly).gift(this.alice.address)).to.be.revertedWith('Ownable: caller is not the owner')
  })

})
