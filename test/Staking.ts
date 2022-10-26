import {ethers, upgrades} from "hardhat";
import { expect } from "chai";
import {BigNumberish} from "ethers";
import {
    ERCToken__factory,
    Staking__factory
} from "../typechain-types";

const toWei = (value: BigNumberish) => ethers.utils.parseEther(value.toString());
// const toWei = (value) => value;

const fromWei = (value: BigNumberish) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );


describe("Stacking custom erc20 test", function () {
    it("Running staking tests", async function () {
        const [owner, user1, user2, user3] = await ethers.getSigners();

        const Token: ERCToken__factory = await ethers.getContractFactory("ERCToken");
        const token = await Token.deploy("Token", "TKN", toWei(1_000_000));
        await token.deployed();

        const Staking: Staking__factory = await ethers.getContractFactory("Staking");
        const staking = await Staking.deploy(token.address);
        await staking.deployed();

        console.log("Token is deployed to address: ", token.address);
        console.log("Staking is deployed to address: ", staking.address);

        // Approve owner to be charged for making rewards.
        await token.connect(owner).approve(staking.address, toWei(1_000_000));

        // Top-up user balances with tokens.
        await token.transfer(user1.address, toWei(100));
        await token.transfer(user2.address, toWei(100));
        await token.transfer(user3.address, toWei(100));

        // Approve user to be charged for making deposits to staking contract.
        await token.connect(user1).approve(staking.address, toWei(100_000));
        await token.connect(user2).approve(staking.address, toWei(100_000));
        await token.connect(user3).approve(staking.address, toWei(100_000));

        // Making deposit to a staking contract from users, we have to get proportional distribution of rewards.
        await staking.connect(user1).deposit(toWei(100));
        await staking.connect(user2).deposit(toWei(100));
        await staking.connect(user3).deposit(toWei(100));
        console.log("Stake 300 tokens from user1, user2, user3.");

        // Distribute 300 tokens for 3 user, 100 each, after withdraw we should get 200 tokens per user.
        console.log("+ Staking contract balance:", fromWei(await token.balanceOf(staking.address)));
        await staking.distribute(toWei(300));
        console.log("Make distribution of 300 tokens");

        // Withdraw whole amount from user2, should receive 200 tokens.
        console.log("+ Staking contract balance:", fromWei(await token.balanceOf(staking.address)));
        console.log("User2 token balance: %s", fromWei(await token.balanceOf(user2.address)));
        console.log("Withdraw whole amount of user2");
        await staking.connect(user2).withdraw();
        console.log("User2 token balance: %s", fromWei(await token.balanceOf(user2.address)));
        console.log("+ Staking contract balance:", fromWei(await token.balanceOf(staking.address)));

        // Deposit again 100 token for user2 and distribute 300 tokens again.
        await staking.connect(user2).deposit(toWei(100));
        console.log("Stake 100 tokens from user2")
        await staking.distribute(toWei(300));
        console.log("Make distribution of 300 tokens");

        // Withdraw whole amount for user2, previously they had 100 token, 100 deposited, after withdraw
        // we should receive 200 tokens = 300.
        console.log("User2 token balance: %s", fromWei(await token.balanceOf(user2.address)));
        console.log("Withdraw whole amount of user2");
        await staking.connect(user2).withdraw();
        console.log("User2 token balance: %s", fromWei(await token.balanceOf(user2.address)));
        expect(await token.balanceOf(user2.address)).to.equal(toWei(300));

        // Partial withdraw for user1 of tokens 2 times by 50 tokens, we should receive final amount 300,
        // where 100 was initial deposit and 2 times of distribution by 100 tokens.
        console.log("User1 token balance:", fromWei(await token.balanceOf(user1.address)));
        console.log("Withdraw 2 times by 50 of user1");
        await staking.connect(user1).withdrawAmount(toWei(50));
        await staking.connect(user1).withdrawAmount(toWei(50));
        console.log("User1 token balance:", fromWei(await token.balanceOf(user1.address)));
        expect(await token.balanceOf(user1.address)).to.equal(toWei(300));

        // Final balance left on the staking contract must be 300 tokens, which owns user3
        // and it wasn't withdrawn.
        const stakingBalance = await token.balanceOf(staking.address);
        console.log("+ Staking contract balance:", fromWei(stakingBalance));
        expect(stakingBalance).to.equal(toWei(300));
    });
});


/*
  Stacking custom erc20 test
Token is deployed to address:  0x5FbDB2315678afecb367f032d93F642f64180aa3
Staking is deployed to address:  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Stake 300 tokens from user1, user2, user3.
+ Staking contract balance: 300.0
Make distribution of 300 tokens
+ Staking contract balance: 600.0
User2 token balance: 0.0
Withdraw whole amount of user2
User2 token balance: 200.0
+ Staking contract balance: 400.0
Stake 100 tokens from user2
Make distribution of 300 tokens
User2 token balance: 100.0
Withdraw whole amount of user2
User2 token balance: 300.0
User1 token balance: 0.0
Withdraw 2 times by 50 of user1
User1 token balance: 300.0
+ Staking contract balance: 300.0
 */