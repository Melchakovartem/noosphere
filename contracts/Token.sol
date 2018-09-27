pragma solidity ^0.4.13;

import "./owned.sol";
import "./ERC20.sol";

contract ERC223ReceivingContract { 
    function tokenFallback(address _from, uint _value, bytes _data) public;
}

contract Token is ERC20, owned 
{
  string public constant symbol = "NZT";
  string public constant name = "NZT";
  uint8 public constant decimals = 18;
  bool public finalized = false;

  uint256 _totalSupply = 0;
  
  event Burned(address backer, uint _value);
  event Transfer(address indexed from, address indexed to, uint value, bytes indexed data);
 
  mapping(address => uint256) balances;

  mapping(address => uint256) lockedTillTime;
 
  mapping(address => mapping (address => uint256)) allowed;

  address public crowdsale;

  function changeCrowdsale(address newCrowdsale) public onlyOwner 
  {
    crowdsale = newCrowdsale;
  }

  modifier onlyOwnerOrCrowdsale 
  {
    require(msg.sender == owner || msg.sender == crowdsale);
    _;
  }

  function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) 
  {
    uint256 z = _x + _y;
    assert(z >= _x);
    return z;
  }

  function safeSub(uint256 _x, uint256 _y) internal pure returns (uint256) 
  {
    assert(_x >= _y);
    return _x - _y;
  }
  
  function totalSupply() public constant returns (uint256 totalTokenCount) 
  {
    return _totalSupply;
  }
 
  // What is the balance of a particular account?
  function balanceOf(address _owner) public constant returns (uint256 balance) 
  {
    return balances[_owner];
  }

  function getUnlockTime(address _owner) public constant returns (uint256 unlockTime) 
  {
    return lockedTillTime[_owner];
  }

  function isUnlocked(address _owner) public constant returns (bool unlocked) 
  {
    return lockedTillTime[_owner] < now;
  }

  function finalize() public onlyOwnerOrCrowdsale {
    finalized = true;
  }

  function isContract(address _addr) private returns (bool is_contract) {
      uint length;
      assembly {
            length := extcodesize(_addr)
      }
      return (length>0);
    }
 
  // Transfer the balance from owner's account to another account
  function transfer(address _to, uint256 _amount) public returns (bool success) {
    if (balances[msg.sender] >= _amount 
      && _amount > 0
      && balances[_to] + _amount > balances[_to]
      && isUnlocked(msg.sender)) 
    {
      bytes memory _empty;

      if(isContract(_to)) {
        ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
        receiver.tokenFallback(msg.sender, _amount, _empty);
      }
      balances[msg.sender] = safeSub(balances[msg.sender], _amount);
      balances[_to] = safeAdd(balances[_to], _amount);
      Transfer(msg.sender, _to, _amount);
      return true;
    } else {
      revert();
    }
  }

  function transfer(address _to, uint256 _amount, bytes _data) public returns (bool success) {
    if (balances[msg.sender] >= _amount 
      && _amount > 0
      && balances[_to] + _amount > balances[_to]
      && isUnlocked(msg.sender)) 
    {
      if(isContract(_to)) {
        ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
        receiver.tokenFallback(msg.sender, _amount, _data);
      }
      balances[msg.sender] = safeSub(balances[msg.sender], _amount);
      balances[_to] = safeAdd(balances[_to], _amount);
      Transfer(msg.sender, _to, _amount);
      return true;
    } else {
      revert();
    }
  }
 
  function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
  if (balances[_from] >= _amount
      && allowed[_from][msg.sender] >= _amount
      && _amount > 0
      && balances[_to] + _amount > balances[_to] 
      && isUnlocked(_from))
    {
      balances[_from] -= _amount;
      allowed[_from][msg.sender] -= _amount;
      balances[_to] += _amount;
      Transfer(_from, _to, _amount);
      return true;
    } else {
      revert();
    }
  }
 
  function approve(address _spender, uint256 _amount) public returns (bool success) 
  {
    allowed[msg.sender][_spender] = _amount;
    Approval(msg.sender, _spender, _amount);
    return true;
  }
 
  function allowance(address _owner, address _spender) public constant returns (uint256 remaining) 
  {
    return allowed[_owner][_spender];
  }

  function mint(address target, uint256 mintedAmount, uint256 lockTime) public onlyOwnerOrCrowdsale 
  {
    require(mintedAmount > 0 && !finalized);

    balances[target] = safeAdd(balances[target], mintedAmount);
    _totalSupply = safeAdd(_totalSupply, mintedAmount);

    if (lockedTillTime[target] < lockTime)
    {
      lockedTillTime[target] = lockTime;
    }
  }

  function burn(address target, uint256 burnedAmount) public onlyOwnerOrCrowdsale
  {
    require(burnedAmount > 0);

    if (balances[target] >= burnedAmount)
    {
      balances[target] -= burnedAmount;
    }
    else
    {
      burnedAmount = balances[target];
      balances[target] = 0;
    }

    _totalSupply = safeSub(_totalSupply, burnedAmount);
    Burned(target, burnedAmount);
  }
}
