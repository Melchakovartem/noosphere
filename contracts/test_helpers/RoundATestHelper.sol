pragma solidity ^0.4.15;

import '../campaigns/RoundA.sol';

import "./TimeTestHelper.sol";
import './RoundBTestHelper.sol';


///DONT use it in production!
contract RoundATestHelper is RoundA, TimeTestHelper
{
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
}
