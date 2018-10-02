pragma solidity ^0.4.15;

import "./owned.sol";
import "./Token.sol";
import "./SafeMath.sol";

contract Crowdsale is SafeMath, Owned {

    struct Pool {
        address multisig;
        uint percent;
    }

    Pool[] public pools;

    address public multisigFoundation;
    address public multisigAdvisers;
    address public multisigNodes;
    address public multisigTeam;

    uint public startTime; 
    uint public endTime;
    
    bool public paused = false;

    uint public totalMintedBonusTokens = 0;

    Token public token;

    modifier isOpen {
        require(isOpened());
        _;
    }

    modifier isUnpaused {
        require(!paused);
        _;
    }
    
    function Crowdsale(address foundation, address advisers, 
                       address nodes, address team, 
                       uint start, uint end) {
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

    function minValue() public pure returns (uint256) {
        return 2 ether;
    }

    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }

    function isReachedHardCap() public constant returns (bool reached) {
        return token.totalCollected() >= hardcap();
    }

    function isOpened() public constant returns (bool) {
        return getCurrentTime() > startTime && getCurrentTime() < endTime;
    }

    function isFinishedICO() public constant returns (bool finished) {
        return isReachedHardCap();
    }

    function isAllowableAmount(uint amount) public constant returns (bool) {
        return amount >= minValue();
    }

    function deposit() public payable onlyOwner {
    }

    function tokenDistribution() private {
         pools.push(Pool({multisig: multisigFoundation, percent: 29}));
         pools.push(Pool({multisig: multisigAdvisers, percent: 6}));
         pools.push(Pool({multisig: multisigNodes, percent: 26}));
         pools.push(Pool({multisig: multisigTeam, percent: 7}));
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

    function setIcoSucceeded() public onlyOwner {
        require(isFinishedICO());

        uint tokensForDistribution = token.totalSupply() * 100 / 32;

        tokenDistribution();

        for (uint256 i = 0; i < pools.length; i++) {
            token.mint(pools[i].multisig, tokensForDistribution * pools[i].percent / 100);
        }

        token.mintingFinish();
    }

    function mintTokens(uint amount, address backer) private {
        uint tokens = token.tokenMultiplier() * amount / token.pricePerTokenInWei();
        uint bonusTokens = getBonus(amount, tokens);
        
        uint remainBonusTokens = totalBonusTokens() - totalMintedBonusTokens;
        if (remainBonusTokens < bonusTokens) {
            bonusTokens = remainBonusTokens;
        }    
        tokens += bonusTokens;
        token.mint(backer, tokens);
        totalMintedBonusTokens += bonusTokens;
    }

    function processPayment(uint amount, address backer) private returns (uint) {
        uint remain = hardcap() - token.totalCollected();

        if (remain < amount) {
            backer.transfer(amount - remain);
            amount = remain; 
        }
        
        owner.transfer(amount);
        token.addCollected(amount);
        return amount;
    }

    function() external isOpen isUnpaused payable {
        require(!isFinishedICO());
        require(isAllowableAmount(msg.value));
        
        uint amount = msg.value;
        address backer = msg.sender;

        amount = processPayment(amount, backer);
        mintTokens(amount, backer);  
    }

    function getCurrentTime() internal constant returns (uint) {
        return now;
    }   
}