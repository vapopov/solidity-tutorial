import { ethers } from "hardhat";
import { expect } from "chai";


describe("Token contract", function () {
    it("Deployment should assign the total supply of tokens to the owner", async function () {
        const [owner] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");

        const hardhatToken = await Token.deploy();

        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);


        const sg = await ethers.getSigners();

        await hardhatToken.transfer(sg[2].address, 1000);
        await hardhatToken.transfer(sg[2].address, 50);
        await hardhatToken.transfer(sg[2].address, 5);
    });
});
