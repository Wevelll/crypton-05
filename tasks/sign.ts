import { task } from "hardhat/config";
import { bridgeAddr } from "../hardhat.config";
import Web3 from "web3";
import soliditySha3  from "web3";

task("Sign", "Signs a message by your account")
.addParam("recepient", "Token receiver in another chain")
.addParam("token", "Address of token going to swap")
.addParam("amount", "Amount of tokens to swap")
.addParam("chain", "ID of target chain")
.addParam("pk", "Validator private key")
.setAction(async (taskArgs, hre) => {
    const web3 = new Web3();
    const [me] = await hre.ethers.getSigners();
    const n = Math.floor(Math.random());
    const msg = {
        recepient: taskArgs.recepient,
        token: taskArgs.token,
        amount: hre.ethers.utils.parseEther(taskArgs.amount),
        chainID: taskArgs.chain,
        nonce: n
    }
    const Bridge = await hre.ethers.getContractAt("BridgeBase", bridgeAddr);

    const hash = web3.utils.soliditySha3(
        msg.recepient, msg.token, msg.amount.toString(), msg.chainID, msg.nonce
    );

    const hashed = await web3.eth.accounts.sign(
        JSON.stringify(msg),
        taskArgs.pk
    );

    const sign = hashed.messageHash!;
    const v = hashed.v;
    const r = hashed.r;
    const s = hashed.s;
    console.log("v: ", v);
    console.log("r: ", r);
    console.log("s: ", s);
    console.log("signature: ", sign);
})