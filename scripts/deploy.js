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

async function deployVestingFactory() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile 
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

    const ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory");
    const argoVestingFactory = await ArgoVestingFactory.deploy(
        erc20.address, [owner.address], [10, 15, 25, 50], [1614904729, 1614905209, 1614908209, 1614909044], [200000]
    );

    await argoVestingFactory.deployed();

    console.log("ArgoVestingFactory deployed to:", argoVestingFactory.address);
}
async function deployErc20() {

    const [owner] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ARGO")
    erc20 = await ERC20.deploy(owner.address, initialMint, totalSupply)

    await erc20.deployed()
    console.log("ArGo token deployed to:", erc20.address);
    erc20.transferOwnership();

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployErc20()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });