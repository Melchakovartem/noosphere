pragma solidity ^0.4.15;

///DONT use it in production!
contract CapTestHelper
{
    function hardcap() public pure returns (uint256) {
        return 255 ether; 
    }
}
