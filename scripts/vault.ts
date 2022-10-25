import { ethers } from "hardhat";


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy('0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc');

    console.log("Vault address:", vault.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
