pragma solidity ^0.4.15;

import "../Owned.sol";

///DONT use it in production!
contract TimeTestHelper is Owned
{
    uint m_time;

    function getCurrentTime() internal constant returns (uint) {
        return m_time;
    }

    function setTime(uint time) external onlyOwner {
        m_time = time;
    }
}
