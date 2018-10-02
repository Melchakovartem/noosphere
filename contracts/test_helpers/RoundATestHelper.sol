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

}
