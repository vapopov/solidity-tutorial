import {ethers, upgrades} from "hardhat";
import { expect } from "chai";
import {BigNumberish} from "ethers";

const toWei = (value: BigNumberish) => ethers.utils.parseEther(value.toString());
// const toWei = (value) => value;

const fromWei = (value: BigNumberish) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );


describe("Exchange with erc20 test", function () {
    it("Deployment of the er20 and exchange", async function () {

        const [owner, user1, user2] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("ERCToken");
        const token = await Token.deploy("Token", "TKN", toWei(1_000_000));
        await token.deployed();

        const Exchange = await ethers.getContractFactory("Exchange");
        const exchange = await Exchange.deploy(token.address);
        await exchange.deployed();

        await token.approve(exchange.address, toWei(200));
        console.log("Exchange LP tokens before adding liquidity: ", fromWei(await exchange.balanceOf(owner.address)));
        await exchange.addLiquidity(toWei(200), { value: toWei(100) });
        console.log("Exchange LP tokens after adding liquidity: ", fromWei(await exchange.balanceOf(owner.address)));
        console.log("--------------------------");

        const ethBalance = await ethers.provider.getBalance(exchange.address);
        const tokenBalance = await exchange.getReserve();

        console.log("Exchange Erc20 balance: ", fromWei(tokenBalance));
        console.log("Exchange Eth balance: ", fromWei(ethBalance));

        const price = await exchange.getPrice(ethBalance, tokenBalance);
        console.log("current price: ", price.toString());

        let tokensOut = await exchange.getTokenAmount(toWei(1));
        console.log("Erc20 amount to sell 1eth: ", fromWei(tokensOut));

        let ethOut = await exchange.getEthAmount(toWei(2));
        console.log("Eth amount to sell 2 erc20: ", fromWei(ethOut));

        console.log("--------------------------");
        console.log("User1 eth balance:", fromWei(await ethers.provider.getBalance(user1.address)));

        await exchange.connect(user1).ethToTokenSwap(toWei(18), { value: toWei(10) });

        console.log("User1 eth balance after exchange:", fromWei(await ethers.provider.getBalance(user1.address)));
        console.log("User1 token balance:", fromWei(await token.balanceOf(user1.address)));

        console.log("--------------------------");

        const beforeEth = await ethers.provider.getBalance(owner.address);
        console.log("Owner eth balance:", fromWei(beforeEth));
        const beforeToken = await token.balanceOf(owner.address);
        console.log("Owner token balance:", fromWei(beforeToken));

        await exchange.removeLiquidity(toWei(100));
        const afterEth = await ethers.provider.getBalance(owner.address);
        console.log("Owner eth balance after: %s, diff(%s)", fromWei(afterEth), fromWei(afterEth.sub(beforeEth)));
        const afterToken = await token.balanceOf(owner.address);
        console.log("Owner token balance after: %s, diff(%s)", fromWei(afterToken), fromWei(afterToken.sub(beforeToken)));
        console.log("Exchange LP tokens after removing liquidity: ", fromWei(await exchange.balanceOf(owner.address)));
    });
});

/*
Exchange LP tokens before adding liquidity:  0.0
Exchange LP tokens after adding liquidity:  100.0
--------------------------
Exchange Erc20 balance:  200.0
Exchange Eth balance:  100.0
current price:  500
Erc20 amount to sell 1eth:  1.960590157441330824
Eth amount to sell 2 erc20:  0.980295078720665412
--------------------------
User1 eth balance: 10000.0
User1 eth balance after exchange: 9989.999906304223301385
User1 token balance: 18.01637852593266606
--------------------------
Owner eth balance: 9899.993369781658215056
Owner token balance: 999800.0
Owner eth balance after: 10009.993295339209041552, diff(109.999925557550826496)
Owner token balance after: 999981.98362147406733394, diff(181.98362147406733394)
Exchange LP tokens after removing liquidity:  0.0
 */