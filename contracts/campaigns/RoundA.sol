pragma solidity ^0.4.15;

import '../Crowdsale.sol';

contract RoundA is Crowdsale
{   
    bool public newRoundStarted = false;

    function RoundA(address beneficiary,
                    address foundation, 
    	            address advisers, 
    	            address nodes, 
    	            address team, 
    	            uint start, 
    	            uint end) public
        Crowdsale(beneficiary, foundation, advisers, nodes, team, start, end) {
        	token = new Token();
            vesting = new Vesting(token);
        }


    function startRoundB(address roundB) public onlyOwner {
    	require(getCurrentTime() > endTime && !newRoundStarted);
    	token.changeCrowdsale(roundB);
        //vesting.changeOwner(roundB);
        newRoundStarted = true;
    }

    function getBonusTokens(uint money, address backer) internal {

        uint bonus = 0;

        uint tokens = token.tokenMultiplier() * money / token.pricePerTokenInWei();

        uint remainBonusTokens = maxBonusTokens() - token.totalBonusTokens();

        uint lockTime = 0;

        if (money >= 250 ether) {
            bonus = tokens * 15 / 100;
            lockTime = getCurrentTime() + 90 * 1 days;
        }

        if (money >= 50 ether && money < 250 ether) {
            bonus = tokens * 20 / 100;
            lockTime = getCurrentTime() + 120 * 1 days;
        }

        if (remainBonusTokens < bonus) {
            bonus = remainBonusTokens;
        }
        
        if (bonus > 0) {
            token.mint(vesting, bonus);
            vesting.setLock(backer, bonus, lockTime);
            token.addTotalBonus(bonus);
        }
    }
}
