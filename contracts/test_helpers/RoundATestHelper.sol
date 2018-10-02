pragma solidity ^0.4.15;

import '../campaigns/RoundA.sol';


///DONT use it in production!
contract RoundATestHelper is RoundA
{
    uint m_time;

    function RoundATestHelper(address foundation, 
                                 address advisers, 
                                 address nodes, 
                                 address team, 
                                 uint start, 
                                 uint end) public
        RoundA(foundation, advisers, nodes, team, start, end) {
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
        return 0.2 ether; 
    }

    function totalBonusTokens() public constant returns (uint256) {
        return 6225450000000000000000;
    }

    function getBonus(uint money, uint tokens) internal returns (uint256 additionalTokens) {
        uint bonus = 0;

        if (money >= 2.5 ether) {
            bonus = tokens * 15 / 100;
        }
        if (money >= 0.5 ether && money < 2.5 ether) {
            bonus = tokens * 20 / 100;
        }
        return bonus;
    }

}
