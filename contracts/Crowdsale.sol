pragma solidity ^0.4.15;

import "./owned.sol";
import "./Token.sol";
import "./SafeMath.sol";

contract Crowdsale is SafeMath, owned {
    
    address public owner;
    address public multisigFoundation;
    address public multisigAdvisers;
    address public multisigNodes;
    address public multisigTeam;

    uint public startTime; 
    uint public endTime;
    
    bool public paused = false;
    uint public hardcap = 25500 ether;
    uint public totalCollected = 0;
    uint public lockTime = 1546300800; // 01/01/2019 12:00am

    Token public token = new Token();
    
    function Crowdsale(address foundation, address advisers, address nodes, address team, uint start, uint end) {
        owner = msg.sender;
        multisigFoundation = foundation;
        multisigAdvisers = advisers;
        multisigNodes = nodes;
        multisigTeam = team;
        startTime = start;
        endTime = end;
    }

    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }
    
    function() external payable {
        require(getCurrentTime() > startTime && getCurrentTime() < endTime && !paused);
        owner.transfer(msg.value);
        uint tokens = safeDiv(safeMul(1000000, (msg.value)), 3785);
        token.mint(msg.sender, tokens, lockTime);
        totalCollected += tokens;
    }

    function getCurrentTime() internal constant returns (uint) {
        return now;
    }   
}