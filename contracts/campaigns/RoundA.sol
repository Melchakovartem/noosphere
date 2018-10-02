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

    function startRoundB(uint start, uint end) public onlyOwner {
    	require(getCurrentTime() > endTime);
    	roundB = new RoundB(token, multisigFoundation, multisigAdvisers, multisigNodes, multisigTeam, start, end);
    	roundB.changeOwner(owner);
    	token.changeOwner(roundB);
    }
}
