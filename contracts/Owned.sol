pragma solidity ^0.4.15;

contract Owned {
	address public owner;

	modifier onlyOwner {
		require(msg.sender == owner);
		_;
	}

	function Owned() public {
		owner = msg.sender;
	}

	function changeOwner(address newOwner) public onlyOwner {
		owner = newOwner;
	}
}
