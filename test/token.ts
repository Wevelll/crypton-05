import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenBase, TokenBase__factory } from "../typechain";

describe("Token contract", function () {
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let Token: TokenBase;

    before(async function() {
        [owner, user] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory(
            "TokenBase", owner
        ) as TokenBase__factory;

        Token = await TokenFactory.deploy("Test token", "TTK");
    });

    describe("Admins", function () {
        it("Owner can set admin", async function () {
            expect (
                await Token.addAdmin(owner.address)
            ).to.satisfy;
            expect (
                await Token.addAdmin(user.address)
            ).to.satisfy;
            expect (
                await Token.removeAdmin(owner.address)
            ).to.satisfy;
        });

        it("Others can't set admin", async function () {
           expect (
                Token.connect(user).addAdmin(user.address)
           ).to.be.reverted;
           expect (
                Token.connect(user).removeAdmin(user.address)
            ).to.be.reverted;
        });
    });

    describe("Minting/burning", function () {
        it("Minting", async function () {
            expect (
                await Token.connect(user).mint(
                        owner.address,
                        ethers.utils.parseEther("100")
                    )
                ).to.satisfy;
             expect (
                Token.connect(owner).mint(
                        owner.address,
                        ethers.utils.parseEther("100")
                    )
                ).to.be.reverted;
        });
        it("Burning", async function () {
            expect (
                await Token.connect(user).Burn(
                        owner.address,
                        ethers.utils.parseEther("100")
                    )
                ).to.satisfy;
             expect (
                Token.connect(owner).Burn(
                        owner.address,
                        ethers.utils.parseEther("100")
                    )
                ).to.be.reverted;
        });
    });
});