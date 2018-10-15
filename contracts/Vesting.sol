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

contract Vesting is Owned {
    
  ERC223Interface public token;

  mapping(address => uint256) lockedTillTime;

  mapping(address => uint) lockedAmount;

  function Vesting(address tokenAddress) {
    token = ERC223Interface(tokenAddress);
  }

  function isUnlocked(address tokenHolder) public constant returns (bool unlocked) {
    return lockedTillTime[tokenHolder] < getCurrentTime();
  }

  function getLockedAmount() public constant returns (uint) {
    return lockedAmount[msg.sender];
  }

  function setLock(address tokenHolder, uint amount, uint256 lockTime) public onlyOwner {
    if (lockedTillTime[tokenHolder] < lockTime) {
      lockedTillTime[tokenHolder] = lockTime;
    }

    lockedAmount[tokenHolder] = amount;
    lockedTillTime[tokenHolder] = lockTime;
  }

  function recieveMyTokens() public {
    require(isUnlocked(msg.sender));
    token.transfer(msg.sender, lockedAmount[msg.sender]);
  }

  function getCurrentTime() internal constant returns (uint) {
    return now;
  }
}

