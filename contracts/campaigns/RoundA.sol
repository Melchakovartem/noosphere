pragma solidity ^0.4.15;

import '../Crowdsale.sol';

contract RoundA is Crowdsale
{   
    bool public newRoundStarted = false;

    function RoundA(address foundation, 
    	            address advisers, 
    	            address nodes, 
    	            address team, 
    	            uint start, 
    	            uint end) public
        Crowdsale(foundation, advisers, nodes, team, start, end) {
        	token = new Token();
        }

    function startRoundB(address roundB) public onlyOwner {
    	require(getCurrentTime() > endTime && !newRoundStarted);
    	token.changeCrowdsale(roundB);
        newRoundStarted = true;
    }

    function getBonus(uint money, uint tokens) internal returns (uint additionalTokens) {
        uint bonus = 0;
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

        return bonus;
    }
}
