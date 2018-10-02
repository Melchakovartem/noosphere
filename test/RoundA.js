const RoundA = artifacts.require('./test_helpers/RoundATestHelper.sol');
const RoundB = artifacts.require('./campaigns/RoundB.sol');
const Token = artifacts.require('./Token');

contract('RoundA', function(accounts) {

	const startTimeRoundA = 10000;
    const endTimeRoundA = startTimeRoundA + 100;
    const startTimeRoundB = 100000;
    const endTimeRoundB = startTimeRoundB + 100;
    const totalBonusTokens = 6225450000000000000000;

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

    function getPurchasedTokens(eth) {
        return eth / 0.003785; 
    }

    function rounding(amount) {
        return Math.round((amount) / Math.pow(10,10)) * Math.pow(10, 10); //solution for rounding problems
    }

    function getTokensDistribution(amount) {
        tokensForDistribution = amount * 100 / 32;
        distribution = {};

        distribution["foundation"] = tokensForDistribution * 29 / 100;
        distribution["advisers"] = tokensForDistribution * 6 / 100;
        distribution["nodes"] = tokensForDistribution * 26 / 100;
        distribution["team"] = Math.round((tokensForDistribution * 7 / 100) / Math.pow(10,8)) * Math.pow(10,8); 
        return distribution;
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

    it('does not start roundB when roundA not ended', async function () {
        await roundA.setTime(startTimeRoundA + 10, {from: role.owner});

        try {
           await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.owner(), addressRoundA);
    })

    it('does not start roundB when roundA not ended', async function () {
        await roundA.setTime(startTimeRoundA + 10, {from: role.owner});

        try {
           await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await token.owner(), addressRoundA);
    })

    it('does not start roundB when hard cap is reached', async function () {
        ethInvest = ETH(255);
        await roundA.setTime(startTimeRoundA + 10, {from: role.owner});

        await roundA.sendTransaction({from: role.investor1, to: addressRoundA, value: ethInvest});

        try {
           await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
        assert.equal(await roundA.isFinishedICO(), true);
    })

    it('distributes tokens when hard cap is reached', async function(){
        ethInvest = ETH(255);
        purchasedTokens = getPurchasedTokens(ethInvest);
        

        await roundA.setTime(startTimeRoundA + 10, {from: role.owner});

        await roundA.sendTransaction({from: role.investor1, to: addressRoundA, value: ethInvest});

        totalTokens = Number(await token.totalSupply()); 

        distribution = getTokensDistribution(totalTokens);

        await roundA.setIcoSucceeded({from: role.owner});
        
        assert.equal(rounding(await token.balanceOf(role.foundation)), rounding(distribution["foundation"]));
        assert.equal(rounding(await token.balanceOf(role.nodes)), rounding(distribution["nodes"]));
        assert.equal(rounding(await token.balanceOf(role.team)), rounding(distribution["team"]));
        assert.equal(rounding(await token.balanceOf(role.advisers)), rounding(distribution["advisers"]));
    })

})










