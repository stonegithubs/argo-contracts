const { BigNumber } = require("@ethersproject/bignumber");
const vestingData = require("./vesting-data")
const fs = require('fs')
async function deployVestingFactory(erc20Address) {

    const abi = [
        ' function constructor( address token_, address beneficiary_, uint256[] memory releaseTimes_, uint256[] memory percents_,uint256 totalBalance_)'
    ]
    const address = "0x2ee331840018465bd7fe74aa4e442b9ea407fbbe"
    const releaseTimes_ = [
        1620824460,
        1652360460,
        1631451660,
        1636722060,
        1641992460,
        1647090060,
        1652360460,
        1657630860,
        1662987660,
        1668258060,
        1673528460,
        1678626060,
        1683896460
    ]
    const percents = [20, 7, 6, 7, 6, 7, 6, 7, 6, 7, 6, 7, 8]
    const totalBalance_ = convertToWei("1000")
    let iface = new ethers.utils.Interface(abi);
    var data = iface.encodeFunctionData("constructor", [erc20Address, address, releaseTimes_, percents, totalBalance_])
    console.log(data, '\n')



}




//0xef8ad20cea645866cab920d49a08d844834adac6
function convertToWei(eth) {
    return BigNumber.from(eth).mul(BigNumber.from(10).pow(18));

}
//Pass argo adddress here
deployVestingFactory("0x77f8B5A4aed8631f250784aB8514FE617fC626D9")
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });