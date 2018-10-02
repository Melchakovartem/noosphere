const RoundA = artifacts.require('./test_helpers/RoundATestHelper.sol');
const RoundB = artifacts.require('./campaigns/RoundB.sol');
const Token = artifacts.require('./Token');

contract('RoundA', function(accounts) {

	const startTimeRoundA = 10000;
    const endTimeRoundA = startTimeRoundA + 100;
    const startTimeRoundB = 100000;
    const endTimeRoundB = startTimeRoundB + 100;

    function getRoles() {
        return {
           owner: accounts[0],
           investor1: accounts[1],
           investor2: accounts[2],
           foundation: accounts[3],
           advisers: accounts[4],
           nodes: accounts[5],
           team: accounts[6]
        };
    }

    function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

    async function instantiate() {
        const role = getRoles();
        return role;
    };
    
	beforeEach('setup contract for each test', async function () {
        role = await instantiate();
        roundA = await RoundA.new(role.foundation, role.advisers, 
                                  role.nodes, role.team, startTimeRoundA, 
                                  endTimeRoundA, {from: role.owner});
        addressRoundA = await roundA.address;
        token = await Token.at(await roundA.token());
        
    })

    it('has an owner', async function () {
        assert.equal(await roundA.owner(), role.owner);
    })

    it('changes owner of roundB when starts roundB', async function () {
        await roundA.setTime(endTimeRoundA + 10, {from: role.owner});
        await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});

        roundB = await RoundB.at(await roundA.roundB());
        addressRoundB = await roundB.address;

        assert.equal(await roundB.owner(), role.owner);
    })

    it('sets owner of token is roundB when starts roundB', async function () {
        await roundA.setTime(endTimeRoundA + 10, {from: role.owner});
        await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});

        roundB = await RoundB.at(await roundA.roundB());
        addressRoundB = await roundB.address;

        assert.equal(await token.owner(), addressRoundB);
    })

    it('tries to start roundB when roundA not ended', async function () {
        await roundA.setTime(startTimeRoundA + 10, {from: role.owner});

        try {
           await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.owner(), addressRoundA);
    })

})










