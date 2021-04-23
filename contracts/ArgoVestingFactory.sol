pragma solidity >=0.6.0 <0.8.0;

import "./ArgoTokenVesting.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ArgoVestingFactory is Ownable {
    event AddressWhitelisted(address indexed beneficiary);
    event VestingCreated(
        address indexed beneficiary,
        address indexed vestingAddress,
        uint256 amount
    );
    event EmergencyWithdraw(address owner, uint256 amount);

    // Argo Token Address
    address public argoToken;

    // Struct for white listed address
    struct WhiteListedAddressInfo {
        bool withdrawn;
        uint256 amount;
        address deployedVestingAddress;
    }
    //List of percent divisions
    uint256[] public percentList;

    // time difference epochs must be in same sequence as percent division, time will be calculated with current block time + timeDivsions [i]
    uint256[] public epochsToRelease;

    //mapping of address of their vesting contract with their address
    mapping(address => bool) public tokenVestingContractMappingStatus;

    //mapping of whiteListed users
    mapping(address => WhiteListedAddressInfo) public whiteListedAddressMapping;

    constructor(
        address _argoAddress,
        address[] memory _addressList,
        uint256[] memory _percentList,
        uint256[] memory _epochsToRelease,
        uint256[] memory _amountList
    ) {
        require(_percentList.length > 0, "No percent list provided");
        require(_addressList.length > 0, "No address List provided");
        require(
            _addressList.length == _amountList.length,
            "Address  and amount should be of equal length"
        );
        require(
            _epochsToRelease.length == _percentList.length,
            "Time and percent array length should be same"
        );

        percentList = _percentList;
        epochsToRelease = _epochsToRelease;
        for (uint256 i = 0; i < _addressList.length; i++) {
            tokenVestingContractMappingStatus[_addressList[i]] = true;
            whiteListedAddressMapping[_addressList[i]].amount = _amountList[i];
        }

        argoToken = _argoAddress;
    }

    function addAddressesToWhiteList(
        address[] memory _addressList,
        uint256[] memory _amountList
    ) public onlyOwner {
        require(
            _addressList.length == _amountList.length,
            "Address  and amount should be of equal length"
        );
        for (uint256 i = 0; i < _addressList.length; i++) {
            address _address = _addressList[i];

            if (!tokenVestingContractMappingStatus[_address]) {
                tokenVestingContractMappingStatus[_address] = true;
                whiteListedAddressMapping[_address].amount = _amountList[i];
            }

            emit AddressWhitelisted(_address);
        }
    }

    function removeAddressFromWhitelist(address _address) public onlyOwner {
        delete tokenVestingContractMappingStatus[_address];
        delete whiteListedAddressMapping[_address];
    }

    function createVesting() public {
        WhiteListedAddressInfo memory whiteListedAddressInfo =
            whiteListedAddressMapping[msg.sender];
        require(
            tokenVestingContractMappingStatus[msg.sender],
            "Address not whitelisted"
        );
        require(
            !whiteListedAddressInfo.withdrawn,
            "Amount already withdrawn by address"
        );
        require(
            whiteListedAddressInfo.amount > 0,
            "Withdraw amount is not set"
        );
        whiteListedAddressMapping[msg.sender].withdrawn = true;

        ArgoTokenVesting vesting =
            new ArgoTokenVesting(
                IERC20(argoToken),
                msg.sender,
                epochsToRelease,
                percentList,
                whiteListedAddressInfo.amount
            );
        whiteListedAddressMapping[msg.sender].deployedVestingAddress = address(
            vesting
        );
        IERC20(argoToken).transfer(
            address(vesting),
            whiteListedAddressInfo.amount
        );

        emit VestingCreated(
            msg.sender,
            address(vesting),
            whiteListedAddressInfo.amount
        );
    }

    function emergencyWithdraw(uint256 withdrawAmount) external onlyOwner {
        IERC20(argoToken).transfer(owner(), withdrawAmount);

        emit EmergencyWithdraw(owner(), withdrawAmount);
    }
}
