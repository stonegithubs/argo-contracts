const { BigNumber } = require("@ethersproject/bignumber");
const vestingData = require("./vesting-data")

async function deployVestingFactory(erc20Address) {

    for (let l = 0; l < vestingData.length; l++) {

        const a = vestingData[l];
        const ERC20 = await ethers.getContractFactory("ARGO")
        const erc20 = await ERC20.attach(erc20Address);
        for (const key in a) {
            b = a[key];
            var addresses = []
            var amountList = []
            var totalAmount = BigNumber.from(0);
            for (let i = 0; i < b.accounts.length; i++) {
                amountList.push(convertToWei(b.accounts[i].amount));
                totalAmount = totalAmount.add(convertToWei(b.accounts[i].amount));
            }
            for (let i = 0; i < b.accounts.length; i++) {
                addresses.push(b.accounts[i].address);
            }
            console.log(addresses)
            const ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory");
            const argoVestingFactory = await ArgoVestingFactory.deploy(
                erc20Address, addresses, b.percents, b.epochs, amountList
            );
            await argoVestingFactory.deployed();
            console.log("ArgoVestingFactory deployed to:", argoVestingFactory.address);
            console.log(totalAmount);
            // comment out following two lines if tokens will be transferred later
            var tx = await erc20.transfer(argoVestingFactory.address, totalAmount);
            console.log(tx.hash)

        }


    }


}
//0xef8ad20cea645866cab920d49a08d844834adac6
function convertToWei(eth) {
    console.log(eth)
    return BigNumber.from(eth).mul(BigNumber.from(10).pow(18));

}
//Pass argo adddress here
deployVestingFactory("0xef8ad20cea645866cab920d49a08d844834adac6")
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });