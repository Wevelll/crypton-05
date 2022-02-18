//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./TokenBase.sol";

contract BridgeBase is Ownable {
    mapping(address => bool) private validators;
    mapping(bytes32 => bool) private usedHashes;
    mapping(address => bool) public supportedTokens;

    constructor() {}

    event Swap(
        address indexed recepient,
        address indexed token,
        uint indexed chainID,
        uint256 amount, uint256 nonce
        );

    function swap(
        address recepient,
        address token,
        uint256 amount,
        uint chainID,
        uint256 nonce,
        bytes32 msghash,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes32 signature
    ) external {
        require(supportedTokens[token], "Token not supported!");
        address validator = ecrecover(signature, v, r, s);
        require(validators[validator], "Validator verification failed!");

        require(usedHashes[msghash] == false, "Hash already used!");
        bytes32 gotHash = getMessageHash(recepient, token, amount, chainID, nonce);
        require(gotHash == msghash, "Wrong hash!");
        usedHashes[msghash] = true;
        TokenBase(token).Burn(msg.sender, amount);
    }

    event Reedem(
        address indexed recepient,
        address indexed token,
        uint indexed chainID,
        uint256 amount, uint256 nonce
        );

    function reedem(
        address recepient,
        address token,
        uint256 amount,
        uint chainID,
        uint256 nonce,
        bytes32 msghash,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes32 signature
    ) external {
        require(supportedTokens[token], "Token not supported!");
        address validator = ecrecover(signature, v, r, s);
        require(validators[validator], "Validator verification failed!");

        require(usedHashes[msghash] == false, "Hash already used!");
        bytes32 gotHash = getMessageHash(recepient, token, amount, chainID, nonce);
        require(gotHash == msghash, "Wrong hash!");
        usedHashes[msghash] = true;
        TokenBase(token).mint(recepient, amount);
    }

//TOKEN MANAGEMENT
    event TokensChange(address indexed token, bool newState);
    function setToken(address token, bool newState) external onlyOwner {
        require(token != address(0), "Invalid token address!");
        supportedTokens[token] = newState;
        emit TokensChange(token, newState);
    }

//VALIDATOR MANAGEMENT
    event ValidatorsChange(address indexed validator, bool newState);
    function setValidator(address validator, bool newState) external onlyOwner {
        require(validator != address(0), "Invalid validator address!");
        validators[validator] = newState;
        emit ValidatorsChange(validator, newState);
    }

//UTILS
    function getMessageHash(
        address recepient,
        address token,
        uint256 amount,
        uint chainID,
        uint256 nonce
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(recepient, token, amount, chainID, nonce));
    }
}
