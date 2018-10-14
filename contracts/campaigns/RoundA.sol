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
        newRoundStarted = true;
    }

    function getBonusTokens(uint money, address backer) internal {

        uint bonus = 0;

        uint tokens = token.tokenMultiplier() * money / token.pricePerTokenInWei();

        uint remainBonusTokens = maxBonusTokens() - token.totalBonusTokens();

        if (money >= 250 ether) {
            bonus = tokens * 15 / 100;
        }
        if (money >= 50 ether && money < 250 ether) {
            bonus = tokens * 20 / 100;
        }

        if (remainBonusTokens < bonus) {
            bonus = remainBonusTokens;
        }

        frozenTokens[backer] += bonus;

        token.addTotalBonus(bonus);

        token.addTotalFrozen(bonus);

        //return bonus;
    }
}
