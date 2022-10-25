import { ethers } from "hardhat";
import { expect } from "chai";


describe("Merkle contract", function () {
    it("merkle root", async function () {
        const [owner] = await ethers.getSigners();

        const Merkle = await ethers.getContractFactory("TestMerkleProof");

        const hardhatMerkle = await Merkle.deploy();

        const root = await hardhatMerkle.getRoot();

        console.log("root: " + root);

        let len = await hardhatMerkle.getLen();

        for (let i = 0; i < len; i ++) {
            console.log(`hash ${i}: ` + await hardhatMerkle.getHashById(i));
        }

        const MerkleSalted = await ethers.getContractFactory("MerkleFactory");
        await MerkleSalted.deploy();

    });
});
