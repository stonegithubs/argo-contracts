const { BigNumber } = require("@ethersproject/bignumber");
const vestingData = require("./vesting-data")
const fs = require('fs')
async function deployVestingFactory(erc20Address) {
    var data = {
        list: []
    };

    for (let l = 0; l < vestingData.length; l++) {

        const a = vestingData[l];

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
            const ArgoVestingFactory = await ethers.getContractFactory("ArgoVestingFactory");
            const argoVestingFactory = await ArgoVestingFactory.deploy(
                erc20Address, addresses, b.percents, b.epochs, amountList
            );

            await argoVestingFactory.deployed();
            console.log("ArgoVestingFactory deployed to:", argoVestingFactory.address);
            var log = { address: argoVestingFactory.address, amount: totalAmount.toString() }
            data.list.push(log);
            // comment out following two lines if tokens will be transferred later
            //var tx = await erc20.transfer(argoVestingFactory.address, totalAmount);
            var tx2 = await argoVestingFactory.transferOwnership("0x26b49b322E2B24e028A1f54315fE81976613aB52")
            console.log("Ownership transferred: ", tx2.hash)
            const abi = [
                'function constructor(address _argoAddress,address[] memory _addressList,uint256[] memory _percentList,uint256[] memory _epochsToRelease,uint256[] memory _amountList)'
            ]

            let iface = new ethers.utils.Interface(abi);
            var data = iface.encodeFunctionData("constructor", [erc20Address, addresses, b.percents, b.epochs, amountList])
            console.log(data, '\n')
        }


    }
    try {
        fs.writeFileSync("./data.json", JSON.stringify(data))
    } catch (err) {
        console.error(err)
    }


}
//0xef8ad20cea645866cab920d49a08d844834adac6
function convertToWei(eth) {
    return BigNumber.from(eth).mul(BigNumber.from(10).pow(18));

}
//Pass argo adddress here
deployVestingFactory("0x28cca76f6e8ec81e4550ecd761f899110b060e97")
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });