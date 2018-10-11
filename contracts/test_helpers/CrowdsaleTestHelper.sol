pragma solidity ^0.4.15;

import '../Crowdsale.sol';
import "./TimeTestHelper.sol";

///DONT use it in production!
contract CrowdsaleTestHelper is Crowdsale, TimeTestHelper
{
    function CrowdsaleTestHelper(address beneficiary,
    	                         address foundation, 
    	                         address advisers, 
    	                         address nodes, 
    	                         address team, 
    	                         uint start, 
    	                         uint end) public
        Crowdsale(beneficiary, foundation, advisers, nodes, team, start, end) {
            token = new Token();
        }
}
