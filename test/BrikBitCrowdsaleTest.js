const BigNumber = web3.BigNumber;
const chai = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const {expect} = chai
const _ = require('lodash')

const Brik = artifacts.require('BrikToken')
const FirstCrowdsale = artifacts.require('FirstCrowdsale')
const SecondCrowdsale = artifacts.require('SecondCrowdsale')

const {ecsign} = require('ethereumjs-util')
const abi = require('ethereumjs-abi')
const BN = require('bn.js')

const SIGNER_PK = Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex')
const SIGNER_ADDR = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()
const OTHER_PK = Buffer.from('0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1', 'hex')
const OTHER_ADDR = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'.toLowerCase()
const MAX_AMOUNT = '1000000000000000000'
const FIRST_CAP = 25000000000000000000000000; // allowance for first crowdsale
const SECOND_CAP = 75000000000000000000000000; // allowance for second crowdsale
const MIN_CONTR = 1000000000000000000; // 1 eth

const errorMsg = 'VM Exception while processing transaction: revert';

const getKycData = (userAddr, userid, icoAddr, pk) => {
    // sha256("Eidoo icoengine authorization", icoAddress, buyerAddress, buyerId, maxAmount);
    const hash = abi.soliditySHA256(
        ['string', 'address', 'address', 'uint64', 'uint'],
        ['Eidoo icoengine authorization', icoAddr, userAddr, new BN(userid), new BN(MAX_AMOUNT)]
    )
    const sig = ecsign(hash, pk)
    return {
        id: userid,
        max: MAX_AMOUNT,
        v: sig.v,
        r: '0x' + sig.r.toString('hex'),
        s: '0x' + sig.s.toString('hex')
    }
}

contract('BrikBit ICO', function (accounts) {

    before(async () => {

        this.token = await Brik.new()
        this.owner = await token.owner()
        this.firstCrowdsale = await FirstCrowdsale.new([SIGNER_ADDR], accounts[5], token.address, owner)
        this.secondCrowdsale = await SecondCrowdsale.new([SIGNER_ADDR], accounts[6], token.address, owner)

    })

    describe('migrations deployment', async () => {

        it('should deploy token contract correctly', async () => {
            await Brik.new()
        })

        it('should deploy firstCrowdsale contract correctly', async () => {
            await FirstCrowdsale.new([SIGNER_ADDR], accounts[5], token.address, owner)
        })

        it('should deploy secondCrowdsale contract correctly', async () => {
            await SecondCrowdsale.new([SIGNER_ADDR], accounts[6], token.address, owner)
        })
    })

    describe('crowdsale approvement', async () => {

        it('should approve firstCrowdsale to sell on owner s behalf', async () => {

            await token.approve(firstCrowdsale.address, '25000000 * 10 ** 18')
            const allow = await token.allowance.call(owner, firstCrowdsale.address)
            allow.should.be.bignumber.equal(FIRST_CAP)
        })

        it('should approve secondCrowdsale to sell on owner s behalf', async () => {

            await token.approve(secondCrowdsale.address, '75000000 * 10 ** 18')
            const allow = await token.allowance.call(owner, secondCrowdsale.address)
            allow.should.be.bignumber.equal(SECOND_CAP)
        })
    })

    describe('crowdsales deployment tests', async () => {

        it('should verify firstCrowdsale parameters', async () => {

            const started = await firstCrowdsale.started();
            const ended = await firstCrowdsale.ended();
            const price = await firstCrowdsale.price();
            const totalTokens = await firstCrowdsale.totalTokens();
            const wallet = await firstCrowdsale.wallet();
            const tokenOwner = await firstCrowdsale.tokenOwner();

            started.should.be.true;
            ended.should.be.false;
            price.should.be.bignumber.equal('5000000');
            totalTokens.should.be.bignumber.equal('25000000')
            wallet.should.be.equal(accounts[5]);
            tokenOwner.should.be.equal(owner);
        })

        it('should verify secondCrowdsale parameters', async () => {

            const started = await secondCrowdsale.started();
            const ended = await secondCrowdsale.ended();
            const totalTokens = await secondCrowdsale.totalTokens();
            const wallet = await secondCrowdsale.wallet();
            const tokenOwner = await secondCrowdsale.tokenOwner();
            const price = await secondCrowdsale.price();

            started.should.be.true;
            ended.should.be.false;
            totalTokens.should.be.bignumber.equal('75000000')
            wallet.should.be.equal(accounts[6]);
            tokenOwner.should.be.equal(owner);
            //console.log(price)
        })
    })
})

