function bn(nm) {
    return ethers.BigNumber.from(nm);
}
  
function bnTokens(nm) {
    return ethers.BigNumber.from(nm).mul(ethers.BigNumber.from(10).pow(18));
}
  
module.exports = {
    bn,
    bnTokens
}