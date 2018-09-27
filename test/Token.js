const Token = artifacts.require('./Token')

contract('Token', function(accounts) {

	beforeEach('setup contract for each test', async function () {
        owner = accounts[0]
        newOwner = accounts[1]
        investor1 = accounts[2]
        investor2 = accounts[3]
        investor3 = accounts[4]
        unlockedTime = 1537833600 // 09/25/2018 12:00am
        lockedTime1 = 1546300800 // 01/01/2019 12:00am
        lockedTime2 = 1548979200 // 02/01/2019 12:00am
        nzt = await Token.new({from: owner})
    })

    it('has an owner', async function () {
        assert.equal(await nzt.owner(), owner)
    })

    it('changes owner of token contract', async function () {
        await nzt.changeOwner(newOwner, {from: owner})
        assert.equal(await nzt.owner(), newOwner)
    })

    it('transfers tokens after mining with unlocked time', async function() {
    	await nzt.mint(investor1, 0.1e20, unlockedTime, {from: owner})
    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)
    	assert.equal(await nzt.isUnlocked(investor1), true)

    	await nzt.transfer(investor2, 0.5e19, {from: investor1})
    	assert.equal(await nzt.balanceOf(investor1), 0.5e19)
    	assert.equal(await nzt.balanceOf(investor2), 0.5e19)
    	assert.equal(await nzt.totalSupply(), 0.1e20)
    })

    it('transfers allowed tokens after mining with unlocked time from ', async function() {
        await nzt.mint(investor1, 0.1e20, unlockedTime, {from: owner})
        assert.equal(await nzt.balanceOf(investor1), 0.1e20)
        assert.equal(await nzt.isUnlocked(investor1), true)

        await nzt.approve(investor2, 0.5e19, {from: investor1})
        await nzt.transferFrom(investor1, investor3, 0.5e19, {from: investor2})

        assert.equal(await nzt.balanceOf(investor1), 0.5e19)
        assert.equal(await nzt.balanceOf(investor2), 0)
        assert.equal(await nzt.balanceOf(investor3), 0.5e19)
        assert.equal(await nzt.totalSupply(), 0.1e20)
    })

    it('tries to transfer allowed tokens after mining with unlocked time from ', async function() {
        await nzt.mint(investor1, 0.1e20, lockedTime1, {from: owner})
        assert.equal(await nzt.balanceOf(investor1), 0.1e20)
        assert.equal(await nzt.isUnlocked(investor1), false)

        await nzt.approve(investor2, 0.5e19, {from: investor1})

        try {
            await nzt.transferFrom(investor1, investor3, 0.5e19, {from: investor2})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }

        assert.equal(await nzt.balanceOf(investor1), 0.1e20)
        assert.equal(await nzt.balanceOf(investor2), 0)
        assert.equal(await nzt.balanceOf(investor3), 0)
        assert.equal(await nzt.totalSupply(), 0.1e20)
    })

    it('tries to transfer tokens after mining with locked time', async function() {
    	await nzt.mint(investor1, 0.1e20, lockedTime1, {from: owner})
    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)
        assert.equal(await nzt.isUnlocked(investor1), false)

        try {
            await nzt.transfer(investor2, 0.5e19, {from: investor1})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }

    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)
    	assert.equal(await nzt.balanceOf(investor2), 0)
    	assert.equal(await nzt.totalSupply(), 0.1e20)
    })

    it('mints tokens with different lock time', async function() {
    	await nzt.mint(investor1, 0.1e20, lockedTime1, {from: owner})
    	assert.equal(await nzt.getUnlockTime(investor1), lockedTime1)

    	await nzt.mint(investor1, 0.1e20, lockedTime2, {from: owner})
    	assert.equal(await nzt.getUnlockTime(investor1), lockedTime2)
    })

    it('can not mints tokens after finilize', async function() {
    	await nzt.mint(investor1, 0.1e20, unlockedTime, {from: owner})
    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)
    	assert.equal(await nzt.totalSupply(), 0.1e20)

    	await nzt.finalize({from: owner})
    	try {
            await nzt.mint(investor2, 0.1e20, unlockedTime, {from: owner})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }
        
        assert.equal(await nzt.balanceOf(investor2), 0)
    	assert.equal(await nzt.totalSupply(), 0.1e20)

    })
})
