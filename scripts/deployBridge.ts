import { ethers } from "hardhat";

async function main() {
  const BridgeFactory = await ethers.getContractFactory("BridgeBase");
  const Bridge = await BridgeFactory.deploy();

  await Bridge.deployed();

  console.log("Bridge deployed to:", Bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
