require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { INFURA_PROJECT_ID, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545",
    },
    sepolia: { // Exemple d'ajout d'un réseau de test
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`, // Utilisation correcte des variables d'environnement
      accounts: [`0x${PRIVATE_KEY}`], // Utilisation correcte des variables d'environnement
    },
  },
};
