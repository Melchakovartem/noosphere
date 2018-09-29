pragma solidity ^0.4.15;

import '../Crowdsale.sol';


/// @title Test helper for Crowdsale, DONT use it in production!
contract CrowdsaleTestHelper is Crowdsale 
{
    uint m_time;

    function CrowdsaleTestHelper(address foundation, 
    	                         address advisers, 
    	                         address nodes, 
    	                         address team, 
    	                         uint start, 
    	                         uint end) public
        Crowdsale(foundation, advisers, nodes, team, start, end) {
        }

    function getCurrentTime() internal constant returns (uint) {
        return m_time;
    }

    function setTime(uint time) external onlyOwner {
        m_time = time;
    }
}
