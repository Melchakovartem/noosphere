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
    uint public lockTime;
    
    bool public paused = false;
    uint public totalCollected = 0;
    uint public totalMintedBonusTokens = 0;
    uint public pricePerTokenInWei = 3785000000000000;
    uint public tokenMultiplier = 10 ** 18;

    Token public token = new Token();

    modifier isOpen {
        require(getCurrentTime() > startTime && getCurrentTime() < endTime);
        _;
    }

    modifier isUnpaused {
        require(!paused);
        _;
    }
    
    function Crowdsale(address foundation, address advisers, address nodes, address team, uint start, uint end, uint lockTime) {
        owner = msg.sender;
        multisigFoundation = foundation;
        multisigAdvisers = advisers;
        multisigNodes = nodes;
        multisigTeam = team;
        startTime = start;
        endTime = end;
    }

    function hardcap() public pure returns (uint256) {
        return 25500 ether; 
    }

    function totalBonusTokens() public constant returns (uint256) {
        return 622545000000000000000000;
    }

    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }

    function isReachedHardCap() public constant returns (bool reached) {
        return totalCollected >= hardcap();
    }
    
    function getBonus(uint money, uint tokens) internal returns (uint256 additionalTokens) {
        uint bonus = 0;

        if (money >= 250 ether) {
            bonus = tokens * 15 / 100;
        }
        if (money >= 50 ether && money < 250) {
            bonus = tokens * 20 / 100;
        }
        return bonus;
    }

    function isFinished() internal constant returns (bool finished) {
        return   getCurrentTime() > endTime  || isReachedHardCap();
    }

    function setIcoSucceeded() public onlyOwner {
        require(isFinished());

        uint tokensForDistribution = token.totalSupply() * 100 / 32;

        uint tokensForFoundation = tokensForDistribution * 29 / 100;
        uint tokensForAdvisers = tokensForDistribution * 6 / 100; //lock
        uint tokensForNodes =  tokensForDistribution * 26 / 100;
        uint tokensForTeam = tokensForDistribution * 7 / 100;

        token.mint(multisigFoundation, tokensForFoundation, lockTime);
        token.mint(multisigAdvisers, tokensForAdvisers, lockTime);
        token.mint(multisigNodes, tokensForNodes, lockTime);
        token.mint(multisigTeam, tokensForTeam, lockTime);

        token.finalize();
    }

    function() external isOpen isUnpaused payable {
        require(!isFinished());
        uint amount = msg.value;
        address backer = msg.sender;

        uint remain = hardcap() - totalCollected;

        if (remain < amount) {
            backer.transfer(amount - remain);
            amount = remain; 
        }

        uint tokens = tokenMultiplier * amount / pricePerTokenInWei;
        uint bonusTokens = getBonus(amount, tokens);
        uint remainBonusTokens = totalBonusTokens() - totalMintedBonusTokens;
        if (remainBonusTokens < bonusTokens) {
            bonusTokens = remainBonusTokens;
        }    
        tokens += bonusTokens;
        token.mint(backer, tokens, lockTime);


        owner.transfer(amount);
        totalCollected += amount;
        totalMintedBonusTokens += bonusTokens;
    }

    function getCurrentTime() internal constant returns (uint) {
        return now;
    }   
}