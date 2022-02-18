
import { task } from "hardhat/config";
import { bridgeAddr } from "../hardhat.config";

task("setValidator", "Set address as validator")
.addParam("addr", "Validator address")
.addParam("val", "true/false")
.setAction(async (taskArgs, hre) => {
    const [me] = await hre.ethers.getSigners();
    const Bridge = await hre.ethers.getContractAt("BridgeBase", bridgeAddr);
    const val = taskArgs.val == "true" ? true : false;
    await Bridge.connect(me).setValidator(taskArgs.addr, val);
    console.log("Ok");
});