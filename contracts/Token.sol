pragma solidity ^0.4.15;

import "./Owned.sol";
import "./ERC20.sol";
import "./ERC223.sol";
import "./SafeMath.sol";

contract ERC223ReceivingContract { 
    function tokenFallback(address _from, uint _value, bytes _data) public;
}

contract Token is ERC20, ERC223, Owned, SafeMath {
  string public constant symbol = "NZT";

  string public constant name = "NZT";

  uint8 public constant decimals = 18;

  uint public pricePerTokenInWei = 3785000000000000;

  uint public tokenMultiplier = 10 ** 18;

  address public crowdsale;

  bool public mintingFinished = false;

  bool public unlocked = false;

  uint _totalSupply = 0;

  uint _totalCollected = 0;

  uint _totalBonus = 0;

  uint _totalFrozen = 0;
 
  mapping(address => uint256) balances;
 
  mapping(address => mapping (address => uint256)) allowed;

  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  modifier onlyOwnerOrCrowdsale {
    require(msg.sender == owner || msg.sender == crowdsale);
    _;
  }

  function changeCrowdsale(address newCrowdsale) public onlyOwner {
    crowdsale = newCrowdsale;
  }
 
  function totalSupply() public constant returns (uint256 totalTokenCount) {
    return _totalSupply;
  }

  function totalCollected() public constant returns (uint256 totalTokenCount) {
    return _totalCollected;
  }

  function totalBonusTokens() public constant returns (uint256 totalTokenCount) {
    return _totalBonus;
  }

  function totalFrozenTokens() public constant returns (uint256 totalTokenCount) {
    return _totalFrozen;
  }
 
  function balanceOf(address _owner) public constant returns (uint256 balance) {
    return balances[_owner];
  }

  function mintingFinish() public onlyOwner {
    mintingFinished = true;
  }
  
  function isUnlocked() public constant returns (bool) {
    return unlocked;
  }

  function setUnlocked() public onlyOwner {
    unlocked = true;
  }

  function addCollected(uint amount) public onlyOwnerOrCrowdsale {
    _totalCollected += amount;
  }

  function addTotalBonus(uint amount) public onlyOwnerOrCrowdsale {
    _totalBonus += amount;
  }

  function addTotalFrozen(uint amount) public onlyOwnerOrCrowdsale {
    _totalFrozen += amount;
  }

  function subTotalFrozen(uint amount) public onlyOwnerOrCrowdsale {
    _totalFrozen -= amount;
  }

  function isContract(address _addr) private returns (bool is_contract) {
      uint length;
      assembly {
            length := extcodesize(_addr)
      }
      return (length>0);
    }
 
  function transfer(address _to, uint256 _amount) public returns (bool success) {
     bytes memory _empty;

    return transfer(_to, _amount, _empty);
  }

  function transfer(address _to, uint256 _amount, bytes _data) public  returns (bool success) {
    require(isUnlocked());

    balances[msg.sender] = safeSub(balances[msg.sender], _amount);
    balances[_to] = safeAdd(balances[_to], _amount);
    Transfer(msg.sender, _to, _amount);

    if(isContract(_to)) {
      ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
      receiver.tokenFallback(msg.sender, _amount, _data);
    }

    return true;
  }
 
  function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
    require(isUnlocked());

    uint _allowance = allowed[_from][msg.sender];

    balances[_to] = safeAdd(balances[_to], _amount);
    balances[_from] = safeSub(balances[_from], _amount);
    allowed[_from][msg.sender] = safeSub(_allowance, _amount);

    Transfer(_from, _to, _amount);

    return true;
  }
 
  function approve(address _spender, uint256 _amount) public returns (bool success) {
    allowed[msg.sender][_spender] = _amount;
    Approval(msg.sender, _spender, _amount);
    return true;
  }
 
  function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

  function mint(address target, uint256 mintedAmount) public canMint onlyOwnerOrCrowdsale {
    require(mintedAmount > 0);

    balances[target] = safeAdd(balances[target], mintedAmount);
    _totalSupply = safeAdd(_totalSupply, mintedAmount);
  }
}
