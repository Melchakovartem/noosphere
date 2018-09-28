pragma solidity ^0.4.15;

import "./Token.sol";

contract Crowdsale {
    
    address owner;
    
    Token public token = new Token();
    
    uint start = 1537833600; // 09/25/2018 12:00am

    uint lockTime = 1546300800; // 01/01/2019 12:00am
    
    uint period = 28;
    
    function Crowdsale() {
        owner = msg.sender;
    }
    
    function() external payable {
        require(now > start && now < start + period*24*60*60);
        owner.transfer(msg.value);
        token.mint(msg.sender, msg.value, lockTime);
    }
    
}