// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
const { ethers } = require("hardhat");
let erc20;
let owner, addr1;
let totalSupply = ethers.BigNumber.from(100000000).mul(ethers.BigNumber.from(10).pow(18))
let initialMint = ethers.BigNumber.from(2000000).mul(ethers.BigNumber.from(10).pow(18))


async function deployErc20() {

    const [owner] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ArGo")
    erc20 = await ERC20.deploy("0x26b49b322E2B24e028A1f54315fE81976613aB52", initialMint, totalSupply)

    await erc20.deployed()
    console.log("ArGo token deployed to:", erc20.address);
    //transferring ownership to multisig
    erc20.transferOwnership("0x26b49b322E2B24e028A1f54315fE81976613aB52");

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployErc20()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });