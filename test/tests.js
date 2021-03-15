const { expect } = require("chai");
const { ethers } = require("hardhat");

let ArgoTokenVesting;
let argoTokenVesting;
let ArgoVestingFactory;
let argoVestingFactory;

let owner, second, third;
let ArgoToken;
let argoToken;
let tokenAmount = ethers.BigNumber.from(10000000).mul(ethers.BigNumber.from(10).pow(18))

describe("Test Cases", function() {
  describe("ArgoVestingFactory Test Cases", function() {
    // it("should dpeloy factroy")
    // it(should add new address)
    // it()
  })

  describe("ArgoTokenVesting Test Cases",async function() {
    let now = Math.floor(new Date/1000);
    let times = [now * 3600, now * 7200]

    beforeEach(async () => {
      [owner, second, third] = await  ethers.getSigners();

      ArgoToken = await ethers.getContractFactory("ARGO")
      ArgoTokenVesting = await ethers.getContractFactory("ArgoTokenVesting")
      ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory")
      argoToken = await ArgoToken.deploy(owner.address, tokenAmount, tokenAmount)
      await argoToken.deployed();
      argoVestingFactory = await ArgoVestingFactory.deploy(argoToken.address, [owner.address, second.address], [40,60], times, [2000000000,2000000000])
      await argoVestingFactory.deployed()
      await argoToken.transfer(argoVestingFactory.address, ethers.BigNumber.from(10000000).mul(ethers.BigNumber.from(10).pow(18)))
      
      
    })

    it("should withdraw correct amount at given time", async function(){
      const tx = await argoVestingFactory.connect(second).withdraw();
      const resultTx = await tx.wait()
      console.log(resultTx.events)
      let vestingAddress = resultTx.events[2].args[1]
      console.log(resultTx["events"][2].args[1])
      argoTokenVesting = await ArgoTokenVesting.attach(vestingAddress);
      await ethers.provider.send("evm_setNextBlockTimestamp", [times[0] + 500])
      await ethers.provider.send("evm_mine")
      await argoTokenVesting.connect(second).release();
      console.log((await argoToken.balanceOf(second.address)).toString());
      await ethers.provider.send("evm_setNextBlockTimestamp", [times[1] + 500])
      await ethers.provider.send("evm_mine")
      await argoTokenVesting.connect(second).release();
      console.log((await argoToken.balanceOf(second.address)).toString());

    })
  })
});
