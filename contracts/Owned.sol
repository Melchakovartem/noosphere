pragma solidity ^0.4.15;

contract owned 
{
	address public owner;

	function owned() public
	{
		owner = msg.sender;
	}

	function changeOwner(address newOwner) public onlyOwner 
	{
		owner = newOwner;
	}

	modifier onlyOwner 
	{
		require(msg.sender == owner);
		_;
	}
}
