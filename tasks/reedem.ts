import { hashMessage } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { bridgeAddr } from "../hardhat.config";

task("reedem", "Reedem tokens from another chain")
.addParam("recepient", "Token receiver")
.addParam("token", "Address of token going to reedem")
.addParam("amount", "Amount of tokens to reedem")
.addParam("chain", "ID of target chain")
.addParam("v", "v from validator")
.addParam("r", "r from validator")
.addParam("s", "s from validator")
.addParam("signature", "Signature provided by validator")
.setAction(async (taskArgs, hre) => {
    const n = Math.floor(Math.random() * 1337);
    const msg = {
        recepient: taskArgs.recepient,
        token: taskArgs.token,
        amount: hre.ethers.utils.parseEther(taskArgs.amount),
        chainID: taskArgs.chain,
        nonce: n
    }
    const [me] = await hre.ethers.getSigners();
    const Bridge = await hre.ethers.getContractAt("BridgeBase", bridgeAddr)
    const hash = await Bridge.getMessageHash(
        msg.recepient, msg.token,
        msg.amount, msg.chainID, msg.nonce
    );

    await Bridge.connect(me).reedem(
        msg.recepient, msg.token, msg.amount,
        msg.chainID, msg.nonce, hash,
        taskArgs.v, taskArgs.r, taskArgs.s, taskArgs.signature
    );
    console.log("ok");

});