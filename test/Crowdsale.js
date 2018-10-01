const Crowdsale = artifacts.require('./test_heplers/CrowdsaleTestHelper.sol')
const Token = artifacts.require('./Token')

contract('Crowdsale', function(accounts) {

	const startTime = 10000;
	const durationDays = 10;
    const endTime = startTime + durationDays * 60*60*24;
    const lockTime =  100000;
    const pricePerTokenInWei = 37850000000000;
    const totalBonusTokens = 6225450000000000000000;

	function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

    function get_purchased_tokens(eth) {
    	return eth / 0.003785;
    }

    function getTokensDistribution(amount) {
        var tokensForDistribution = Math.floor(amount * 100) / 32;
        var distribution = {};

        distribution["foundation"] = tokensForDistribution * 29 / 100;
        distribution["advisers"] = tokensForDistribution * 6 / 100;
        distribution["nodes"] = tokensForDistribution * 26 / 100;
        distribution["team"] = Math.floor((tokensForDistribution * 7 / 100) / Math.pow(10,8)) * Math.pow(10,8); //solution for rounding problems
        return distribution;
    }
    
	beforeEach('setup contract for each test', async function () {
        owner = accounts[0]

        investor1 = accounts[1]
        investor2 = accounts[6]

        foundation = accounts[2]
        advisers = accounts[3]
        nodes = accounts[4]
        team = accounts[5]
        crowdsale = await Crowdsale.new(foundation, advisers, nodes, team, startTime, endTime, lockTime, {from: owner})
        crowdsale_address = await crowdsale.address
        token_address = await crowdsale.token()
        token = await Token.at(token_address)
    })

    it('has an owner', async function () {
        assert.equal(await crowdsale.owner(), owner)
    })

    it('has an foundation wallet', async function () {
        assert.equal(await crowdsale.multisigFoundation(), foundation)
    })

    it('has an advisers wallet', async function () {
        assert.equal(await crowdsale.multisigAdvisers(), advisers)
    })

    it('has an nodes wallet', async function () {
        assert.equal(await crowdsale.multisigNodes(), nodes)
    })

    it('has an team wallet', async function () {
        assert.equal(await crowdsale.multisigTeam(), team)
    })

    it('has token from crowdsale', async function () {
    	assert.equal(await crowdsale.token(), token.address)
    })

    it('buys tokens', async function() {
        eth_invest = ETH(0.003785)
        purchased_tokens = get_purchased_tokens(eth_invest)

        await crowdsale.setTime(startTime + 10, {from: owner});

    	await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})
    	
    	assert.equal(await token.balanceOf(investor1), purchased_tokens)
    	assert.equal(await token.totalSupply(), purchased_tokens)
    	assert.equal(await crowdsale.totalCollected(), eth_invest)
    })

    it('does not buy tokens when ico on pause', async function() {
    	eth_invest = ETH(0.003785)

    	await crowdsale.setTime(startTime + 10, {from: owner});

    	await crowdsale.pause({from: owner})

    	try {
           await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }
        
    	assert.equal(await token.balanceOf(investor1), 0)
    	assert.equal(await token.totalSupply(), 0)
    	assert.equal(await crowdsale.totalCollected(), 0)
    })

    it('buys tokens when ico on unpause', async function() {
    	eth_invest = ETH(0.003785)
    	purchased_tokens = get_purchased_tokens(eth_invest)

    	await crowdsale.setTime(startTime + 10, {from: owner});

    	await crowdsale.pause({from: owner})

    	try {
            await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }

        assert.equal(await token.balanceOf(investor1), 0)
    	assert.equal(await token.totalSupply(), 0)
    	assert.equal(await crowdsale.totalCollected(), 0)

        await crowdsale.unpause({from: owner})

        await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})

    	assert.equal(await token.balanceOf(investor1), purchased_tokens)
    	assert.equal(await token.totalSupply(), purchased_tokens)
    	assert.equal(await crowdsale.totalCollected(), eth_invest)
    })

    it('does not buy tokens when ico not started', async function() {
    	eth_invest = ETH(0.003785)

    	await crowdsale.setTime(startTime - 10, {from: owner});

    	try {
           await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }
        
    	assert.equal(await token.balanceOf(investor1), 0)
    	assert.equal(await token.totalSupply(), 0)
    	assert.equal(await crowdsale.totalCollected(), 0)
    })

    it('does not buy tokens when ico ended', async function() {
    	eth_invest = ETH(0.003785)

    	await crowdsale.setTime(endTime + 10, {from: owner});

    	try {
           await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }
        
    	assert.equal(await token.balanceOf(investor1), 0)
    	assert.equal(await token.totalSupply(), 0)
    	assert.equal(await crowdsale.totalCollected(), 0)
    })

    it('does not buy tokens when hard cap is reached', async function() {
    	eth_invest1 = ETH(255)
    	eth_invest2 = ETH(0.1)

    	await crowdsale.setTime(startTime + 10, {from: owner});
        await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest1})

    	try {
           await crowdsale.sendTransaction({from: investor2, to: crowdsale_address, value: eth_invest2})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }

    	assert.equal(await token.balanceOf(investor2), 0)
    	assert.equal(await crowdsale.totalCollected(), eth_invest1)
    })

    it('recievs bonus 15% tokens when invest >= 250 ETH', async function() {
    	eth_invest = ETH(3.785);
    	purchased_tokens = get_purchased_tokens(eth_invest);
    	bonusTokens = purchased_tokens * 0.15;
    	totalTokens = bonusTokens + purchased_tokens;

    	await crowdsale.setTime(startTime + 10, {from: owner});

    	await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})

    	assert.equal(await token.balanceOf(investor1), totalTokens)
    	assert.equal(await token.totalSupply(), totalTokens)
    	assert.equal(await crowdsale.totalCollected(), eth_invest)
    })

    it('recievs bonus 20% tokens when 250 > invest > 50 ETH and ', async function() {
    	eth_invest = ETH(0.757);
    	purchased_tokens = get_purchased_tokens(eth_invest);
    	bonusTokens = purchased_tokens * 0.20;
    	totalTokens = bonusTokens + purchased_tokens;

    	await crowdsale.setTime(startTime + 10, {from: owner});

    	await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})

    	assert.equal(await token.balanceOf(investor1), totalTokens)
    	assert.equal(await token.totalSupply(), totalTokens)
    	assert.equal(await crowdsale.totalCollected(), eth_invest)
    })

    it('does not recieve bonus tokens because bonus tokens is ended ', async function() {
    	eth_invest1 = ETH(189.25);
        eth_invest2 = ETH(3.785);

    	purchased_tokens1 = get_purchased_tokens(eth_invest1);
        purchased_tokens2 = get_purchased_tokens(eth_invest2);
    	bonusTokens1 = totalBonusTokens;
    	totalTokens1 = purchased_tokens1 + bonusTokens1;

    	await crowdsale.setTime(startTime + 10, {from: owner});

    	await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest1})

        totalBonus = await crowdsale.totalBonusTokens();

        assert.equal(await crowdsale.totalMintedBonusTokens(), totalBonusTokens)

        await crowdsale.sendTransaction({from: investor2, to: crowdsale_address, value: eth_invest2})
    	
        assert.equal(await token.balanceOf(investor2), purchased_tokens2)
    	
        assert.equal(await crowdsale.totalMintedBonusTokens(), totalBonusTokens)

    })

    it('distributes tokens when ico end and succeded', async function(){
        eth_invest = ETH(24.224);
        purchased_tokens = get_purchased_tokens(eth_invest);
        bonusTokens = purchased_tokens * 0.15;
        totalTokens = purchased_tokens + bonusTokens;

        await crowdsale.setTime(startTime + 10, {from: owner});

        await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest});

        distribution = getTokensDistribution(totalTokens);

        await crowdsale.setTime(endTime + 10, {from: owner});

        await crowdsale.setIcoSucceeded({from: owner});

        assert.equal(await token.balanceOf(foundation), distribution["foundation"])
        assert.equal(await token.balanceOf(advisers), distribution["advisers"])
        assert.equal(await token.balanceOf(nodes), distribution["nodes"])
        assert.equal(await token.balanceOf(team), distribution["team"])
    })
})










