import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BridgeBase, BridgeBase__factory } from "../typechain";
import { TokenBase, TokenBase__factory } from "../typechain";
import { soliditySha3 } from "web3-utils";
import Web3 from "web3";

describe("Bridge contract", function () {
    let owner: SignerWithAddress;
    let validator: SignerWithAddress;
    let user: SignerWithAddress;
    let Bridge: BridgeBase;
    let Token: TokenBase;
    let web3 = new Web3();
    let pk = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; //hardhat node account #1

    before(async function () {
        [owner, validator, user] = await ethers.getSigners();

        const BridgeFactory = await ethers.getContractFactory(
            "BridgeBase", owner
        ) as BridgeBase__factory;

        const TokenFactory = await ethers.getContractFactory(
            "TokenBase", owner
        ) as TokenBase__factory;

        Bridge = await BridgeFactory.deploy();
        Token = await TokenFactory.deploy("Testing token", "TTK");
        await Token.addAdmin(Bridge.address);
    })

    describe("Token/Validator management", function () {
        it("Owner can add/remove tokens", async function () {
            expect(
                await Bridge.setToken(Token.address, true)
            ).to.satisfy;

            expect(
                Bridge.setToken(ethers.constants.AddressZero, true)
            ).to.be.reverted;

            expect(
                Bridge.connect(validator).setToken(Token.address, false)
            ).to.be.reverted;
        });

        it("Owner can add/remove validators", async function () {
            expect(
                await Bridge.setValidator(validator.address, true)
            ).to.satisfy;

            expect(
                Bridge.setValidator(ethers.constants.AddressZero, true)
            ).to.be.reverted;

            expect(
                Bridge.connect(validator).setValidator(validator.address, false)
            ).to.be.reverted;
        });

        it("GetHash", async function () {
            let res = await Bridge.getMessageHash(
                user.address,
                Token.address,
                ethers.utils.parseEther("100"),
                56, 1
            );
        });
    });

    describe("Reedem", function () {
        it("reedem", async function () {
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 2
            };
            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                await Bridge.connect(user).reedem(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.satisfy;
        });
        it("Unsupported token", async function (){
            let message = {
                recepient: user.address,
                token: ethers.constants.AddressZero,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 3
            };
            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).reedem(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
        });
        it("Validation failed!", async function (){
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 4
            };
            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).reedem(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
        });
        it("Used hash", async function (){
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 2
            };
            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).reedem(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
        });
        it("Wrong hash", async function (){
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 5
            };
            let hash = await Bridge.getMessageHash(
                owner.address, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).reedem(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
        });
    });

    describe("Swap", function () {
        it("swap", async function () {
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("50").toString(),
                chainID: 56,
                nonce: 6
            };
            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                await Bridge.connect(user).swap(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.satisfy;
        });
        it("Unsupported token", async function (){
            let message = {
                recepient: user.address,
                token: ethers.constants.AddressZero,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 7
            };
            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).swap(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
        });
        it("Validation failed!", async function (){
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 8
            };
            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).swap(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
        });
        it("Used hash", async function (){
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("50").toString(),
                chainID: 56,
                nonce: 6
            };

            let hash = await Bridge.getMessageHash(
                message.recepient, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).swap(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
        });
        it("Wrong hash", async function (){
            let message = {
                recepient: user.address,
                token: Token.address,
                amount: ethers.utils.parseEther("100").toString(),
                chainID: 56,
                nonce: 9
            };
            let hash = await Bridge.getMessageHash(
                owner.address, message.token,
                message.amount,
                message.chainID, message.nonce
            );

            let hashed = await web3.eth.accounts.sign(
                JSON.stringify(message),
                pk
            );

            let sign = hashed.messageHash!;
            let v = hashed.v;
            let r = hashed.r;
            let s = hashed.s;

            expect(
                Bridge.connect(user).swap(
                    message.recepient,
                    message.token,
                    message.amount,
                    message.chainID,
                    message.nonce,
                    hash,
                    v, r, s, sign
                )
            ).to.be.reverted;
            console.log(JSON.stringify(message));
        });
    });
});
            /*
let res2 = soliditySha3(
    message.recepeint,
    message.token,
    message.amount,
    message.chainID,
    message.nonce
);
*/