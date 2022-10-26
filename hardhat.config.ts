import { HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';


const ANVIL_PRIVATE_KEY =  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const GORELI_PRIVATE_KEY = '0x108c5d0179dea4b9100b0d7f5b9139fb35ce3e2389586e9f0d1d47cfa6a7ddc6';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.5.16",
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    anvil: {
      url: `http://127.0.0.1:8545`,
      accounts: [ANVIL_PRIVATE_KEY]
    },
    goreli: {
      url: 'https://goerli.infura.io/v3/2fda9b434b9846d0b8d16fa44dffb97f',
      accounts: [GORELI_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: 'ZX7EVZYM9K7SYGN2WBKA8X5X21E6GYAT18',
  },
};

export default config;
