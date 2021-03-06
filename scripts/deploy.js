// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
const { ethers } = require("hardhat");

let owner, addr1;
let tokenAmount = ethers.BigNumber.from(10000000).mul(ethers.BigNumber.from(10).pow(18))

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [owner, addr1] = await ethers.getSigners();
  
  const ERC20 = await ethers.getContractFactory("ARGO")
  const erc20 = await ERC20.deploy(owner.address, tokenAmount, tokenAmount)

  await erc20.deployed()

  const ArgoTokenVesting = await ethers.getContractFactory("ArgoVestingFactory");
  const argoTokenVesting = await ArgoTokenVesting.deploy(
    erc20.address, addr1.address, [1614904729, 1614905209,1614908209, 1614909044], [15,15,20,50]
  );

  await argoTokenVesting.deployed();

  console.log("ArgoTokenVesting deployed to:", argoTokenVesting.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
