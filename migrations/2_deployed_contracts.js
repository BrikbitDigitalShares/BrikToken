var token = artifacts.require('BrikToken');
var firstCrowdsale = artifacts.require('FirstCrowdsale');
var secondCrowdsale = artifacts.require('SecondCrowdsale');
var safeMath = artifacts.require('SafeMath')


module.exports = function (deployer, network, accounts) {

  tokenOwner = accounts[0];

  signer = accounts[1];
  otherSig = accounts[2];

  firstWalletAddr = accounts[3];
  secondWalletAddr = accounts[4];
  //library deploy and link
  deployer.deploy(safeMath)
  deployer.link(safeMath, [token, firstCrowdsale, secondCrowdsale])
  deployer.deploy(token)
    .then(() => {
      return deployer.deploy(firstCrowdsale, [signer, otherSig], firstWalletAddr, token.address, tokenOwner);
    })
    .then(() => {
      return deployer.deploy(secondCrowdsale, [signer, otherSig], secondWalletAddr, token.address, tokenOwner);
    })
    .then(async () => {
      var t = await token.deployed();
      await t.approve(firstCrowdsale.address, 25000000 * 10 ** 18);
      await t.approve(secondCrowdsale.address, 75000000 * 10 ** 18);
    });
}
