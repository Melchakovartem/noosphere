var Token = artifacts.require("./Token.sol");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(Token);
};