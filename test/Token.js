const Token = artifacts.require('./Token')

contract('Token', function(accounts) {

    function getRoles() {
        return {
            owner: accounts[0],
            newOwner: accounts[1],
            investor1: accounts[2],
            investor2: accounts[3],
            investor3: accounts[4]
        };
    }

    async function instantiate() {
        const role = getRoles();
        return role;
    };

	beforeEach('setup contract for each test', async function () {
        role = await instantiate();
        nzt = await Token.new({from: role.owner});
    })

    it('has an owner', async function () {
        assert.equal(await nzt.owner(), role.owner);
    })

    it('changes owner of token contract', async function () {
        await nzt.changeOwner(role.newOwner, {from: role.owner});
        assert.equal(await nzt.owner(), role.newOwner);
    })

    it('transfers tokens after set unlocked', async function() {
    	await nzt.mint(role.investor1, 0.1e20, {from: role.owner});
    	assert.equal(await nzt.balanceOf(role.investor1), 0.1e20);

        assert.equal(await nzt.isUnlocked(), false);

        await nzt.setUnlocked({from: role.owner});
    	
        assert.equal(await nzt.isUnlocked(), true);

    	await nzt.transfer(role.investor2, 0.5e19, {from: role.investor1});
    	assert.equal(await nzt.balanceOf(role.investor1), 0.5e19);
    	assert.equal(await nzt.balanceOf(role.investor2), 0.5e19);
    	assert.equal(await nzt.totalSupply(), 0.1e20);
    })

    it('transfers allowed tokens after set unlocked', async function() {
        await nzt.mint(role.investor1, 0.1e20, {from: role.owner});
        assert.equal(await nzt.balanceOf(role.investor1), 0.1e20);
        
        assert.equal(await nzt.isUnlocked(), false);

        await nzt.setUnlocked({from: role.owner});
        
        assert.equal(await nzt.isUnlocked(), true);

        await nzt.approve(role.investor2, 0.5e19, {from: role.investor1});
        await nzt.transferFrom(role.investor1, role.investor3, 0.5e19, {from: role.investor2});

        assert.equal(await nzt.balanceOf(role.investor1), 0.5e19);
        assert.equal(await nzt.balanceOf(role.investor2), 0);
        assert.equal(await nzt.balanceOf(role.investor3), 0.5e19);
        assert.equal(await nzt.totalSupply(), 0.1e20);
    })

    it('tries to transfer allowed tokens when unlocked', async function() {
        await nzt.mint(role.investor1, 0.1e20, {from: role.owner});
        assert.equal(await nzt.balanceOf(role.investor1), 0.1e20);
        assert.equal(await nzt.isUnlocked(), false);

        await nzt.approve(role.investor2, 0.5e19, {from: role.investor1});

        try {
            await nzt.transferFrom(role.investor1, role.investor3, 0.5e19, {from: role.investor2});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await nzt.balanceOf(role.investor1), 0.1e20);
        assert.equal(await nzt.balanceOf(role.investor2), 0);
        assert.equal(await nzt.balanceOf(role.investor3), 0);
        assert.equal(await nzt.totalSupply(), 0.1e20);
    })

    it('tries to transfer tokens when unlocked', async function() {
    	await nzt.mint(role.investor1, 0.1e20, {from: role.owner});
    	assert.equal(await nzt.balanceOf(role.investor1), 0.1e20);
        assert.equal(await nzt.isUnlocked(), false);

        try {
            await nzt.transfer(role.investor2, 0.5e19, {from: role.investor1});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

    	assert.equal(await nzt.balanceOf(role.investor1), 0.1e20);
    	assert.equal(await nzt.balanceOf(role.investor2), 0);
    	assert.equal(await nzt.totalSupply(), 0.1e20);
    })
})
