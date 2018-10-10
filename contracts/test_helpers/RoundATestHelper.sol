pragma solidity ^0.4.15;

import '../campaigns/RoundA.sol';
import './RoundBTestHelper.sol';


///DONT use it in production!
contract RoundATestHelper is RoundA
{
    uint m_time;

    RoundBTestHelper public roundB;

    function RoundATestHelper(address foundation, 
                                 address advisers, 
                                 address nodes, 
                                 address team, 
                                 uint start, 
                                 uint end) public
        RoundA(foundation, advisers, nodes, team, start, end) {
        }

    function startRoundB(uint startRoundB, uint endRoundB) public onlyOwner {
        require(getCurrentTime() > endTime);
        roundB = new RoundBTestHelper(token, multisigFoundation, multisigAdvisers, 
                            multisigNodes, multisigTeam, startRoundB, endRoundB);
        roundB.changeOwner(owner);
        token.changeCrowdsale(roundB);
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

    function maxBonusTokens() public constant returns (uint256) {
        return 6225450000000000000000;
    }

    function getBonus(uint money, uint tokens) internal returns (uint256 additionalTokens) {
        uint bonus = 0;
        uint remainBonusTokens = maxBonusTokens() - token.totalBonusTokens();

        if (money >= 2.5 ether) {
            bonus = tokens * 15 / 100;
        }
        if (money >= 0.5 ether && money < 2.5 ether) {
            bonus = tokens * 20 / 100;
        }

        if (remainBonusTokens < bonus) {
            bonus = remainBonusTokens;
        } 

        return bonus;
    }

}
