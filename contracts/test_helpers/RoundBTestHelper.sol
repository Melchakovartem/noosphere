pragma solidity ^0.4.15;

import '../campaigns/RoundB.sol';


///DONT use it in production!
contract RoundBTestHelper is RoundB
{
    uint m_time;

    function RoundBTestHelper(address tokenAddress,
                              address foundation, 
                              address advisers, 
                              address nodes, 
                              address team, 
                              uint start, 
                              uint end) public
        RoundB(tokenAddress, foundation, advisers, nodes, team, start, end) {
        }

    function getCurrentTime() internal constant returns (uint) {
        return m_time;
    }

    function setTime(uint time) external onlyOwner {
        m_time = time;
    }

    function hardcap() public pure returns (uint256) {
        return 255 ether; 
    }

    function minValue() public pure returns (uint256) {
        return 0.001 ether; 
    }

    function maxValue() public pure returns (uint256) {
        return 0.004 ether; 
    }

    function totalBonusTokens() public constant returns (uint256) {
        uint bonus = 0;

        return 0;
    }

}
