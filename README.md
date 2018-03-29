# Brikbit Digital Shares ICO smart contracts (WIP)

### BRIK
The BRIK token is a standard ERC20 token that can be used for interacting with the Brikbit Platforms.

### Documentation

Please see the [Brikbit site](https://brikbit.io) for the whitepaper and for ICO launch details. 

## Install, testing and deploy:
---------------------------------------------------------------------------------------------------------

This project uses the [Truffle Framework](http://truffleframework.com/).

1. Install truffle

```npm install -g truffle```

2. Choose an ethereum client ([Ganache](http://truffleframework.com/ganache/) recommended)

3. Clone the repository

```git clone https://github.com/BrikbitDigitalShares/BrikToken.git```

4. Change parameters in contracts code:

```
// FirstCrowdsale.sol

uint256 public cap = XXXXXXXXXXXXXXXX; // Ln 20,Col 26
uint256 public constant RATE = XXXXXXXXXXXXXXXX; // Ln 22,Col 36
uint256 public openingTime = XXXXXXXXXXXXXXXX; // Ln 24,Col 34
uint256 public closingTime = XXXXXXXXXXXXXXXX; // Ln 25,Col 34

require(_weiAmount >= XXXXXXXXXXXXXXXX); // Ln 137,Col 31

// SecondCrowdsale.sol

uint256 public cap = XXXXXXXXXXXXXXXX; // Ln 19,Col 26
uint256 public openingTime = XXXXXXXXXXXXXXXX; // Ln 21,Col 35
uint256 public closingTime = XXXXXXXXXXXXXXXX; // Ln 22,Col 35

require(_weiAmount >= XXXXXXXXXXXXXXXX); // Ln 112,Col 31

rate = XXXXXXXXXXXXXXXX; // first rate, Ln 112,Col 31
rate = XXXXXXXXXXXXXXXX; // second rate, Ln 112,Col 31
rate = XXXXXXXXXXXXXXXX; // third rate, Ln 112,Col 31

```

4. install node_modules 

 ```npm install```

5. compile and deploy

```truffle compile && truffle migrate```

6. run tests (be sure to set correct parameters in [BrikBitCrowdsaleTest.js](https://github.com/BrikbitDigitalShares/BrikToken/blob/master/test/BrikBitCrowdsaleTest.js) before running test)

```truffle test```
