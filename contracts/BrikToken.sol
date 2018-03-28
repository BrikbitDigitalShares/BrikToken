pragma solidity ^0.4.19;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

// Brik Token contract
contract BrikToken is StandardToken, Ownable {

    string public constant NAME = "BrikBit Token";
    string public constant SYMBOL = "BRIK";
    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 100000000 * (10 ** uint256(DECIMALS));

    function BrikToken() public {

        totalSupply_ = INITIAL_SUPPLY;

        balances[msg.sender] = INITIAL_SUPPLY;
        Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }
}
