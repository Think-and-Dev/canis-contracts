/* eslint-disable no-undef */
const {expect} = require('chai')
const {ethers, deployments, getNamedAccounts, getChainId, config} = require('hardhat')
const proyectConfig = require('../config')
const {keccak256} = require('ethers/lib/utils')

/**
 * By default, ContractFactory and Contract instances are connected to the first signer.
 */
describe('Canis NFT', function () {
  before(async () => {
    const signers = await ethers.getSigners()
    const {deployer} = await getNamedAccounts()
    const chainId = parseInt(await getChainId(), 10)
    this.config = proyectConfig['CanisNFT'][chainId]
    this.deployer = deployer
    this.owner = signers[0]
    this.alice = signers[1]
    this.bob = signers[2]
    this.charly = signers[3]
    this.royaltyReceiver = signers[4]
    this.CanisNFT = await ethers.getContractFactory('CanisNFT')
    this.Royalty = await ethers.getContractFactory('Royalty')
    this.DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
  })

  beforeEach(async () => {
    await deployments.fixture(['Royalty', 'CanisNFT', 'SwapBurner'])
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
    const expectedContractUri = this.config.contractUri
    const salePrice = 1000
    const expectedRoyaltyAmount = salePrice * (expectedDefaultFeeNumerator / 10000)

    //WHEN
    const name = await this.canisNFT.name()
    const symbol = await this.canisNFT.symbol()
    const cap = await this.canisNFT.CAP()
    const {receiver, royaltyAmount} = await this.canisNFT.royaltyInfo(1, 1000)
    const contractUri = await this.canisNFT.contractURI()
    //THEN
    expect(name).to.be.equal(expectedName)
    expect(symbol).to.be.equal(expectedSymbol)
    expect(cap).to.be.equal(expectedCap)
    expect(receiver).to.be.equal(expectedDefaultRoyaltyReceiver)
    expect(royaltyAmount).to.be.equal(expectedRoyaltyAmount)
    expect(contractUri).to.be.equal(expectedContractUri)
    expect(true).to.be.equal(await this.canisNFT.hasRole(this.DEFAULT_ADMIN_ROLE, this.deployer))
  })

  it('Should not create contract if cap is zero', async () => {
    //GIVEN
    const name = this.config.name
    const symbol = this.config.symbol
    const cap = 0
    const defaultRoyaltyReceiver = this.defaultRoyaltyReceiver
    const defaultFeeNumerator = this.config.defaultFeeNumerator
    const contractUri = this.config.contractUri
    //WHEN //THEN

    await expect(
      this.CanisNFT.deploy(cap, name, symbol, defaultRoyaltyReceiver, defaultFeeNumerator, contractUri)
    ).to.be.revertedWith('NFTCapped: cap is 0')
  })

  it('Should be able to mint owner', async () => {
    //GIVEN
    const tokenId = 1
    const tokenOneUri = 'ipfs://hash1'
    await this.canisNFT.safeLazyMint()
    //WHEN
    await expect(this.canisNFT.safeMint(this.alice.address, tokenId, tokenOneUri))
      .to.emit(this.canisNFT, 'Transfer')
      .withArgs(ethers.constants.AddressZero, this.alice.address, tokenId)
    const actualUri = await this.canisNFT.tokenURI(tokenId)
    expect(actualUri).to.be.equal(tokenOneUri)
  })

  it('Should not be able to mint an existent token ', async () => {
    //GIVEN
    const tokenId = 1
    const tokenOneUri = 'ipfs://hash1'
    await this.canisNFT.safeLazyMint()
    //WHEN
    await expect(this.canisNFT.safeMint(this.alice.address, tokenId, tokenOneUri))
      .to.emit(this.canisNFT, 'Transfer')
      .withArgs(ethers.constants.AddressZero, this.alice.address, tokenId)
    await expect(this.canisNFT.safeMint(this.alice.address, tokenId, tokenOneUri)).to.be.revertedWith(
      `NFTCAPPED: tokenId not available to minted`
    )
  })

  it('Should not be able to mint non-existent tokenId', async () => {
    //GIVEN
    const tokenId = 3
    const tokenOneUri = 'ipfs://hash1'
    await this.canisNFT.safeLazyMint()
    //WHEN
    await expect(this.canisNFT.safeMint(this.alice.address, tokenId, tokenOneUri)).to.be.revertedWith(
      `NFTCAPPED: tokenId not available to minted`
    )
  })

  it('Should not be able to mint no-owner', async () => {
    //GIVEN
    const tokenId = 1
    const tokenOneUri = 'ipfs://hash1'
    await this.canisNFT.safeLazyMint()
    //WHEN
    await expect(
      this.canisNFT.connect(this.alice).safeMint(this.alice.address, tokenId, tokenOneUri)
    ).to.be.revertedWith(
      `AccessControl: account ${this.alice.address.toLowerCase()} is missing role ${this.DEFAULT_ADMIN_ROLE}`
    )
  })

  it('Should revert to get a not minted tokenUri', async () => {
    //GIVEN
    const bobInitialBalance = await this.canisNFT.balanceOf(this.bob.address)
    expect(bobInitialBalance).to.be.equal(0)
    //WHEN //THEN
    await expect(this.canisNFT.connect(this.bob).tokenURI(2)).to.be.revertedWith('ERC721: invalid token ID')
  })

  // it('Should able to claim max claim is set as zero', async () => {
  //   //GIVEN
  //   await this.canisNFT.safeMint()
  //   await this.canisNFT.connect(this.alice).claim();
  //   const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
  //   //WHEN //THEN
  //   expect(aliceBalance).to.be.equal(1)
  // })

  it('Should not be able to mint once gap limit is reached', async () => {
    //GIVEN
    const cap = this.config.cap
    const tokenOneUri = 'ipfs://hash1'
    //WHEN //THEN
    await expect(this.canisNFT.safeMint(this.alice.address, cap + 1, tokenOneUri)).to.be.revertedWith(
      'NFTCAPPED: cap exceeded'
    )
  })

  it('Should be able to change admin', async () => {
    //GIVEN
    const currentOwnerHasRole = await this.canisNFT.hasRole(this.DEFAULT_ADMIN_ROLE, this.deployer)
    const newOwner = this.owner.address
    //WHEN
    await this.canisNFT.grantRole(this.DEFAULT_ADMIN_ROLE, newOwner)
    const newOwnerHasRole = await this.canisNFT.hasRole(this.DEFAULT_ADMIN_ROLE, newOwner)
    //THEN
    expect(currentOwnerHasRole).to.be.true
    expect(newOwnerHasRole).to.be.true
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
    const {receiver, royaltyAmount} = await this.canisNFT.royaltyInfo(tokenId, salePrice)
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
    const {receiver, royaltyAmount} = await this.canisNFT.royaltyInfo(tokenId, salePrice)
    //THEN
    expect(receiver).to.be.equal(expectedRoyaltyReceiver)
    expect(royaltyAmount).to.be.equal('1')
  })

  it('Should be able to get token default royalty for minted token', async () => {
    //GIVEN
    const tokenId = 1
    const tokenTwoUri = 'ipfs://hash2'
    await this.canisNFT.safeLazyMint()
    await this.canisNFT.safeMint(this.alice.address, tokenId, tokenTwoUri)
    const salePrice = 1000
    const expectedRoyaltyAmount = salePrice * (this.config.defaultFeeNumerator / 10000)
    //WHEN
    const {receiver, royaltyAmount} = await this.canisNFT.royaltyInfo(1, salePrice)
    //THEN
    expect(receiver).to.be.equal(this.defaultRoyaltyReceiver)
    expect(royaltyAmount).to.be.equal(expectedRoyaltyAmount)
  })

  it('Should have a default value for contractUri', async () => {
    //GIVEN
    const expectedContractUri = this.config.contractUri
    //WHEN
    const value = await this.canisNFT.contractURI()
    //THEN
    expect(value).to.be.equal(expectedContractUri)
  })

  // it('Should be able to claim no-owner', async () => {
  //   //GIVEN
  //   const tokenUris = ["ipfs://hash1", "ipfs://hash2"]
  //   await this.canisNFT.safeMint()
  //   await this.canisNFT.safeMint()
  //   await this.canisNFT.tokenURI(1)
  //   await this.canisNFT.tokenURI(2)
  //   //WHEN
  //   await this.canisNFT.connect(this.alice).claim();
  //   await this.canisNFT.connect(this.bob).claim();
  //   const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
  //   const bobBalance = await this.canisNFT.balanceOf(this.bob.address)
  //   //WHEN //THEN
  //   expect(aliceBalance).to.be.equal(1)
  //   expect(bobBalance).to.be.equal(1)
  // })

  // it('Should not be able to claim no-owner', async () => {
  //   //GIVEN
  //   const tokenUris = ["ipfs://hash1", "ipfs://hash2"]
  //   await this.canisNFT.safeMint()
  //   await this.canisNFT.safeMint()
  //   await this.canisNFT.tokenURI(1)
  //   await this.canisNFT.tokenURI(2)
  //   //WHEN
  //   await this.canisNFT.connect(this.alice).claim();
  //   await this.canisNFT.connect(this.bob).claim();
  //   const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
  //   const bobBalance = await this.canisNFT.balanceOf(this.bob.address)
  //   //WHEN //THEN
  //   expect(aliceBalance).to.be.equal(1)
  //   expect(bobBalance).to.be.equal(1)
  //   await expect(this.canisNFT.connect(this.charly).claim()).to.be.revertedWith('CANISNFT: CANNOT MINT NON GIFTABLE NFT')
  // })

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

  it('Should be able to claim', async () => {
    //GIVEN
    const payload = [
      this.alice.address,
      keccak256(Buffer.from('ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json')),
      1,
      31337
    ]
    const mintRequestPayload = {
      to: this.alice.address,
      uri: 'ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json',
      tokenId: 1,
      chainId: 31337
    }
    //mint nft
    await this.canisNFT.safeLazyMint()
    //get wallet and sign
    const accounts = config.networks.hardhat.accounts
    const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${0}`)
    // const wallet = new ethers.Wallet(wallet1.privateKey);
    const hashToken = Buffer.from(
      ethers.utils.solidityKeccak256(['address', 'bytes32', 'uint256', 'uint256'], payload).slice(2),
      'hex'
    )
    const hashSig = await wallet1.signMessage(hashToken)
    //WHEN
    await this.canisNFT.connect(this.alice).claim(mintRequestPayload, hashSig, {value: '100000000000000'})
    //THEN
    const aliceBalance = await this.canisNFT.balanceOf(this.alice.address)
    expect(aliceBalance).to.be.equal(1)
  })
  it('Should not be able to claim same tokenId', async () => {
    //GIVEN
    const payload = [
      this.alice.address,
      keccak256(Buffer.from('ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json')),
      1,
      31337
    ]
    const mintRequestPayload = {
      to: this.alice.address,
      uri: 'ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json',
      tokenId: 1,
      chainId: 31337
    }
    //mint nft
    await this.canisNFT.safeLazyMint()
    //get wallet and sign
    const accounts = config.networks.hardhat.accounts
    const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${0}`)
    // const wallet = new ethers.Wallet(wallet1.privateKey);
    const hashToken = Buffer.from(
      ethers.utils.solidityKeccak256(['address', 'bytes32', 'uint256', 'uint256'], payload).slice(2),
      'hex'
    )
    const hashSig = await wallet1.signMessage(hashToken)
    //WHEN
    await this.canisNFT.connect(this.alice).claim(mintRequestPayload, hashSig, {value: '100000000000000'})
    //THEN
    await expect(
      this.canisNFT.connect(this.alice).claim(mintRequestPayload, hashSig, {value: '100000000000000'})
    ).to.be.revertedWith(`CANISNFT: tokenId not available`)
  })
  it('Should not be able to claim different chainId', async () => {
    //GIVEN
    const payload = [
      this.alice.address,
      keccak256(Buffer.from('ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json')),
      1,
      5
    ]
    const mintRequestPayload = {
      to: this.alice.address,
      uri: 'ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json',
      tokenId: 1,
      chainId: 5
    }
    //mint nft
    await this.canisNFT.safeLazyMint()
    //get wallet and sign
    const accounts = config.networks.hardhat.accounts
    const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${0}`)
    // const wallet = new ethers.Wallet(wallet1.privateKey);
    const hashToken = Buffer.from(
      ethers.utils.solidityKeccak256(['address', 'bytes32', 'uint256', 'uint256'], payload).slice(2),
      'hex'
    )
    const hashSig = await wallet1.signMessage(hashToken)
    //WHEN
    //THEN
    await expect(
      this.canisNFT.connect(this.alice).claim(mintRequestPayload, hashSig, {value: '100000000000000'})
    ).to.be.revertedWith(`CANISNFT: the chain id must be the same as the network`)
  })
  it('Should not be able to claim signed by not role mint', async () => {
    //GIVEN
    const payload = [
      this.alice.address,
      keccak256(Buffer.from('ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json')),
      1,
      31337
    ]
    const mintRequestPayload = {
      to: this.alice.address,
      uri: 'ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json',
      tokenId: 1,
      chainId: 31337
    }
    //mint nft
    await this.canisNFT.safeLazyMint()
    //get wallet and sign
    const accounts = config.networks.hardhat.accounts
    const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${2}`)
    // const wallet = new ethers.Wallet(wallet1.privateKey);
    const hashToken = Buffer.from(
      ethers.utils.solidityKeccak256(['address', 'bytes32', 'uint256', 'uint256'], payload).slice(2),
      'hex'
    )
    const hashSig = await wallet1.signMessage(hashToken)
    //WHEN
    //THEN
    await expect(
      this.canisNFT.connect(this.alice).claim(mintRequestPayload, hashSig, {value: '100000000000000'})
    ).to.be.revertedWith(`CANISNFT: must have minter role to mint`)
  })
  it('Should not be able to claim not available tokenId', async () => {
    //GIVEN
    const payload = [
      this.alice.address,
      keccak256(Buffer.from('ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json')),
      2,
      31337
    ]
    const mintRequestPayload = {
      to: this.alice.address,
      uri: 'ipfs://bafybeibhjlqtsjxsrygxyjluhyffxmnfwnkiha72olxnqk6yfc63lsjtjq/dog5.json',
      tokenId: 2,
      chainId: 31337
    }
    //mint nft
    await this.canisNFT.safeLazyMint()
    //get wallet and sign
    const accounts = config.networks.hardhat.accounts
    const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${2}`)
    // const wallet = new ethers.Wallet(wallet1.privateKey);
    const hashToken = Buffer.from(
      ethers.utils.solidityKeccak256(['address', 'bytes32', 'uint256', 'uint256'], payload).slice(2),
      'hex'
    )
    const hashSig = await wallet1.signMessage(hashToken)
    //WHEN
    //THEN
    await expect(
      this.canisNFT.connect(this.alice).claim(mintRequestPayload, hashSig, {value: '100000000000000'})
    ).to.be.revertedWith(`CANISNFT: tokenId not available`)
  })
})
