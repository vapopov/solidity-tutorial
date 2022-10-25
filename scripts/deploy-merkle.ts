import { ethers, upgrades } from "hardhat";


async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy factory to the network.
  const mf = await ethers.getContractFactory("MerkleFactory");
  const msContract = await mf.deploy();
  await msContract.deployed();




  // Make prediction for the next deployment.
  const salt = ethers.utils.hexZeroPad('0x123', 32);

  const pa = await msContract.getAddress(salt);
  console.log("Predicted address:", pa);

  const tw = await msContract.deploy(salt);
  const txReceipt = await tw.wait();
  console.log("Real address:", txReceipt.events[0].args[0]);


  // const pizza = await upgrades.deployProxy(msContract, [], {
  //   initializer: "initialize",
  // });
  // const g = await pizza.deployed();
  // console.log("Proxy address:", g.address);


  const tmpContract = await ethers.getContractFactory("TestMerkleProof");
  const tmp = await tmpContract.attach(pa);

  const rootHash = await tmp.getRoot();
  console.log("Root hash:", rootHash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });

