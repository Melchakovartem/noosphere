const Token = artifacts.require('./Token')

contract('Token', function(accounts) {

	beforeEach('setup contract for each test', async function () {
        owner = accounts[0]
        newOwner = accounts[1]
        investor1 = accounts[2]
        investor2 = accounts[3]
        investor3 = accounts[4]
        nzt = await Token.new({from: owner})
    })

    it('has an owner', async function () {
        assert.equal(await nzt.owner(), owner)
    })

    it('changes owner of token contract', async function () {
        await nzt.changeOwner(newOwner, {from: owner})
        assert.equal(await nzt.owner(), newOwner)
    })

    it('transfers tokens after set unlocked', async function() {
    	await nzt.mint(investor1, 0.1e20, {from: owner})
    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)

        assert.equal(await nzt.isUnlocked(), false)

        await nzt.setUnlocked({from: owner})
    	
        assert.equal(await nzt.isUnlocked(), true)

    	await nzt.transfer(investor2, 0.5e19, {from: investor1})
    	assert.equal(await nzt.balanceOf(investor1), 0.5e19)
    	assert.equal(await nzt.balanceOf(investor2), 0.5e19)
    	assert.equal(await nzt.totalSupply(), 0.1e20)
    })

    it('transfers allowed tokens after set unlocked', async function() {
        await nzt.mint(investor1, 0.1e20, {from: owner})
        assert.equal(await nzt.balanceOf(investor1), 0.1e20)
        
        assert.equal(await nzt.isUnlocked(), false)

        await nzt.setUnlocked({from: owner})
        
        assert.equal(await nzt.isUnlocked(), true)

        await nzt.approve(investor2, 0.5e19, {from: investor1})
        await nzt.transferFrom(investor1, investor3, 0.5e19, {from: investor2})

        assert.equal(await nzt.balanceOf(investor1), 0.5e19)
        assert.equal(await nzt.balanceOf(investor2), 0)
        assert.equal(await nzt.balanceOf(investor3), 0.5e19)
        assert.equal(await nzt.totalSupply(), 0.1e20)
    })

    it('tries to transfer allowed tokens when unlocked', async function() {
        await nzt.mint(investor1, 0.1e20, {from: owner})
        assert.equal(await nzt.balanceOf(investor1), 0.1e20)
        assert.equal(await nzt.isUnlocked(), false)

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

    it('tries to transfer tokens when unlocked', async function() {
    	await nzt.mint(investor1, 0.1e20, {from: owner})
    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)
        assert.equal(await nzt.isUnlocked(), false)

        try {
            await nzt.transfer(investor2, 0.5e19, {from: investor1})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }

    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)
    	assert.equal(await nzt.balanceOf(investor2), 0)
    	assert.equal(await nzt.totalSupply(), 0.1e20)
    })

    it('can not mints tokens after finilize', async function() {
    	await nzt.mint(investor1, 0.1e20, {from: owner})
    	assert.equal(await nzt.balanceOf(investor1), 0.1e20)
    	assert.equal(await nzt.totalSupply(), 0.1e20)

    	await nzt.mintingFinish({from: owner})
    	try {
            await nzt.mint(investor2, 0.1e20, {from: owner})
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert')
        }
        
        assert.equal(await nzt.balanceOf(investor2), 0)
    	assert.equal(await nzt.totalSupply(), 0.1e20)

    })
})
