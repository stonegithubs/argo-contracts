pragma solidity >=0.6.0 <0.8.0;
import "./ArgoTokenVesting.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ArgoVestingFactory is ReentrancyGuard {
    //list of users that can depoly token vesting
    address[] whiteListedUsers;

    //List of percent divisions
    uint256[] percentList;

    // time difference epochs must be in same sequence as percent division, time will be calculated with current block time + timeDivsions [i]
    uint256[] timeDivisions;

    // number of different release times
    uint256 numberOfEpochs;

    //owner of contract
    address owner;

    //mapping of address of their vesting contract with their address
    mapping(address => ArgoTokenVesting) public tokenVestingContractMapping;

    //mapping of whiteListed users
    mapping(address => bool) public whiteListedUsersMapping;

    //only owner modifier
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        address[] memory _addressList,
        uint256[] memory _percentList,
        uint256[] memory _timeDivisions
    ) {
        require(_percentList.length > 0, "No percent list provided");
        require(_addressList.length > 0, "No address List provided");
        percentList = _percentList;
        _addressList = _addressList;
        numberOfEpochs = _percentList.length;
        timeDivisions = _timeDivisions;
        owner = msg.sender;
        for (uint256 i = 0; i < _addressList.length; i++) {
            whiteListedUsersMapping[_addressList[i]] = true;
        }
    }

    function addMoreToWhiteList(address[] memory _addressList)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < _addressList.length; i++) {
            if (!whiteListedUsersMapping[_addressList[i]]) {
                whiteListedUsersMapping[_addressList[i]] = true;
                whiteListedUsers.push(_addressList[i]);
            }
        }
    }
}
