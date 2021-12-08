The implementation of the Automated Market Maker Prototype is as follows:

We create a smart contract that posseses, as it's state, a liquidity pool that allows
for assets to be exchanged through it. It does this by having two functions:

InsertLiquidity(token, amount):
    this checks to make sure the sender has enough tokens, then deposits their tokens into the contract (or maybe wire to another wallet) for safe keeping. 

    The person gets returned another token to represent the amount he inserted.

WithdrawLiquidity(token, amount) send with payment of staked token:
    This checks to make sure that the pool has enough tokens to be withdrawn and that the person has an equivalent amount of staked token

    the person gets returned his tokens from the pool.


The contract will need to store the coins, and also maintain them in a pool between the two supported assets. 

For the purposes of initial implementation, the contract will preform an exchange of 1 asset for another, at a 1 to 1 ratio, so long as there are enough tokens in the contract. 




The pricing of the pool will work as follows, the pool will need two tokens deposited into the pool to work properly. Luna and UST will work fine.

We define the total amount of asset 1 x and asset 2 y respectively. 

The price needs to be held in check somehow, we can't use an outside oracle. 
 > https://ieeexplore.ieee.org/document/9461100

 When a user requests to swap asset y for x: it calls a check price function

 this check price function takes (amount of asset y):

 and returns the amount of x you would recieve from that amount of y.

 This is strictly based on the ratio from one to the other in the pool.

 The price is equal to y = 1/x, so that the two assets remain at an equilibrium yx = c. so if you trade x tokens, you recieve 1/y tokens, where y is the total amount of y tokens. 

dfngaq  