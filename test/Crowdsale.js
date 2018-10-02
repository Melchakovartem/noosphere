const Crowdsale = artifacts.require('./test_heplers/CrowdsaleTestHelper.sol');
const Token = artifacts.require('./Token');

contract('Crowdsale', function(accounts) {

	const startTime = 10000;
    const endTime = startTime + 10* 60*60*24;
    const pricePerTokenInWei = 37850000000000;
    const totalBonusTokens = 6225450000000000000000;

    function getRoles() {
        return {
           owner: accounts[0],
           investor1: accounts[1],
           investor2: accounts[2],
           foundation: accounts[3],
           advisers: accounts[4],
           nodes: accounts[5],
           team: accounts[6],
           newOwner: accounts[7]
        };
    }

	function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

    function getPurchasedTokens(eth) {
    	return eth / 0.003785; 
    }

    async function instantiate() {
        const role = getRoles();
        const crowdsale = await Crowdsale.new(role.foundation, role.advisers, 
                                              role.nodes, role.team, startTime, 
                                              endTime, {from: role.owner});    
        const crowdsaleAddress = await crowdsale.address;
        const token = await Token.at(await crowdsale.token());
        return [crowdsale, crowdsaleAddress, token, role];
    };
    
	beforeEach('setup contract for each test', async function () {
        [crowdsale, crowdsaleAddress, token, role] = await instantiate();
    })

    it('has an owner', async function () {
        assert.equal(await crowdsale.owner(), role.owner);
    })

    it('has an foundation wallet', async function () {
        assert.equal(await crowdsale.multisigFoundation(), role.foundation);
    })

    it('has an advisers wallet', async function () {
        assert.equal(await crowdsale.multisigAdvisers(), role.advisers);
    })

    it('has an nodes wallet', async function () {
        assert.equal(await crowdsale.multisigNodes(), role.nodes);
    })

    it('has an team wallet', async function () {
        assert.equal(await crowdsale.multisigTeam(), role.team);
    })

    it('has token from crowdsale', async function () {
    	assert.equal(await crowdsale.token(), token.address);
    })

    it('changes an owner', async function () {
        await crowdsale.changeOwner(role.newOwner, {from: role.owner});
        assert.equal(await crowdsale.owner(), role.newOwner);
    })

    it('buys tokens', async function() {
        ethInvest = ETH(0.3785);
        purchasedTokens = getPurchasedTokens(ethInvest);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
    	
    	assert.equal(await token.balanceOf(role.investor1), purchasedTokens);
    	assert.equal(await token.totalSupply(), purchasedTokens);
    	assert.equal(await token.totalCollected(), ethInvest);
    })

    it('does not buy tokens when ico on pause', async function() {
    	ethInvest = ETH(0.3785);

    	await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.pause({from: role.owner});

    	try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
        
    	assert.equal(await token.balanceOf(role.investor1), 0);
    	assert.equal(await token.totalSupply(), 0);
    	assert.equal(await token.totalCollected(), 0);
    })

    it('does not buy tokens when fund < min value', async function() {
        ethInvest = ETH(0.1);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
        
        assert.equal(await token.balanceOf(role.investor1), 0);
        assert.equal(await token.totalSupply(), 0);
        assert.equal(await token.totalCollected(), 0);
    })

    it('buys tokens when ico on unpause', async function() {
    	ethInvest = ETH(0.3785);
    	purchasedTokens = getPurchasedTokens(ethInvest);

    	await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.pause({from: role.owner});

    	try {
            await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }

        assert.equal(await token.balanceOf(role.investor1), 0);
    	assert.equal(await token.totalSupply(), 0);
    	assert.equal(await token.totalCollected(), 0);

        await crowdsale.unpause({from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

    	assert.equal(await token.balanceOf(role.investor1), purchasedTokens);
    	assert.equal(await token.totalSupply(), purchasedTokens);
    	assert.equal(await token.totalCollected(), ethInvest);
    })

    it('does not buy tokens when ico not started', async function() {
    	ethInvest = ETH(0.3785);

    	await crowdsale.setTime(startTime - 10, {from: role.owner});

    	try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
        
    	assert.equal(await token.balanceOf(role.investor1), 0);
    	assert.equal(await token.totalSupply(), 0);
    	assert.equal(await token.totalCollected(), 0);
    })

    it('does not buy tokens when ico ended', async function() {
    	ethInvest = ETH(0.3785);

    	await crowdsale.setTime(endTime + 10, {from: role.owner});

    	try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
        
    	assert.equal(await token.balanceOf(role.investor1), 0);
    	assert.equal(await token.totalSupply(), 0);
    	assert.equal(await token.totalCollected(), 0);
    })

})










