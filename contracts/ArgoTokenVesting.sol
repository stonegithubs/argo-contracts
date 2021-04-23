// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year".
 */
contract ArgoTokenVesting {
    using SafeMath for uint256;

    // ERC20 basic token contract being held
    IERC20 private _token;

    // beneficiary of tokens after they are released
    address private _beneficiary;

    // total balance of tokens sent to contract
    uint256 public totalBalance;
    // timestamp of release date and percent to be released
    struct VestPeriodInfo {
        uint256 releaseTime;
        uint256 percent;
        bool released;
    }
    // array of vesting period
    VestPeriodInfo[] public vestPeriodInfoArray;

    uint256 constant PRECISION = 10**25;
    uint256 constant PERCENT = 100 * PRECISION;

    constructor(
        IERC20 token_,
        address beneficiary_,
        uint256[] memory releaseTimes_,
        uint256[] memory percents_,
        uint256 totalBalance_
    ) {
        // solhint-disable-next-line not-rely-on-time
        require(
            percents_.length == releaseTimes_.length,
            "ArgoTokenVesting: there should be equal percents and release times values"
        );
        require(
            beneficiary_ != address(0),
            "ArgoTokenVesting: beneficiary address should not be zero address"
        );
        require(
            address(token_) != address(0),
            "ArgoTokenVesting: token address should not be zero address"
        );

        _token = token_;
        for (uint256 i = 0; i < releaseTimes_.length; i++) {
            vestPeriodInfoArray.push(
                VestPeriodInfo({
                    percent: percents_[i],
                    releaseTime: releaseTimes_[i],
                    released: false
                })
            );
        }
        _beneficiary = beneficiary_;
        totalBalance = totalBalance_;
    }

    /**
     * @return the token being held.
     */
    function token() public view virtual returns (IERC20) {
        return _token;
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
            VestPeriodInfo memory vestPeriodInfo = vestPeriodInfoArray[i];
            if (vestPeriodInfo.releaseTime < block.timestamp) {
                if (!vestPeriodInfo.released) {
                    vestPeriodInfoArray[i].released = true;
                    amount = amount.add(
                        vestPeriodInfo
                            .percent
                            .mul(PRECISION)
                            .mul(totalBalance)
                            .div(PERCENT)
                    );
                }
            } else {
                break;
            }
        }
        require(amount > 0, "TokenTimelock: no tokens to release");
        token().transfer(_beneficiary, amount);
    }
}
