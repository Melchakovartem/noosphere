pragma solidity ^0.4.15;

import '../campaigns/RoundB.sol';
import "./TimeTestHelper.sol";


///DONT use it in production!
contract RoundBTestHelper is RoundB, TimeTestHelper
{
    function RoundBTestHelper(address beneficiary,
    	                      address tokenAddress,
                              address foundation, 
                              address advisers, 
                              address nodes, 
                              address team, 
                              uint start, 
                              uint end) public
        RoundB(beneficiary, tokenAddress, foundation, advisers, nodes, team, start, end) {
        }
}
