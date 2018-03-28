pragma solidity ^0.4.19;

/*
    Eidoo ICO Engine interface
    This interface enables Eidoo wallet to query our ICO and display all the informations needed in the app
*/
contract ICOEngineInterface {

    // false if the ico is not started, true if the ico is started and running, true if the ico is completed
    function started() public view returns (bool);

    // false if the ico is not started, false if the ico is started and running, true if the ico is completed
    function ended() public view returns (bool);

    // time stamp of the starting time of the ico, must return 0 if it depends on the block number
    function startTime() public view returns (uint);

    // time stamp of the ending time of the ico, must retrun 0 if it depends on the block number
    function endTime() public view returns (uint);

    // returns the total number of the tokens available for the sale, must not change when the ico is started
    function totalTokens() public view returns (uint);

    // returns the number of the tokens available for the ico. At the moment that the ico starts it must be equal to totalTokens(),
    // then it will decrease. It is used to calculate the percentage of sold tokens as remainingTokens() / totalTokens()
    function remainingTokens() public view returns (uint);

    // return the price as number of tokens released for each ether
    function price() public view returns (uint);
}