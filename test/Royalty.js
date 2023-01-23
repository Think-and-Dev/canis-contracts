/* eslint-disable no-undef */
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers, getNamedAccounts } = require('hardhat')

describe('Royalty', function () {
    before(async () => {
        const signers = await ethers.getSigners()
        const { deployer } = await getNamedAccounts()
        this.deployer = deployer
        this.alice = signers[1]
        this.bob = signers[2]
        this.charly = signers[3]
        this.charly = signers[4]
        this.daemon = signers[5]
        this.Royalty = await ethers.getContractFactory('Royalty')
        this.MockToken = await ethers.getContractFactory('MockToken')
        this.payeeG1 = [this.alice.address, this.bob.address, this.charly.address]
        this.shareG1 = [20, 10, 70]
    })

    beforeEach(async () => {
        this.royalty = await this.Royalty.deploy(this.payeeG1, this.shareG1)
        this.WETH = await this.MockToken.deploy('WRAPPED ETH', 'WETH', '1000000000000')
    })

    it('Should have initialized correctly', async () => {
        //GIVEN
        const expectedTotalShares = '100'
        const expectedReleases = 0
        const expectedReleaseable = 0
        const expectedOwner = this.deployer
        const expectedPayee = this.payeeG1
        //WHEN
        const shares = await this.royalty.totalShares()
        //THEN
        expect(shares).to.be.equal(expectedTotalShares)
        await Promise.all(
            this.payeeG1.map(async (payee, index) => {
                expect(await this.royalty.payee(index)).to.be.equal(payee)
                expect(await this.royalty["released(address)"](payee)).to.be.equal(0)
                expect(await this.royalty["releasable(address)"](payee)).to.be.equal(0)
            })
        )
    })

    it('Should be able to accept payments', async () => {
        //GIVEN
        const expectBalance = '1000'
        const initiialBalance = await this.WETH.balanceOf(this.royalty.address)
        //WHEN
        await this.WETH.transfer(this.royalty.address, expectBalance)
        //THEN
        expect(initiialBalance).to.be.equal(0)
        expect(await this.WETH.balanceOf(this.royalty.address)).to.be.equal(expectBalance)
    })

    it('Should have corrects shares', async () => {
        //GIVEN
        const sharesP1 = await this.royalty.shares(this.payeeG1[0])
        const sharesNotValid = await this.royalty.shares(this.daemon.address)
        //THEN
        expect(sharesP1).to.be.equal(this.shareG1[0])
        expect(sharesNotValid).to.be.equal(0)
    })

    it('Should be able to remove address of payee', async () => {
        //GIVEN
        const oldPayee1 = await this.royalty.payee(0)
        const oldPayee3 = await this.royalty.payee(2)
        const payeeToRemove = this.payeeG1[0]
        const sharePayee1 = await this.royalty.shares(payeeToRemove)
        const oldTotalShare = await this.royalty.totalShares()
        //WHEN
        await expect(this.royalty.removePayee(0, payeeToRemove))
            .to.emit(this.royalty, 'PayeeRemove')
            .withArgs(payeeToRemove, sharePayee1)
        const actualPayee1 = await this.royalty.payee(0)
        const actualTotalShare = await this.royalty.totalShares()
        //THEN
        expect(oldPayee1).to.be.equal(payeeToRemove)
        expect(actualPayee1).to.be.equal(oldPayee3)
        expect(actualTotalShare).to.be.equal(BigNumber.from(oldTotalShare).sub(sharePayee1))
    })

    it('Should be able to distributes funds to payees', async () => {
        //GIVEN
        //send 1000 weth
        await this.WETH.transfer(this.royalty.address, '1000')
        //calculate balance of accounts
        const actualPayee1 = await this.WETH.balanceOf(this.payeeG1[0])
        const actualPayee2 = await this.WETH.balanceOf(this.payeeG1[1])
        const actualPayee3 = await this.WETH.balanceOf(this.payeeG1[2])

        //get amount to receive of WETH
        const releseablePayee1 = await this.royalty["releasable(address,address)"](this.WETH.address, this.payeeG1[0])
        const releseablePayee2 = await this.royalty["releasable(address,address)"](this.WETH.address, this.payeeG1[1])
        const releseablePayee3 = await this.royalty["releasable(address,address)"](this.WETH.address, this.payeeG1[2])
        //calculate amount of weth 
        const expectAmountPayee1 = ((this.shareG1[0] * 1000) / 100)
        const expectAmountPayee2 = ((this.shareG1[1] * 1000) / 100)
        const expectAmountPayee3 = ((this.shareG1[2] * 1000) / 100)

        //WHEN
        await this.royalty["release(address,address)"](this.WETH.address, this.payeeG1[0])
        await this.royalty["release(address,address)"](this.WETH.address, this.payeeG1[1])
        await this.royalty["release(address,address)"](this.WETH.address, this.payeeG1[2])

        //THEN
        expect(actualPayee1).to.be.equal(0)
        expect(actualPayee2).to.be.equal(0)
        expect(actualPayee3).to.be.equal(0)
        //verify amount to recive
        expect(releseablePayee1).to.be.equal(expectAmountPayee1)
        expect(releseablePayee2).to.be.equal(expectAmountPayee2)
        expect(releseablePayee3).to.be.equal(expectAmountPayee3)
        //verify received
        expect(await this.WETH.balanceOf(this.payeeG1[0])).to.be.equal(expectAmountPayee1)
        expect(await this.WETH.balanceOf(this.payeeG1[1])).to.be.equal(expectAmountPayee2)
        expect(await this.WETH.balanceOf(this.payeeG1[2])).to.be.equal(expectAmountPayee3)
    })

})