contract('First crowdsale KYC tests', function (accounts) {

    before(async () => {

        token = await Brik.new()
        owner = await token.owner()
        firstCrowdsale = await FirstCrowdsale.new([SIGNER_ADDR], accounts[5], token.address, owner)

    })

    describe('initialization', () => {

        it('should save signer', async () => {

            const sig = await firstCrowdsale.isKycSigner.call(SIGNER_ADDR)
            const othSig = await firstCrowdsale.isKycSigner.call(OTHER_ADDR)

            sig.should.be.true
            othSig.should.be.false

        })

        it('should fail the default callback', async () => {
            await firstCrowdsale.sendTransaction({
                from: accounts[4],
                to: firstCrowdsale.address,
                value: MIN_CONTR
            }).should.be.rejectedWith(errorMsg)
        })
    })

    describe('buyTokens()', () => {

        const buyer = accounts[4]
        const wallet = accounts[2]

        beforeEach(async () => {

            token = await Brik.new()
            owner = await token.owner()
            firstCrowdsale = await FirstCrowdsale.new([SIGNER_ADDR], wallet, token.address, owner)
            await token.approve(this.firstCrowdsale.address, 25000000 * 10 ** 18)
        })

        it('should reject for invalid signer', async () => {

            const d = getKycData(buyer, 1, this.firstCrowdsale.address, OTHER_PK)
            await this.firstCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value: MAX_AMOUNT
            }).should.be.rejectedWith(errorMsg)
        })

        it('should fulfill', async () => {

            const allow = await token.allowance.call(owner, firstCrowdsale.address)
            const d = getKycData(buyer, 1, this.firstCrowdsale.address, SIGNER_PK)

            allow.should.be.bignumber.equal(FIRST_CAP)
            await firstCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value: MAX_AMOUNT
            }).should.be.fulfilled
        })

        it('should reject for too big amount', async () => {
            const d = getKycData(buyer, 1, this.firstCrowdsale.address, SIGNER_PK)
            const value = web3.toBigNumber(MAX_AMOUNT).add(1)
            await firstCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value
            }).should.be.rejectedWith(errorMsg)
        })

        it('should reject for too little amount', async () => {
            const d = getKycData(buyer, 1, this.firstCrowdsale.address, SIGNER_PK)
            const value = web3.toBigNumber(MAX_AMOUNT).sub(1)
            await firstCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value
            }).should.be.rejectedWith(errorMsg)
        })
    })
})

contract('Second crowdsale KYC tests', function (accounts) {

    before(async () => {

        token = await Brik.new()
        owner = await token.owner()
        secondCrowdsale = await SecondCrowdsale.new([SIGNER_ADDR], accounts[5], token.address, owner)

    })

    describe('initialization', () => {

        it('should save signer', async () => {

            const sig = await secondCrowdsale.isKycSigner.call(SIGNER_ADDR)
            const othSig = await secondCrowdsale.isKycSigner.call(OTHER_ADDR)

            sig.should.be.true
            othSig.should.be.false

        })

        it('should fail the default callback', async () => {

            await secondCrowdsale.sendTransaction({
                from: accounts[4],
                to: secondCrowdsale.address,
                value: MIN_CONTR
            }).should.be.rejectedWith(errorMsg)
        })
    })

    describe('buyTokens()', () => {

        const buyer = accounts[4]
        const wallet = accounts[2]

        beforeEach(async () => {

            token = await Brik.new()
            owner = await token.owner()
            secondCrowdsale = await SecondCrowdsale.new([SIGNER_ADDR], wallet, token.address, owner)
            await token.approve(this.secondCrowdsale.address, 75000000 * 10 ** 18)
        })

        it('should reject for invalid signer', async () => {

            const d = getKycData(buyer, 1, this.secondCrowdsale.address, OTHER_PK)
            await this.secondCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value: MAX_AMOUNT
            }).should.be.rejectedWith(errorMsg)
        })

        it('should fulfill', async () => {

            const allow = await token.allowance.call(owner, secondCrowdsale.address)
            const d = getKycData(buyer, 1, this.secondCrowdsale.address, SIGNER_PK)

            allow.should.be.bignumber.equal(SECOND_CAP)
            await secondCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value: MAX_AMOUNT
            }).should.be.fulfilled
        })

        it('should reject for too big amount', async () => {
            const d = getKycData(buyer, 1, this.secondCrowdsale.address, SIGNER_PK)
            const value = web3.toBigNumber(MAX_AMOUNT).add(1)
            await secondCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value
            }).should.be.rejectedWith(errorMsg)
        })

        it('should reject for too little amount', async () => {
            const d = getKycData(buyer, 1, this.secondCrowdsale.address, SIGNER_PK)
            const value = web3.toBigNumber(MAX_AMOUNT).sub(1)
            await secondCrowdsale.buyTokens(d.id, d.max, d.v, d.r, d.s, {
                from: buyer,
                value
            }).should.be.rejectedWith(errorMsg)
        })
    })
})

