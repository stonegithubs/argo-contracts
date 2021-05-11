require("@nomiclabs/hardhat-waffle");
const dotenv = require('dotenv');

dotenv.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async() => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.7.3",
    networks: {
        hardhat: {
            // forking: {
            //   url:
            //     `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_ID}`,
            // },
        },
        localhost: {
            url: "http://localhost:8545",
            /*
              notice no mnemonic here? it will just use account 0 of the buidler node to deploy
              (you can put in a mnemonic here to set the deployer locally)
            */
        },
        goerli: {
            url: `https://goerli.infura.io/v3/8b8d0c60bfab43bc8725df20fc660d15`, // <---- YOUR INFURA ID! (or it won't work)
            accounts: {
                mnemonic: process.env.MNEMONIC_GOERLI,
            },
        },
        ethereum: {
            url: `https://mainnet.infura.io/v3/311ef590f7e5472a90edfa1316248cff`, // <---- YOUR INFURA ID! (or it won't work)
            accounts: {
                mnemonic: process.env.MNEMONIC_ETH,
            },
        },

    },
};