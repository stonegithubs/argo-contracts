//SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ARGO is ERC20Capped, Ownable {
    using SafeMath for uint256;

    constructor(
        address reserve,
        uint256 amount,
        uint256 initialSupply
    ) ERC20("ARGO Token", "ARGO") ERC20Capped(initialSupply) {
        _mint(reserve, amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Mints `amount` tokens and transfers to the recipient address.
     *
     * See {ERC20-_mint}.
     */
    function mint(address recipient, uint256 amount) public onlyOwner {
        _mint(recipient, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    function burnFrom(address account, uint256 amount) public {
        uint256 decreasedAllowance =
            allowance(account, _msgSender()).sub(
                amount,
                "ERC20: burn amount exceeds allowance"
            );

        _approve(account, _msgSender(), decreasedAllowance);
        _burn(account, amount);
    }
}
