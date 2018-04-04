pragma solidity ^0.4.19;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "./KYCBase.sol";
import "./ICOEngineInterface.sol";

contract SecondCrowdsale is ICOEngineInterface, KYCBase {

    using SafeMath for uint256;

    ERC20 public token; // BrikToken

    address public tokenOwner; // ownerAddr of BrikToken
    address public wallet; // walletAddr to collect wei raised

    uint256 public soldTokens; // tracker
    uint256 public weiRaised;
    uint256 public cap = XXXXXXXXXXXXXXXX;

    uint256 public  openingTime = XXXXXXXXXXXXXXXX; //UNIX TIMESTAMP
    uint256 public  closingTime = XXXXXXXXXXXXXXXX; //UNIX TIMESTAMP
    // bool public isFinalized = false; FOR  'FINALIZED' IMPLEMENTATION

    // revert if not open
    modifier onlyWhileOpen {
        require(now >= openingTime && now <= closingTime);
        _;
    }

    // list of events
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    //event Finalized(); FOR 'FINALIZED' IMPLEMENTATION

    function SecondCrowdsale(address[] kycSigner, address _wallet, ERC20 _token, address _tokenOwner)
    public KYCBase(kycSigner)
    {
        require(_wallet != address(0));
        require(_token != address(0));
        require(_tokenOwner != address(0));

        wallet = _wallet;
        token = _token;
        tokenOwner = _tokenOwner;


    }

    // -----------------------------------------
    // Crowdsale external interface
    // -----------------------------------------

    //return false if open, called to finalize contract
    function hasClosed() public view returns (bool) {
        return now > closingTime || weiRaised >= cap;
    }
    /**
    FOR 'FINALIZED' IMPLEMENTATION
    * @dev Must be called after crowdsale ends, to do some extra finalization
    * work. Calls the contract's finalization function.
    */
    /*
    function finalize() onlyOwner public {
    require(!isFinalized);
    require(hasClosed());

    finalization();
    Finalized();

    isFinalized = true;
    }*/

    // ICOEngine Eidoo functions
    function started() public view returns (bool) {
        return now > openingTime;
    }

    function ended() public view returns (bool) {
        return now > closingTime || weiRaised >= cap;
    }

    function startTime() public view returns (uint) {
        return openingTime;
    }

    function endTime() public view returns (uint) {
        return closingTime;
    }

    function totalTokens() public view returns (uint) {
        return cap.div(10**18);
    }

    function remainingTokens() public view returns (uint) {
        return cap.sub(soldTokens);
    }

    function price() public view returns (uint) {
        return _getCurrentRate();
    }

    // -----------------------------------------
    // Internal interface (extensible)
    // -----------------------------------------

    /*
    * a valid purchase requires a minimum amount of Eth,
    * valid beneficiaryAddr and cap not reached yet. Only while open
    */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal view onlyWhileOpen {
        require(_beneficiary != address(0));
        require(_weiAmount >= XXXXXXXXXXXXXXXX);
        require(weiRaised.add(_weiAmount) <= cap);
    }

    function _getCurrentRate() internal view returns (uint256) {

        uint256 rate;
        if (now < (openingTime + XXX hours)) {
            rate = XXXXXXXXXXXXXXXX;
        } else if (now < (openingTime + XXX hours)) {
            rate = XXXXXXXXXXXXXXXX;
        } else {
            rate = XXXXXXXXXXXXXXXX;
        }
        return rate;
    }

    // there are three different rates for three different sale stages
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        return _weiAmount.mul(_getCurrentRate());
    }

    /**
     * @dev Can be overridden to add finalization logic. 
     */
     /* 
     function finalization() internal { 
 
     }*/
 
     // from KYCBase
    function releaseTokensTo(address _buyer) internal returns(bool) {
        uint amount = msg.value.mul(price()); // get token amount 
        _preValidatePurchase(_buyer, msg.value); // prevalidate purchase
        require(now >= startTime() && now < endTime()); // prevalidate purchase 
        soldTokens = soldTokens.add(amount); // track the sold tokens flow
        weiRaised = weiRaised.add(msg.value); //update state
        wallet.transfer(msg.value); // forward funds
        require(token.transferFrom(tokenOwner, _buyer, amount)); //deliver tokens required
        TokenPurchase(msg.sender, _buyer, msg.value, amount);

        return true;
    }
}
