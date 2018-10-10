pragma solidity ^0.4.15;

import '../Crowdsale.sol';
import './RoundB.sol';

contract RoundA is Crowdsale
{   RoundB public roundB;

    function RoundA(address foundation, 
    	            address advisers, 
    	            address nodes, 
    	            address team, 
    	            uint start, 
    	            uint end) public
        Crowdsale(foundation, advisers, nodes, team, start, end) {
        	token = new Token();
        }

    function startRoundB(uint startRoundB, uint endRoundB) public onlyOwner {
    	require(getCurrentTime() > endTime);
    	roundB = new RoundB(token, multisigFoundation, multisigAdvisers, 
                            multisigNodes, multisigTeam, startRoundB, endRoundB);
    	roundB.changeOwner(owner);
    	token.changeCrowdsale(roundB);
    }

    function getBonus(uint money, uint tokens) internal returns (uint256 additionalTokens) {
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
