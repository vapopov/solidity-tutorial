import {ethers, upgrades} from "hardhat";
import {BigNumberish} from "ethers";
import {
    ERCToken,
    IUniswapV2Pair,
    UniswapV2Factory,
    UniswapV2Router02,
    UniswapV2Router02__factory
} from "../typechain-types";

const toWei = (value: BigNumberish) => ethers.utils.parseEther(value.toString());
const fromWei = (value: BigNumberish) =>
    ethers.utils.formatEther(
        typeof value === "string" ? value : value.toString()
    );


describe("UniswapV2 with erc20 test", function () {
    it("Deployment of the er20 and exchange", async function () {
        const [owner, user1, user2] = await ethers.getSigners();

        const feeSetterAddress = user1.address;

        // Deploy UniswapV2Factory.
        const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
        const uniswapV2Factory: UniswapV2Factory = await UniswapV2Factory.deploy(feeSetterAddress);
        await uniswapV2Factory.deployed();
        console.log("UniswapV2Factory deployed to:", uniswapV2Factory.address);

        // Deploy LiquidityValueCalculator
        // const LiquidityValueCalculator = await ethers.getContractFactory("LiquidityValueCalculator");
        // const liquidityValueCalculator = await LiquidityValueCalculator.deploy(uniswapV2Factory.address);
        // await liquidityValueCalculator.deployed();
        // console.log("LiquidityValueCalculator deployed to:", liquidityValueCalculator.address);

        console.log("Deploying Token1 and Token2")
        const Token1 = await ethers.getContractFactory("ERCToken");
        const token1: ERCToken = await Token1.deploy("Token1", "TKN1", toWei(1_000_000));

        const Token2 = await ethers.getContractFactory("ERCToken");
        const token2: ERCToken = await Token2.deploy("Token2", "TKN2", toWei(1_000_000));

        const WETH = await ethers.getContractFactory("ERCToken");
        const weth: ERCToken = await WETH.deploy("WETH", "WETH", toWei(1_000_000));

        console.log("Token 1 is deployed to address: ", token1.address)
        console.log("Token 2 is deployed to address: ", token2.address)
        console.log("WETH is deployed to address: ", weth.address)

        // Deploy UniswapV2Router.
        const UniswapV2Router: UniswapV2Router02__factory = await ethers.getContractFactory("UniswapV2Router02");
        const uniswapV2Router: UniswapV2Router02 = await UniswapV2Router.deploy(uniswapV2Factory.address, weth.address);
        await uniswapV2Router.deployed();
        console.log("UniswapV2Router deployed to:", uniswapV2Router.address);

        let token1Address = token1.address
        let token2Address = token2.address

        console.log(`Creating factory pair: [${token1Address}, ${token2Address}]`)

        let pairAddress = await uniswapV2Factory.createPair(token1Address, token2Address);
        let tx = await pairAddress.wait();
        console.log(`UniswapV2Pair address: `, tx.events[0].args.pair); // PairCreated event..

        pairAddress = await uniswapV2Factory.getPair(token1Address, token2Address);
        console.log(`UniswapV2Factory.getPair(token1: ${token1Address}, token2: ${token2Address})`, pairAddress)


        const pair: IUniswapV2Pair = await ethers.getContractAt("IUniswapV2Pair", pairAddress, owner);
        let [reserve0, reserve1] = await pair.getReserves();
        console.log('Pair reserve0: %s, reserve1: %s:', fromWei(reserve0), fromWei(reserve1));

        // Approve transfer tokens from owner for making liquidity.
        await token1.approve(uniswapV2Router.address, toWei(1_000_000));
        await token2.approve(uniswapV2Router.address, toWei(1_000_000));

        // Approve transfer tokens from user2 to router to be able make swaps.
        await token1.connect(user2).approve(uniswapV2Router.address, toWei(1_000_000));
        await token2.connect(user2).approve(uniswapV2Router.address, toWei(1_000_000));

        const addLiqTx = await uniswapV2Router.addLiquidity(
            token1.address, token2.address,
            toWei(1000), toWei(2000),
            toWei(10), toWei(20),
            user1.address,
            1698273101
        );
        await addLiqTx.wait();
        console.log('Adding liquidity to pair.');

        [reserve0, reserve1] = await pair.getReserves();
        console.log('Pair reserve0: %s, reserve1: %s:', fromWei(reserve0), fromWei(reserve1));

        // Swap logic
        await token1.transfer(user2.address, toWei(10));

        console.log('User2, token1: %s, token2: %s, eth: %s',
            fromWei(await token1.balanceOf(user2.address)),
            fromWei(await token2.balanceOf(user2.address)),
            fromWei(await ethers.provider.getBalance(user2.address)));

        const swp = await uniswapV2Router.connect(user2).swapExactTokensForTokens(
            toWei(10), toWei(10),
            [token1.address, token2.address],
            user2.address,
            1698273101,
        );
        await swp.wait();
        console.log('Making swap for user2.');

        [reserve0, reserve1] = await pair.getReserves();
        console.log('Pair reserve0: %s, reserve1: %s:', fromWei(reserve0), fromWei(reserve1));

        console.log('User2, token1: %s, token2: %s, eth: %s',
            fromWei(await token1.balanceOf(user2.address)),
            fromWei(await token2.balanceOf(user2.address)),
            fromWei(await ethers.provider.getBalance(user2.address)));
    });
});


/*
UniswapV2Factory deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deploying Token1 and Token2
Token 1 is deployed to address:  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Token 2 is deployed to address:  0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
WETH is deployed to address:  0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
UniswapV2Router deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Creating factory pair: [0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0]
UniswapV2Pair address:  0x536b5dc88cd2f8DC9935dca84CF7fcBACEa9A63b
UniswapV2Factory.getPair(token1: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, token2: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0) 0x536b5dc88cd2f8DC9935dca84CF7fcBACEa9A63b
Pair reserve0: 0.0, reserve1: 0.0:
Adding liquidity to pair.
Pair reserve0: 2000.0, reserve1: 1000.0:
User2, token1: 10.0, token2: 0.0, eth: 9999.999875275333470368
Making swap for user2.
Pair reserve0: 1980.256839312058774023, reserve1: 1010.0:
User2, token1: 0.0, token2: 19.743160687941225977, eth: 9999.999680053078799023
 */