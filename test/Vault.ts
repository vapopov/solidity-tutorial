import {ethers, upgrades} from "hardhat";
import { expect } from "chai";


describe("Vault with erc20 test", function () {
    it("Deployment of the er20 and vault shares calculation test", async function () {
        const signers = await ethers.getSigners();
        const owner = signers[0];
        const second = signers[1];
        const third = signers[2];


        const FToken = await ethers.getContractFactory("FFF");
        const ftoken = await upgrades.deployProxy(FToken, [], {
            initializer: "initialize",
        });
        await ftoken.deployed();


        const Vault = await ethers.getContractFactory("Vault");
        const vlt = await Vault.deploy(ftoken.address);


        const vlt2 = await ethers.getContractAt("Vault", vlt.address, second);
        const fff2 = await ethers.getContractAt("FFF", ftoken.address, second);

        const vlt3 = await ethers.getContractAt("Vault", vlt.address, third);
        const fff3 = await ethers.getContractAt("FFF", ftoken.address, third);


        await ftoken.mint(vlt.address, 500);


        await ftoken.mint(owner.address, 5_000_000);
        await ftoken.mint(second.address, 5_000_000);
        await ftoken.mint(third.address, 5_000_000);


        await ftoken.approve(vlt.address, 5_000_000);
        await fff2.approve(vlt.address, 5_000_000);
        await fff3.approve(vlt.address, 5_000_000);
        console.log('approved spend limit for the vault');


        await vlt.deposit(100);
        await vlt.deposit(50);

        await vlt2.deposit(100);
        await vlt3.deposit(100);

        // Withdrawal section
        console.log(" ---> ERC20 Token balance before: ",  await ftoken.balanceOf(owner.address));
        await vlt.withdraw(8);
        console.log(" ---> ERC20 Token balance after: ",  await ftoken.balanceOf(owner.address));


        // const ownerBalance = await vlt.balanceOf(owner.address);
        // expect(await vlt.totalSupply()).to.equal(ownerBalance);
    });
});
