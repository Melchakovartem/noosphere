const Crowdsale = artifacts.require('./test_heplers/CrowdsaleTestHelper.sol')
const Token = artifacts.require('./Token')

contract('Crowdsale', function(accounts) {

	const startTime = 10000;
	const durationDays = 10;
    const endTime = startTime + durationDays * 60*60*24; 

	function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

    function get_purchased_tokens(eth) {
    	return eth / 0.003785;
    }
    
	beforeEach('setup contract for each test', async function () {
        owner = accounts[0]
        investor1 = accounts[1]
        foundation = accounts[2]
        advisers = accounts[3]
        nodes = accounts[4]
        team = accounts[5]
        crowdsale = await Crowdsale.new(foundation, advisers, nodes, team, startTime, endTime, {from: owner})
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

        await crowdsale.unpause({from: owner})

        await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})

    	assert.equal(await token.balanceOf(investor1), purchased_tokens)
    	assert.equal(await token.totalSupply(), purchased_tokens)
    })

    it('does not buy tokens when ico not started', async function() {
    	eth_invest = ETH(0.003785)
    	owner_balance = web3.eth.getBalance(owner)

    	await crowdsale.setTime(startTime - 10, {from: owner});

    	try {
           await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }
        
    	assert.equal(await token.balanceOf(investor1), 0)
    	assert.equal(await token.totalSupply(), 0)
    })

    it('does not buy tokens when ico ended', async function() {
    	eth_invest = ETH(0.003785)
    	owner_balance = web3.eth.getBalance(owner)

    	await crowdsale.setTime(endTime + 10, {from: owner});

    	try {
           await crowdsale.sendTransaction({from: investor1, to: crowdsale_address, value: eth_invest})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }
        
    	assert.equal(await token.balanceOf(investor1), 0)
    	assert.equal(await token.totalSupply(), 0)
    })
})










