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
}
