const Crowdsale = artifacts.require('./test_heplers/CrowdsaleTestHelper.sol');
const Token = artifacts.require('./Token');

contract('Crowdsale', function(accounts) {

	const startTime = 10000;
    const endTime = startTime + 10* 60*60*24;
    const pricePerTokenInWei = 37850000000000;
    const totalBonusTokens = 6225450000000000000000;
    const hardCap = 255 * (10 ** 18);

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

    function correctRounding(amount) {
        return Math.round((amount) / Math.pow(10,10)) * Math.pow(10, 10); //solution for rounding problems
    }

    function getTokensDistribution(amount) {
        tokensForDistribution = amount * 100 / 32;
        distribution = {};

        distribution["foundation"] = tokensForDistribution * 29 / 100;
        distribution["advisers"] = tokensForDistribution * 6 / 100;
        distribution["nodes"] = tokensForDistribution * 26 / 100;
        distribution["team"] = Math.round((tokensForDistribution * 7 / 100) / Math.pow(10,8)) * Math.pow(10,8); //solution for rounding problems
        return distribution;
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

    it('does not buy tokens when hard cap is reached', async function() {
    	ethInvest1 = ETH(255);
    	ethInvest2 = ETH(0.3);

    	await crowdsale.setTime(startTime + 10, {from: role.owner});
        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest1});

    	try {
           await crowdsale.sendTransaction({from: role.investor2, to: crowdsaleAddress, value: ethInvest2});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

    	assert.equal(await token.balanceOf(role.investor2), 0);
    	assert.equal(await token.totalCollected(), ethInvest1);
    })

    it('recievs bonus 15% tokens when invest >= 250 ETH', async function() {
    	ethInvest = ETH(3.785);
    	purchasedTokens = getPurchasedTokens(ethInvest);
    	bonusTokens = purchasedTokens * 0.15;
    	totalTokens = bonusTokens + purchasedTokens;

    	await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

    	assert.equal(await token.balanceOf(role.investor1), totalTokens);
    	assert.equal(await token.totalSupply(), totalTokens);
    	assert.equal(await token.totalCollected(), ethInvest);
    })

    it('recievs bonus 20% tokens when 250 > invest > 50 ETH and ', async function() {
    	ethInvest = ETH(0.757);
    	purchasedTokens = getPurchasedTokens(ethInvest);
    	bonusTokens = purchasedTokens * 0.20;
    	totalTokens = bonusTokens + purchasedTokens;

    	await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest});

    	assert.equal(await token.balanceOf(role.investor1), totalTokens);
    	assert.equal(await token.totalSupply(), totalTokens);
    	assert.equal(await token.totalCollected(), ethInvest);
    })

    it('does not recieve bonus tokens because bonus tokens is ended ', async function() {
    	ethInvest1 = ETH(189.25);
        ethInvest2 = ETH(3.785);

    	purchasedTokens1 = getPurchasedTokens(ethInvest1);
        purchasedTokens2 = getPurchasedTokens(ethInvest2);
    	bonusTokens1 = totalBonusTokens;
    	totalTokens1 = purchasedTokens1 + bonusTokens1;

    	await crowdsale.setTime(startTime + 10, {from: role.owner});

    	await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest1});

        totalBonus = await crowdsale.totalBonusTokens();

        assert.equal(await crowdsale.totalMintedBonusTokens(), totalBonusTokens);

        await crowdsale.sendTransaction({from: role.investor2, to: crowdsaleAddress, value: ethInvest2});
    	
        assert.equal(await token.balanceOf(role.investor2), purchasedTokens2);
    	
        assert.equal(await crowdsale.totalMintedBonusTokens(), totalBonusTokens);

    })


    it('returns remaining money when hard cap is reached', async function(){
        ethInvest1 = ETH(251.215);
        ethInvest2 = ETH(4.785);

        await crowdsale.setTime(startTime + 10, {from: role.owner});
        balanceOwner = Number(web3.eth.getBalance(role.owner));

        purchasedTokens2 = getPurchasedTokens(ETH(3.785));
        totalTokens2 = purchasedTokens2;

        
        await crowdsale.sendTransaction({from: role.investor1, to: crowdsaleAddress, value: ethInvest1});
        await crowdsale.sendTransaction({from: role.investor2, to: crowdsaleAddress, value: ethInvest2});
        
        assert.equal(await token.balanceOf(role.investor2), totalTokens2);
        assert.equal(await token.totalCollected(), ETH(255));

        totalBalanceOwner = correctRounding(balanceOwner + hardCap);
        assert.equal(web3.eth.getBalance(role.owner), totalBalanceOwner);
    })

})










