pragma solidity ^0.4.15;

import '../Vesting.sol';
import "./TimeTestHelper.sol";

///DONT use it in production!
contract VestingTestHelper is Vesting, TimeTestHelper
{
    function VestingTestHelper(address tokenAddress) public
        Vesting(tokenAddress) {}
}
