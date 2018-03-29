const BigNumber = web3.BigNumber;
const chai = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const { expect } = chai
const _ = require('lodash')

const Brik = artifacts.require('BrikToken')
const FirstCrowdsale = artifacts.require('FirstCrowdsale')
const SecondCrowdsale = artifacts.require('SecondCrowdsale')

const { ecsign } = require('ethereumjs-util')
const abi = require('ethereumjs-abi')
const BN = require('bn.js')

const SIGNER_PK = Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex')
const SIGNER_ADDR = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'.toLowerCase()
const OTHER_PK = Buffer.from('0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1', 'hex')
const OTHER_ADDR = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef'.toLowerCase()
const MAX_AMOUNT = '1000000000000000000'

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

const expectEvent = (res, eventName) => {
  const ev = _.find(res.logs, { event: eventName })
  expect(ev).to.not.be.undefined
  return ev
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

      await token.approve(firstCrowdsale.address, '25000000')
      const allow = await token.allowance.call(owner, firstCrowdsale.address)
      allow.should.be.bignumber.equal('25000000')
    })

    it('should approve secondCrowdsale to sell on owner s behalf', async () => {

      await token.approve(secondCrowdsale.address, '75000000')
      const allow = await token.allowance.call(owner, secondCrowdsale.address)
      allow.should.be.bignumber.equal('75000000')
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
      console.log(price)
    })
  })
})
