pragma solidity >=0.6.0 <0.8.0;

import "./ArgoTokenVesting.sol";

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArgoVestingFactory is Ownable {
    using SafeERC20 for IERC20;

    event AddressWhitelisted(address indexed beneficiary);
    event AmountWithdrawn(
        address indexed beneficiary,
        address indexed vestingAddress,
        uint256 amount
    );

    // Argo Token Address
    address public argoToken;

    // Struct for white listed address
    struct whiteListedAddressInfo {
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
    mapping(address => whiteListedAddressInfo) public whiteListedAddressMapping;

    constructor(
        address _argoAddress,
        address[] memory _addressList,
        uint256[] memory _percentList,
        uint256[] memory _epochToRelease,
        uint256[] memory _amountList
    ) {
        require(_percentList.length > 0, "No percent list provided");
        require(_addressList.length > 0, "No address List provided");
        require(
            _addressList.length == _amountList.length,
            "Address  and amount should be of equal length"
        );
        require(
            _epochToRelease.length == _percentList.length,
            "Time and percent array length should be same"
        );

        percentList = _percentList;
        epochsToRelease = _epochToRelease;
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
            if (!tokenVestingContractMappingStatus[_addressList[i]]) {
                tokenVestingContractMappingStatus[_addressList[i]] = true;
                whiteListedAddressMapping[_addressList[i]].amount = _amountList[i];
            }

            emit AddressWhitelisted(_addressList[i]);
        }
    }

    function removeAddressFromWhitelist(address _address) public onlyOwner {
        delete tokenVestingContractMappingStatus[_address];
        delete whiteListedAddressMapping[_address];
    }

    function withdraw() public {
        require(
            tokenVestingContractMappingStatus[msg.sender],
            "Address not whitelisted"
        );
        require(
            !whiteListedAddressMapping[msg.sender].withdrawn,
            "Amount already withdrawn by address"
        );
        require(
            whiteListedAddressMapping[msg.sender].amount > 0,
            "Withdraw amount is not set"
        );
        whiteListedAddressMapping[msg.sender].withdrawn = true;

        ArgoTokenVesting vesting =
            new ArgoTokenVesting(
                IERC20(argoToken),
                msg.sender,
                epochsToRelease,
                percentList
            );
        whiteListedAddressMapping[msg.sender].deployedVestingAddress = address(
            vesting
        );
        IERC20(argoToken).transfer(
            address(vesting),
            whiteListedAddressMapping[msg.sender].amount
        );

        vesting.setTotalBalance();

        emit AmountWithdrawn(
            msg.sender,
            address(vesting),
            whiteListedAddressMapping[msg.sender].amount
        );
    }
}
