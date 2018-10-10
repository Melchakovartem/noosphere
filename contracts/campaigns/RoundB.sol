pragma solidity ^0.4.15;

import '../Crowdsale.sol';

contract RoundB is Crowdsale 
{   
    function RoundB(address tokenAddress,
    	            address foundation, 
    	            address advisers, 
    	            address nodes, 
    	            address team, 
    	            uint start, 
    	            uint end) public
        Crowdsale(foundation, advisers, nodes, team, start, end) {
        	token = Token(tokenAddress);
        }
    function isFinishedICO() public constant returns (bool finished) {
        return isReachedHardCap() || getCurrentTime() > endTime;
    }

    function isAllowableAmount(uint amount) public constant returns (bool) {
        return amount >= minValue && amount <= maxValue;
    }
}
