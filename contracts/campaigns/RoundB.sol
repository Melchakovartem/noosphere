pragma solidity ^0.4.15;

import '../Crowdsale.sol';

contract RoundB is Crowdsale 
{
    function RoundB(address token,
    	            address foundation, 
    	            address advisers, 
    	            address nodes, 
    	            address team, 
    	            uint start, 
    	            uint end) public
        Crowdsale(foundation, advisers, nodes, team, start, end) {
        	token = Token(token);
        }

    function minValue() public pure returns (uint256) {
        return 0.1 ether;
    }

    function maxValue() public pure returns (uint256) {
        return 0.4 ether;
    }

    function isAllowableAmount(uint amount) public constant returns (bool) {
        return amount >= minValue() && amount <= maxValue();
    }

    function getBonus(uint money, uint tokens) internal returns (uint256 additionalTokens) {
        uint bonus = 0;

        return bonus;
    }
}
