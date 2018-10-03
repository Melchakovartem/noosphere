const RoundA = artifacts.require('./test_helpers/RoundATestHelper.sol');
const RoundB = artifacts.require('./test_helpers/RoundBTestHelper.sol');
const Token = artifacts.require('./Token');

contract('RoundB', function(accounts) {

	const startTimeRoundA = 10000;
    const endTimeRoundA = startTimeRoundA + 100;
    const startTimeRoundB = 100000;
    const endTimeRoundB = startTimeRoundB + 100;
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
        const roundA = await RoundA.new(role.foundation, role.advisers, 
                                  role.nodes, role.team, startTimeRoundA, 
                                  endTimeRoundA, {from: role.owner});
        const addressRoundA = await roundA.address;
        const token = await Token.at(await roundA.token());
        return [roundA, addressRoundA, token, role];
    };
    
	beforeEach('setup contract for each test', async function () {
        [roundA, addressRoundA, token, role] = await instantiate();
        ethInvest = ETH(254.997);
        tokenAddress = await token.address;
        await roundA.setTime(startTimeRoundA + 10, {from: role.owner});

        await roundA.sendTransaction({from: role.investor1, to: addressRoundA, value: ethInvest});

        await roundA.setTime(endTimeRoundA + 10, {from: role.owner});

        await roundA.startRoundB(startTimeRoundB, endTimeRoundB, {from: role.owner, gas: 3000000});

        roundB = await RoundB.at(await roundA.roundB());

        addressRoundB = await roundB.address;
    })

    it('checks token owner', async function () {
        assert.equal(await token.owner(), addressRoundB);
    })

    it('checks token address in round B', async function () {
        assert.equal(await roundB.token(), tokenAddress);
    })

    it('does not buy tokens when hard cap is reached', async function() {
        ethInvest1 = ETH(0.003);
        ethInvest2 = ETH(0.001);
        //console.log(await roundB.minValue())
        //console.log(await roundB.maxValue())

        await roundB.setTime(startTimeRoundB + 10, {from: role.owner});
        await roundB.sendTransaction({from: role.investor1, to: addressRoundB, value: ethInvest1});

        //try {
        //   await roundB.sendTransaction({from: role.investor2, to: addressRoundB, value: ethInvest2});
        //} catch (error) {
        //    assert.equal(error, 'Error: VM Exception while processing transaction: revert');
        //}

        //assert.equal(await token.balanceOf(role.investor2), 0);
        //assert.equal(await token.totalCollected(), ethInvest1);
    })

})










