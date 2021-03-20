// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year".
 */
contract ArgoTokenVesting is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // ERC20 basic token contract being held
    IERC20 private _token;

    // beneficiary of tokens after they are released
    address private _beneficiary;

    // total balance of tokens sent to contract
    uint256 private _totalBalance;
    // timestamp of release date and percent to be released
    struct VestPeriodInfo {
        uint256 releaseTime;
        uint256 percent;
        bool released;
    }
    // setTotal balance called
    bool private _setTotalCalled;
    // array of vesting period
    VestPeriodInfo[] public vestPeriodInfoArray;

    constructor(
        IERC20 token_,
        address beneficiary_,
        uint256[] memory releaseTime_,
        uint256[] memory percent_
    ) {
        // solhint-disable-next-line not-rely-on-time
        require(
            percent_.length == releaseTime_.length,
            "ArgoTokenVesting: there should be equal percents and release times values"
        );
        require(
            beneficiary_ != address(0),
            "ArgoTokenVesting: beneficiary address should not be zero address"
        );
        require(
            beneficiary_ != address(0),
            "ArgoTokenVesting: beneficiary address should not be zero address"
        );

        _token = token_;
        for (uint256 i = 0; i < releaseTime_.length; i++) {
            vestPeriodInfoArray.push(
                VestPeriodInfo({
                    percent: percent_[i],
                    releaseTime: releaseTime_[i],
                    released: false
                })
            );
        }
        _beneficiary = beneficiary_;
    }

    /**
     * @notice set total erc20 held by contract.
     */
    function setTotalBalance() public onlyOwner {
        require(
            !_setTotalCalled,
            "ArgoTokenVesting: this function can be called only once"
        );
        _setTotalCalled = true;
        _totalBalance = token().balanceOf(address(this));
    }

    /**
     * @return the token being held.
     */
    function token() public view virtual returns (IERC20) {
        return _token;
    }

    /**
     * @return the total tokens being held.
     */
    function totalBalance() public view virtual returns (uint256) {
        return _totalBalance;
    }

    /**
     * @return the set total being called
     */
    function setTotalCalled() public view virtual returns (bool) {
        return _setTotalCalled;
    }

    /**
     * @return the beneficiary of the tokens.
     */
    function beneficiary() public view virtual returns (address) {
        return _beneficiary;
    }

    /**
     * @return the time when the tokens are released.
     */
    function releaseTime(uint256 index) public view virtual returns (uint256) {
        return vestPeriodInfoArray[index].releaseTime;
    }

    /**
     * @return the percent of tokens to be released during a period.
     */
    function releasePercent(uint256 index)
        public
        view
        virtual
        returns (uint256)
    {
        return vestPeriodInfoArray[index].percent;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release() public virtual {
        // solhint-disable-next-line not-rely-on-time
        uint256 amount;
        for (uint256 i = 0; i < vestPeriodInfoArray.length; i++) {
            if (vestPeriodInfoArray[i].releaseTime < block.timestamp) {
                if (!vestPeriodInfoArray[i].released) {
                    vestPeriodInfoArray[i].released = true;
                    amount =
                        amount +
                        vestPeriodInfoArray[i].percent.mul(_totalBalance).div(
                            100
                        );
                }
            } else {
                break;
            }
        }
        require(amount > 0, "TokenTimelock: no tokens to release");

        token().safeTransfer(beneficiary(), amount);
    }
}
