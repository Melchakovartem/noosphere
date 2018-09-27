pragma solidity ^0.4.15;

contract ERC223 {
	function transfer(address _to, uint _value, bytes _data) public returns (bool success);
	event Transfer(address indexed _from, address indexed _to, uint _value, bytes indexed _data);
}
