const { ethers, upgrades } = require("hardhat");

// const PROXY = '0x110443fA0C4E09fECf05398C12Da7bcc16Ac1eF2';
const PROXY = '0xf953b3A269d80e3eB0F2947630Da976B896A8C5b';

async function main() {
    const PizzaV2 = await ethers.getContractFactory("PizzaV2");
    console.log("Upgrading Pizza...");
    await upgrades.upgradeProxy(PROXY, PizzaV2);
    console.log("Pizza upgraded successfully");
}

main();
