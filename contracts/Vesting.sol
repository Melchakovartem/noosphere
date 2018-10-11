pragma solidity ^0.4.21;

import "./Owned.sol";

contract ERC223Interface {
    uint public totalSupply;
    function balanceOf(address who) constant returns (uint);
    function transfer(address to, uint value) public returns (bool success);
    function transfer(address to, uint value, bytes data) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint value);
    event Transfer(address indexed from, address indexed to, uint value, bytes data);
}

contract Vesting {

  enum lockType { foundation, advisers, nodes, team, pools, earlyBirds }

  mapping(address => uint) locked;

  mapping(address => lockType) tokenholderLockedType;
    
  ERC223Interface public token;

  uint public startTime;

  uint public withdrownTokensForFoundation;

  function Vesting(address tokenAddress) {
    token = ERC223Interface(tokenAddress);
    startTime = now;
  }

  function setLock(address tokenHolder, uint amount, lockType typeOfLock) public {
    locked[tokenHolder] = amount;
    tokenholderLockedType[tokenHolder] = typeOfLock;
  }

  function recieveMyTokens() public {
    lockType typeOfLock = tokenholderLockedType[msg.sender];
    uint amount = locked[msg.sender];

    if (typeOfLock == lockType.advisers && now >= startTime + 1 years) {
        token.transfer(msg.sender, amount);
    }
    
    if (typeOfLock == lockType.team && now >= startTime + 1 years) {
        token.transfer(msg.sender, amount);
    }
    
    if (typeOfLock == lockType.nodes && now >= startTime + 120 days) {
        token.transfer(msg.sender, amount);
    }

    if (typeOfLock == lockType.pools && now >= startTime + 90 days) {
        token.transfer(msg.sender, amount);
    }

    if (typeOfLock == lockType.earlyBirds && now >= startTime + 120 days) {
        token.transfer(msg.sender, amount);
    }

    if (typeOfLock == lockType.foundation) {
        uint passedMonths = (now - startTime) / 30 * days;
        unlockedTokens = (amount / 12) * passedMonths;
        uint availableForRecieve = withdrownTokensForFoundation - unlockedTokens;
        withdrownTokensForFoundation = availableForRecieve;
        token.transfer(msg.sender, availableForRecieve);
    }
  }
}

