import { task } from "hardhat/config";
import { bridgeAddr } from "../hardhat.config";

task("letMint", "Let bridge contract mint/burn tokens")
.addParam("token", "Address of token")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const Token = await hre.ethers.getContractAt("TokenBase", taskArgs.token);

    await Token.connect(me).addAdmin(bridgeAddr);

    console.log("Ok");
})