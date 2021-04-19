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
  describe("ArgoVestingFactory Test Cases",async function() {
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
      argoVestingFactory = await ArgoVestingFactory.deploy(argoToken.address, [owner.address, second.address], percents, times, amounts);
      await argoVestingFactory.deployed();
      await argoToken.transfer(argoVestingFactory.address, bnTokens(10000000));
    });

    it("should deploy the contract and set correct state", async function(){
      const token = await argoVestingFactory.argoToken();
      expect(token).to.be.equal(argoToken.address);

      const epochToRelease1 = await argoVestingFactory.epochsToRelease(0);
      expect(epochToRelease1).to.be.equal(bn(times[0]))

      const epochToRelease2 = await argoVestingFactory.epochsToRelease(1);
      expect(epochToRelease2).to.be.equal(bn(times[1]))

      const percentList1 = await argoVestingFactory.percentList(0);
      expect(percentList1).to.be.equal(bn(percents[0]))

      const percentList2 = await argoVestingFactory.percentList(1);
      expect(percentList2).to.be.equal(bn(percents[1]))

      const tokenVestingContractMappingStatus1 = await argoVestingFactory.tokenVestingContractMappingStatus(owner.address);
      expect(tokenVestingContractMappingStatus1).to.be.equal(true);
      const whiteListedAddressMapping1 = await argoVestingFactory.whiteListedAddressMapping(owner.address);
      expect(whiteListedAddressMapping1.withdrawn).to.be.equal(false);
      expect(whiteListedAddressMapping1.amount).to.be.equal(amounts[0]);
      expect(whiteListedAddressMapping1.deployedVestingAddress).to.be.equal("0x0000000000000000000000000000000000000000");

      const tokenVestingContractMappingStatus2 = await argoVestingFactory.tokenVestingContractMappingStatus(second.address);
      expect(tokenVestingContractMappingStatus2).to.be.equal(true);
      const whiteListedAddressMapping2 = await argoVestingFactory.whiteListedAddressMapping(second.address);
      expect(whiteListedAddressMapping2.withdrawn).to.be.equal(false);
      expect(whiteListedAddressMapping2.amount).to.be.equal(amounts[1]);
      expect(whiteListedAddressMapping2.deployedVestingAddress).to.be.equal("0x0000000000000000000000000000000000000000");
    });

    it("should add new address to whitelist", async function(){

      await argoVestingFactory.addAddressesToWhiteList([third.address], [amounts[0]]);

      const tokenVestingContractMappingStatus1 = await argoVestingFactory.tokenVestingContractMappingStatus(third.address);
      expect(tokenVestingContractMappingStatus1).to.be.equal(true);
      const whiteListedAddressMapping1 = await argoVestingFactory.whiteListedAddressMapping(third.address);
      expect(whiteListedAddressMapping1.withdrawn).to.be.equal(false);
      expect(whiteListedAddressMapping1.amount).to.be.equal(amounts[0]);
      expect(whiteListedAddressMapping1.deployedVestingAddress).to.be.equal("0x0000000000000000000000000000000000000000");
    });

    it("should remove address from whitelist", async function(){

      await argoVestingFactory.removeAddressFromWhitelist(third.address);

      const tokenVestingContractMappingStatus1 = await argoVestingFactory.tokenVestingContractMappingStatus(third.address);
      expect(tokenVestingContractMappingStatus1).to.be.equal(false);
      const whiteListedAddressMapping1 = await argoVestingFactory.whiteListedAddressMapping(third.address);
      expect(whiteListedAddressMapping1.withdrawn).to.be.equal(false);
      expect(whiteListedAddressMapping1.amount).to.be.equal(bn(0));
      expect(whiteListedAddressMapping1.deployedVestingAddress).to.be.equal("0x0000000000000000000000000000000000000000");
    });

    it("should revert if vesting contract called by account not in whitelist", async function(){
      const tx = argoVestingFactory.connect(third).createVesting();
      expect(tx).to.be.revertedWith("Address not whitelisted");
    })

    it("should revert if user already called withdraw function", async function(){
      await argoVestingFactory.connect(second).createVesting();
      const tx =  argoVestingFactory.connect(second).createVesting();
      expect(tx).to.be.revertedWith("Amount already withdrawn by address");
    })

    it("should revert if withdraw amount is zero", async function(){
      await argoVestingFactory.addAddressesToWhiteList([third.address], [bnTokens(0)]);
      const tx =  argoVestingFactory.connect(third).createVesting();

      expect(tx).to.be.revertedWith("Withdraw amount is not set");
    })

    it("should deploy vesting contract if whitelisted address calls and transfer tokens", async function(){
      const tx = await argoVestingFactory.connect(second).createVesting();
      const resultTx = await tx.wait()
      let vestingAddress = resultTx.events[2].args[1]
      argoTokenVesting = await ArgoTokenVesting.attach(vestingAddress);

      expect(argoTokenVesting.address).to.be.not.equal(null);

      const vestingBalance = await argoToken.balanceOf(argoTokenVesting.address);
      expect(vestingBalance).to.be.equal(amounts[1]);
    });


    it("should revert if factory is being deployed with unequal length of amounts list and address ", async function(){
      let _ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory")
      let _argoVestingFactory =   _ArgoVestingFactory.deploy(argoToken.address, [owner.address], percents, times, amounts);
      expect(_argoVestingFactory).to.be.revertedWith("Address  and amount should be of equal length");
    })
    it("should revert if factory is being deployed with unequal length of epoch list and percent list ", async function(){
      let _ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory")
      let times_test = [now * 3600]
      let _argoVestingFactory =   _ArgoVestingFactory.deploy(argoToken.address, [owner.address, second.address], percents, times_test, amounts);
      expect(_argoVestingFactory).to.be.revertedWith("Time and percent array length should be same");
    })
    it("should revert if factory is being deployed with percent list length zero", async function(){
      let _ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory")
      let _argoVestingFactory =   _ArgoVestingFactory.deploy(argoToken.address, [owner.address, second.address], [], times, amounts);
      expect(_argoVestingFactory).to.be.revertedWith("No percent list provided");
    })
    it("should revert if factory is being deployed with address list length zero", async function(){
      let _ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory")
      let times_test = [now * 3600]
      let _argoVestingFactory =   _ArgoVestingFactory.deploy(argoToken.address, [], percents, times_test, amounts);
      expect(_argoVestingFactory).to.be.revertedWith("No address List provided");
    })
  })
});
