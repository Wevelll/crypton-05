import { ethers } from "hardhat";

async function main() {
  const TokenFactory = await ethers.getContractFactory("TokenBase");
  const Token = await TokenFactory.deploy("TestToken", "TTK");

  await Token.deployed();

  console.log("Token deployed to:", Token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
