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
        const token = await Token.new({from: role.owner});
        const vesting = await Vesting.new(await token.address, {from: role.owner});
        return [token, role, vesting];
    };
    
	beforeEach('setup contract for each test', async function () {
        [token, role, vesting] = await instantiate();
        await token.mint(vesting.address, 0.1e20, {from: role.owner});
        await vesting.setLock(role.investor1, 0.1e20, 90, {from: role.owner});
    })

    it('recievs bonus tokens when time passed', async function () {

        await vesting.setTime(91, {from: role.owner});

        await vesting.recieveMyTokens({from: role.investor1});

        assert.equal(await token.balanceOf(role.investor1), 0.1e20);
    })

    it('does not recieve bonus tokens when time not passed', async function () {

        await vesting.setTime(89, {from: role.owner});

        try {
            await vesting.recieveMyTokens({from: role.investor1});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.balanceOf(role.investor1), 0);
    })
})










