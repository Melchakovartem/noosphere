const Crowdsale = artifacts.require('./test_heplers/CrowdsaleTestHelper.sol');
const Token = artifacts.require('./Token');

contract('Crowdsale', function(accounts) {

	const startTime = 10000;
    const endTime = startTime + 10* 60*60*24;

    function getRoles() {
        return {
           owner: accounts[0],
           investor1: accounts[1],
           investor2: accounts[2],
           investor3: accounts[3],
           foundation: accounts[4],
           advisers: accounts[5],
           nodes: accounts[6],
           team: accounts[7],
           newOwner: accounts[8],
           newAdvisers: accounts[9],
           newTeam: accounts[10],
           managerKYC: accounts[11],
           beneficiary: accounts[12]
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
        const crowdsale = await Crowdsale.new(role.beneficiary, role.foundation, role.advisers, 
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

    it('changes advisers wallet', async function () {
        await crowdsale.changeAdvisers(role.newAdvisers, {from: role.owner});
        assert.equal(await crowdsale.multisigAdvisers(), role.newAdvisers);
    })

    it('changes team wallet', async function () {
        await crowdsale.changeTeam(role.newTeam, {from: role.owner});
        assert.equal(await crowdsale.multisigTeam(), role.newTeam);
    })

    it("deposits", async function() {
        await crowdsale.deposit({from: role.owner, value: ETH(1)});
        assert.equal(web3.eth.getBalance(crowdsale.address), ETH(1));
    });

    it('funds', async function() {
        ethInvest = ETH(3.785);
        purchasedTokens = getPurchasedTokens(ethInvest);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        
        assert.equal(await token.totalCollected(), ethInvest);
    })

    it('does not fund when ico on pause', async function() {
    	ethInvest = ETH(3.785);

    	await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.pause({from: role.owner});

    	try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
        
    	assert.equal(await token.totalCollected(), 0);
    })

    it('funds when ico on unpause', async function() {
        ethInvest = ETH(3.785);
        purchasedTokens = getPurchasedTokens(ethInvest);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.pause({from: role.owner});

        try {
            await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }

        await crowdsale.unpause({from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

        assert.equal(await token.totalCollected(), ethInvest);        
    })

    it('does not fund when money < min value', async function() {
        ethInvest = ETH(0.01);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.totalCollected(), 0);
    })

    it('does not fund when ico not started', async function() {
    	ethInvest = ETH(3.785);

    	await crowdsale.setTime(startTime - 10, {from: role.owner});

    	try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
        
        assert.equal(await token.totalCollected(), 0);
    })

    it('does not fund when ico ended', async function() {
    	ethInvest = ETH(3.785);

    	await crowdsale.setTime(endTime + 10, {from: role.owner});

    	try {
           await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.totalCollected(), 0);
    })

    it('locks tokens when fund and kyc not accepted', async function() {
        ethInvest1 = ETH(3.785);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest1});
        
        assert.equal(await token.balanceOf(role.investor1), 0);
        assert.equal(await token.totalSupply(), 0);
        assert.equal(await token.totalCollected(), ethInvest1);
        assert.equal(await token.totalFrozenTokens(), purchasedTokens);
        assert.equal(await crowdsale.isFreezingAmount(role.investor1), purchasedTokens);
    })

    it('recieves tokens when backer is accepted KYC', async function() {
        ethInvest1 = ETH(3.785);
        purchasedTokens = getPurchasedTokens(ethInvest1);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest1});
        
        assert.equal(await token.balanceOf(role.investor1), 0);
        assert.equal(await token.totalSupply(), 0);
        assert.equal(await token.totalCollected(), ethInvest1);
        assert.equal(await token.totalFrozenTokens(), purchasedTokens);
        assert.equal(await crowdsale.isFreezingAmount(role.investor1), purchasedTokens);

        await crowdsale.acceptKYC(role.investor1, {from: role.owner});

        assert.equal(await token.balanceOf(role.investor1), purchasedTokens);
        assert.equal(await token.totalSupply(), purchasedTokens);
        assert.equal(await token.totalCollected(), ethInvest1);
        assert.equal(await token.totalFrozenTokens(), 0);
        assert.equal(await crowdsale.isFreezingAmount(role.investor1), 0);
        
    })

    it('does not accept kyc for not backer', async function() {
        try {
           await crowdsale.acceptKYC(role.investor1, {from: role.owner});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
    })

    it('accepts KYC from managerKYC', async function() {
        ethInvest1 = ETH(3.785);
        purchasedTokens = getPurchasedTokens(ethInvest1);

        await crowdsale.setTime(startTime + 10, {from: role.owner});

        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest1});

        await crowdsale.changeManagerKYC(role.managerKYC, {from: role.owner})

        await crowdsale.acceptKYC(role.investor1, {from: role.managerKYC});
        
        assert.equal(await crowdsale.isFreezingAmount(role.investor1), 0);
        assert.equal(await token.balanceOf(role.investor1), purchasedTokens);
    })
})










