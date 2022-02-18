//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenBase is ERC20Burnable, Ownable, AccessControl {

    bytes32 constant private ADMIN = keccak256("ADMIN");
    constructor(
        string memory name, 
        string memory symbol
    ) ERC20(name, symbol) {}

    function mint(address _to, uint256 _amount) external onlyRole(ADMIN) {
        _mint(_to, _amount);
    }

    function Burn(address _to, uint256 _amount) external onlyRole(ADMIN) {
        _burn(_to, _amount);
    }

    function addAdmin(address _who) external onlyOwner {
        _grantRole(ADMIN, _who);
    }

    function removeAdmin(address _who) external onlyOwner {
        _revokeRole(ADMIN, _who);
    }
}