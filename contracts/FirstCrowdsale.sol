pragma solidity ^0.4.19;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "./KYCBase.sol";
import "./ICOEngineInterface.sol";


contract FirstCrowdsale is Ownable, ICOEngineInterface, KYCBase {

    using SafeMath for uint256;

    ERC20 public token; // brikToken

    address public tokenOwner; // ownerAddr of brikToken
    address public wallet; // walletAddr to collect wei raised

    uint256 public weiRaised;
    uint256 public cap = XXXXXXXXXXXXXXXX;

    uint256 public constant RATE = XXXXXXXXXXXXXXXX;

    uint256 public openingTime = XXXXXXXXXXXXXXXX; //UNIX TIMESTAMP
    uint256 public closingTime = XXXXXXXXXXXXXXXX; //UNIX TIMESTAMP

    // bool public isFinalized = false; 'FINALIZED' IMPLEMENTATION
    // mapping(address => bool) public whitelist; 'WHITELISTING' IMPLEMENTATION

    // revert if not open
    modifier onlyWhileOpen {
        require(now >= openingTime && now <= closingTime);
        _;
    }

    /* FOR 'WHITELISTING' IMPLEMENTATION
     ** whether it ll be necessary to implement whitelisting
     modifier isWhitelisted(address _beneficiary) {
      require(whitelist[_beneficiary]);
      _; }*/

    // list of events (add here some others)
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    //event Finalized();  FOR 'FINALIZED' IMPLEMENTATION


    function FirstCrowdsale(address[] kycSigner, address _wallet, ERC20 _token, address _tokenOwner)
    public KYCBase(kycSigner)
    {

        require(_wallet != address(0));
        require(_token != address(0));
        require(_tokenOwner != address(0));

        tokenOwner = _tokenOwner;
        wallet = _wallet;
        token = _token;
    }

    // -----------------------------------------
    // Crowdsale external interface
    // -----------------------------------------

    //return false if open (called to finalize contract)
    function hasClosed() public view returns (bool) {
        return now > closingTime || weiRaised >= cap;
    }

    /**
     * @dev Must be called after crowdsale ends, to do some extra finalization
     * work. Calls the contract's finalization function.
     */
    /* FOR 'FINALIZED' IMPLEMENTATION
    function finalize() onlyOwner public {
      require(!isFinalized);
      require(hasClosed());

      finalization();
      Finalized();

      isFinalized = true;
    }*/
    /* FOR 'WHITELISTING' IMPLEMENTATION
     function addToWhitelist(address _beneficiary) external onlyOwner {
      whitelist[_beneficiary] = true;
     }

     function addManyToWhitelist(address[] _beneficiaries) external onlyOwner {
      for (uint256 i = 0; i < _beneficiaries.length; i++) {
        whitelist[_beneficiaries[i]] = true;
      }
     }

     function removeFromWhitelist(address _beneficiary) external onlyOwner {
      whitelist[_beneficiary] = false;
     }
    */

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
        return cap;
    }

    function remainingTokens() public view returns (uint) {
        return cap.sub(weiRaised.mul(RATE));
    }

    function price() public view returns (uint) {
        return RATE;
    }

    // -----------------------------------------
    // Internal interface (extensible)
    // -----------------------------------------

    /*
    * a valid purchase requires a minimum amount of Eth,
    * valid beneficiaryAddr and cap not reached yet. Only while open
    */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal view onlyWhileOpen {
        require(_weiAmount >= XXXXXXXXXXXXXXXX);
        require(_beneficiary != address(0));
        require(weiRaised.add(_weiAmount) <= cap);
    }

    /**
       * @dev Can be overridden to add finalization logic.
       */
    /* function finalization() internal { } */

  // from KYCBase
    function releaseTokensTo(address _buyer) internal returns(bool) {
        uint amount = msg.value.mul(price()); // get token amount 
        _preValidatePurchase(_buyer, msg.value); // prevalidate purchase
        require(now >= startTime() && now <= endTime()); // prevalidate purchase
        weiRaised = weiRaised.add(msg.value); //update state
        wallet.transfer(msg.value); // forward funds
        require(token.transferFrom(tokenOwner, _buyer, amount)); //deliver tokens required
        TokenPurchase(msg.sender, _buyer, msg.value, amount);

        return true;
    }

} 
