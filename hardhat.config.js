require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const POLYGONSCAN_KEY = process.env.POLYGONSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        mumbai: {
            url: "https://rpc-mumbai.maticvigil.com",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 80001,
        },
        amoy: {
            url: "https://rpc-amoy.polygon.technology",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 80002,
            gasPrice: 15000000000,
        },
        polygon: {
            url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
            accounts: PRIVATE_KEY !== "0x000..." ? [PRIVATE_KEY] : [],
            chainId: 137,
        },
    },
    etherscan: {
        apiKey: {
            polygonMumbai: POLYGONSCAN_KEY,
            polygonAmoy: POLYGONSCAN_KEY,
            polygon: POLYGONSCAN_KEY,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS === "true",
        currency: "USD",
    },
};
