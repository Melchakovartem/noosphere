pragma solidity ^0.4.15;

import '../campaigns/RoundA.sol';
import "./TimeTestHelper.sol";


///DONT use it in production!
contract RoundATestHelper is RoundA, TimeTestHelper
{
    function RoundATestHelper(address beneficiary,
    	                      address foundation, 
                              address advisers, 
                              address nodes, 
                              address team, 
                              uint start, 
                              uint end) public
        RoundA(beneficiary, foundation, advisers, nodes, team, start, end) {
        }
}
