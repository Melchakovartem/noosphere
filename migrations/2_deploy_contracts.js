var Token = artifacts.require("./Token.sol");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(Token, web3.eth.accounts[0]);
};