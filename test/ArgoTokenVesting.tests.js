const { expect } = require("chai");
const { ethers } = require("hardhat");
const { bn, bnTokens } = require('./utils');

let ArgoTokenVesting;
let argoTokenVesting;
let ArgoVestingFactory;
let argoVestingFactory;

let owner, second, third;
let ArgoToken;
let argoToken;
let tokenAmount = ethers.BigNumber.from(10000000).mul(ethers.BigNumber.from(10).pow(18))

describe("Test Cases", function() {
  describe("ArgoTokenVesting Test Cases",async function() {
    let now = Math.floor(new Date/1000);
    let times = [now + 3600, now + 7200]
    let percents = [40, 60]
    let amounts = [bnTokens(20000), bnTokens(20000)]

    beforeEach(async () => {
      [owner, second, third] = await ethers.getSigners();

      ArgoToken = await ethers.getContractFactory("ARGO")
      ArgoTokenVesting = await ethers.getContractFactory("ArgoTokenVesting")
      ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory")
      argoToken = await ArgoToken.deploy(owner.address, tokenAmount, tokenAmount)
      await argoToken.deployed();
      argoVestingFactory = await ArgoVestingFactory.deploy(argoToken.address, [owner.address, second.address], percents, times, amounts)
      await argoVestingFactory.deployed()
      await argoToken.transfer(argoVestingFactory.address, bnTokens(10000000))
    })

    it("should deploy the vesting contract and set state", async function(){
      const tx = await argoVestingFactory.connect(second).createVesting();
      const resultTx = await tx.wait()
      let vestingAddress = resultTx.events[1].args[1]
      argoTokenVesting = await ArgoTokenVesting.attach(vestingAddress);

      const token = await argoTokenVesting.token();
      expect(token).to.be.equal(argoToken.address)

      const beneficiary = await argoTokenVesting.beneficiary();
      expect(beneficiary).to.be.equal(second.address)

      const vestInfoArray1 = await argoTokenVesting.vestPeriodInfoArray(0);
      expect(vestInfoArray1.percent).to.equal(bn(percents[0]))
      expect(vestInfoArray1.releaseTime).to.equal(bn(times[0]))
      expect(vestInfoArray1.released).to.equal(false)

      const vestInfoArray2 = await argoTokenVesting.vestPeriodInfoArray(1);
      expect(vestInfoArray2.percent).to.equal(bn(percents[1]))
      expect(vestInfoArray2.releaseTime).to.equal(bn(times[1]))
      expect(vestInfoArray2.released).to.equal(false)
    })



    it("should revert if beneficiary address is zero address", async function(){
      ArgoTokenVesting = await ethers.getContractFactory("ArgoTokenVesting")
      argoTokenVesting =  ArgoTokenVesting.deploy(argoToken.address, "0x0000000000000000000000000000000000000000", times, percents, bnTokens(10000000))
      await expect(argoTokenVesting).to.be.revertedWith("ArgoTokenVesting: beneficiary address should not be zero address");
    })

    it("should revert if times list and percent list are of unequal length", async function(){
      ArgoTokenVesting = await ethers.getContractFactory("ArgoTokenVesting")
      let times_test = [now * 3600]
      argoTokenVesting =  ArgoTokenVesting.deploy(argoToken.address, second.address, times_test, percents, bnTokens(10000000))
      await expect(argoTokenVesting).to.be.revertedWith("ArgoTokenVesting: there should be equal percents and release times values");
    })

    it("should revert if token is zero address ", async function(){
      ArgoTokenVesting = await ethers.getContractFactory("ArgoTokenVesting")
      argoTokenVesting =  ArgoTokenVesting.deploy("0x0000000000000000000000000000000000000000", second.address, times, percents, bnTokens(10000000))
      await expect(argoTokenVesting).to.be.revertedWith("ArgoTokenVesting: token address should not be zero address");
    })

    it("should withdraw correct amount at given time", async function(){
      const tx = await argoVestingFactory.connect(second).createVesting();
      const resultTx = await tx.wait()
      let vestingAddress = resultTx.events[1].args[1]
      argoTokenVesting = await ArgoTokenVesting.attach(vestingAddress);
      await ethers.provider.send("evm_setNextBlockTimestamp", [times[0] + 500])
      await ethers.provider.send("evm_mine")
      await argoTokenVesting.connect(second).release();
      await ethers.provider.send("evm_setNextBlockTimestamp", [times[1] + 500])
      await ethers.provider.send("evm_mine")
      await argoTokenVesting.connect(second).release();
    })
  })
});
