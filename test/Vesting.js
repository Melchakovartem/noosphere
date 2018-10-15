const Crowdsale = artifacts.require('./test_helpers/RoundATestHelper.sol');
const Vesting = artifacts.require('./test_helpers/VestingTestHelper.sol');
const Token = artifacts.require('./Token');

contract('Vesting', function(accounts) {

	const startTime = 10000;
  const endTime = startTime + 10* 60*60*24;

    function getRoles() {
        return {
           owner: accounts[0],
           investor1: accounts[1],
           investor2: accounts[2],
           investor3: accounts[3],
        };
    }

	function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

  function getPurchasedTokens(eth) {
  	return eth / 0.003785; 
  }

  function rounding(amount) {
      return Math.round((amount) / Math.pow(10,10)) * Math.pow(10, 10); //solution for rounding problems
  }

    async function instantiate() {
        const role = getRoles();
        const crowdsale = await Crowdsale.new(role.beneficiary, role.foundation, role.advisers, 
                                              role.nodes, role.team, startTime, 
                                              endTime, {from: role.owner});    
        const crowdsaleAddress = await crowdsale.address;
        const token = await Token.at(await crowdsale.token());
        const vesting = await Vesting.new(await token.address, {from: role.owner});
        return [crowdsale, crowdsaleAddress, token, role, vesting];
    };
    
	beforeEach('setup contract for each test', async function () {
        [crowdsale, crowdsaleAddress, token, role, vesting] = await instantiate();
        await crowdsale.setVesting(vesting.address, {from: role.owner});

    })

    it('has an owner', async function () {
        assert.equal(await vesting.owner(), role.owner);
    })

    it('has an crowdsale', async function () {
        await vesting.changeCrowdsale(crowdsaleAddress, {from: role.owner});
        assert.equal(await vesting.crowdsale(), crowdsaleAddress);
    })

    it('sends bonus tokens for pulls to vesting', async function () {
        ethInvest = ETH(378.5);
        purchasedTokens = getPurchasedTokens(ethInvest);
        bonusTokens = rounding(purchasedTokens * 0.15);

        await vesting.changeCrowdsale(crowdsaleAddress, {from: role.owner});

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

        assert.equal(await crowdsale.isFreezingAmount(role.investor1), purchasedTokens);
        assert.equal(await token.balanceOf(vesting.address), bonusTokens);
        assert.equal(await token.totalFrozenTokens(), purchasedTokens);
        assert.equal(await token.totalCollected(), ethInvest);
    })

    it('sends bonus tokens for early birds to vesting', async function () {
        ethInvest = ETH(75.7);
        purchasedTokens = getPurchasedTokens(ethInvest);
        bonusTokens = rounding(purchasedTokens * 0.20);

        await vesting.changeCrowdsale(crowdsaleAddress, {from: role.owner});

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

        assert.equal(await crowdsale.isFreezingAmount(role.investor1), purchasedTokens);
        assert.equal(await token.balanceOf(vesting.address), bonusTokens);
        assert.equal(await token.totalFrozenTokens(), purchasedTokens);
        assert.equal(await token.totalCollected(), ethInvest);
    })

    it('recievs bonus tokens for early birds when passed 3 months', async function () {
        ethInvest = ETH(378.5);
        purchasedTokens = getPurchasedTokens(ethInvest);
        bonusTokens = rounding(purchasedTokens * 0.15);

        await vesting.changeCrowdsale(crowdsaleAddress, {from: role.owner});

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

        await vesting.setTime(startTime + (90*24*60*60), {from: role.owner});

        await vesting.recieveMyTokens({from: role.investor1});

        assert.equal(await token.balanceOf(role.investor1), bonusTokens);
    })

    it('does not recieve bonus tokens for early birds when not passed 3 months', async function () {
        ethInvest = ETH(378.5);
        purchasedTokens = getPurchasedTokens(ethInvest);
        bonusTokens = rounding(purchasedTokens * 0.15);

        await vesting.changeCrowdsale(crowdsaleAddress, {from: role.owner});

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

        await vesting.setTime(startTime + (89*24*60*60), {from: role.owner});

        try {
           await vesting.recieveMyTokens({from: role.investor1});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.balanceOf(role.investor1), 0);
    })

    it('recievs bonus tokens for early birds when passed 4 months', async function () {
        ethInvest = ETH(75.7);;
        purchasedTokens = getPurchasedTokens(ethInvest);
        bonusTokens = rounding(purchasedTokens * 0.2);

        await vesting.changeCrowdsale(crowdsaleAddress, {from: role.owner});

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

        await vesting.setTime(startTime + (120*24*60*60), {from: role.owner});

        await vesting.recieveMyTokens({from: role.investor1});

        assert.equal(await token.balanceOf(role.investor1), bonusTokens);
    })

    it('does not recieve bonus tokens for early birds when not passed 4 months', async function () {
        ethInvest = ETH(75.7);
        purchasedTokens = getPurchasedTokens(ethInvest);
        bonusTokens = rounding(purchasedTokens * 0.2);

        await vesting.changeCrowdsale(crowdsaleAddress, {from: role.owner});

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

        await vesting.setTime(startTime + (119*24*60*60), {from: role.owner});

        try {
           await vesting.recieveMyTokens({from: role.investor1});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.balanceOf(role.investor1), 0);
    })
})










