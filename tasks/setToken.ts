import { task } from "hardhat/config";
import { bridgeAddr } from "../hardhat.config";

task("setToken", "Set token as usable by bridge")
.addParam("token", "token address")
.addParam("val", "true/false")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const Bridge = await hre.ethers.getContractAt("BridgeBase", bridgeAddr);
    const val = taskArgs.val == "true" ? true : false;
    await Bridge.connect(me).setToken(taskArgs.token, val);
    console.log("Ok");
});