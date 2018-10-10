const RoundA = artifacts.require('./test_helpers/RoundATestHelper.sol');
const RoundB = artifacts.require('./test_helpers/RoundBTestHelper.sol');
const Token = artifacts.require('./Token');

contract('RoundB', function(accounts) {

	const startTimeRoundA = 10000;
    const endTimeRoundA = startTimeRoundA + 100;
    const startTimeRoundB = 100000;
    const endTimeRoundB = startTimeRoundB + 100;

    function getRoles() {
        return {
           owner: accounts[0],
           investor: accounts[1],
           investor1: accounts[2],
           investor2: accounts[3],
           foundation: accounts[4],
           advisers: accounts[5],
           nodes: accounts[6],
           team: accounts[7]
        };
    }

    function ETH(amount) {
        return Number(web3.toWei(amount, 'ether'));
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
        const roundA = await RoundA.new(role.foundation, role.advisers, 
                                  role.nodes, role.team, startTimeRoundA, 
                                  endTimeRoundA, {from: role.owner, gas: 6700000});
        const addressRoundA = await roundA.address;
        const token = await Token.at(await roundA.token());
        return [roundA, addressRoundA, token, role];
    };
    
	beforeEach('setup contract for each test', async function () {
        [roundA, addressRoundA, token, role] = await instantiate();
        ethInvest = ETH(25499.7);
        tokenAddress = await token.address;

        await roundA.setTime(startTimeRoundA + 10, {from: role.owner});

        await roundA.sendTransaction({from: role.investor, to: addressRoundA, value: ethInvest});

        await roundA.setTime(endTimeRoundA + 10, {from: role.owner});

        await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});

        roundB = await RoundB.at(await roundA.roundB());

        addressRoundB = await roundB.address;
    })

    it('checks token owner', async function () {
        assert.equal(await token.owner(), addressRoundA);
    })

    it('checks token crowdsale address', async function () {
        assert.equal(await token.crowdsale(), addressRoundB);
    })

    it('checks token address in round B', async function () {
        assert.equal(await roundB.token(), tokenAddress);
    })

    it('does not fund when hard cap is reached', async function() {
        ethInvest1 = ETH(0.3);
        ethInvest2 = ETH(0.1);

        await roundB.setTime(startTimeRoundB + 10, {from: role.owner});
        await roundB.sendTransaction({from: role.investor1, to: addressRoundB, value: ethInvest1});

        try {
           await roundB.sendTransaction({from: role.investor2, to: addressRoundB, value: ethInvest2});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

        assert.equal(await roundB.isFreezingAmount(role.investor2), 0);
        assert.equal(await token.totalCollected(), ETH(25500));
    })

    it('does not fund when fund < min value', async function() {
        ethInvest1 = ETH(0.01);

        await roundB.setTime(startTimeRoundB + 10, {from: role.owner});

        try {
           await roundB.sendTransaction({from: role.investor1, to: addressRoundB, value: ethInvest1});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }

       assert.equal(await roundB.isFreezingAmount(role.investor1), 0);
    })

    it('distributes tokens when hard cap is reached', async function(){
        ethInvest1 = ETH(0.3);
        purchasedTokens = getPurchasedTokens(ethInvest1);
        
        await roundB.setTime(startTimeRoundB + 10, {from: role.owner});

        await roundB.sendTransaction({from: role.investor1, to: addressRoundB, value: ethInvest1});

        lockedTokens = Number(await token.totalFrozenTokens());

        totalSupply = Number(await token.totalSupply());

        totalTokens = lockedTokens + totalSupply; 

        distribution = getTokensDistribution(totalTokens);

        await roundB.setIcoSucceeded({from: role.owner});
        
        assert.equal(rounding(await token.balanceOf(role.foundation)), rounding(distribution["foundation"]));
        assert.equal(rounding(await token.balanceOf(role.nodes)), rounding(distribution["nodes"]));
        assert.equal(rounding(await token.balanceOf(role.team)), rounding(distribution["team"]));
        assert.equal(rounding(await token.balanceOf(role.advisers)), rounding(distribution["advisers"]));
    })

    it('distributes tokens when time is ended', async function(){
        ethInvest1 = ETH(0.1);
        purchasedTokens = getPurchasedTokens(ethInvest1);
        
        await roundB.setTime(startTimeRoundB + 10, {from: role.owner});

        await roundB.sendTransaction({from: role.investor1, to: addressRoundB, value: ethInvest1});

        await roundB.setTime(endTimeRoundB + 10, {from: role.owner});

        lockedTokens = Number(await token.totalFrozenTokens());

        totalSupply = Number(await token.totalSupply());

        totalTokens = lockedTokens + totalSupply; 

        distribution = getTokensDistribution(totalTokens);

        await roundB.setIcoSucceeded({from: role.owner});
        
        assert.equal(rounding(await token.balanceOf(role.foundation)), rounding(distribution["foundation"]));
        assert.equal(rounding(await token.balanceOf(role.nodes)), rounding(distribution["nodes"]));
        assert.equal(rounding(await token.balanceOf(role.team)), rounding(distribution["team"]));
        assert.equal(rounding(await token.balanceOf(role.advisers)), rounding(distribution["advisers"]));
    })

    it('does not distribute tokens when time is not ended and hard cap is not reached', async function(){
        ethInvest1 = ETH(0.1);
        purchasedTokens = getPurchasedTokens(ethInvest1);
        
        await roundB.setTime(startTimeRoundB + 10, {from: role.owner});

        await roundB.sendTransaction({from: role.investor1, to: addressRoundB, value: ethInvest1});

        try {
            await roundB.setIcoSucceeded({from: role.owner});
        } catch (error) {
            assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        }
    })


})










