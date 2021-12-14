# Writing a Smart Contract On Terra

Terra is a powerful and revolutionary blockchain protocol that offers arguably the most sophisticated stablecoin system that exists today. It offers stable coins pegged at the price of the Dollar, Euro and Won, among others, hosted on it's own blockchain that allows for the construction of powerful decentralized applications.

Terra is able to keep prices accurate by using their miners as a Decentralized Oracle. Miners stake Terra's native token Luna, and provide price estimates for each stablecoin based on their observations of real world markets. They are rewarded in Luna if they provide price estimates that are within a distance from the polled median. In turn, inaccurate price submissions punish the miners. 

The supply of Luna and Terra's stablecoins are regulated by the ability for users to burn one for the other. By doing this, the protocol maintains an elastic monetary system that regulates the supply of both assets. 

Terra's innovative fiat-based stablecoins, in combination with it's use of Cosmos SDK make it an ideal protocol for constructing smart contracts and decentralized applications. In this article, we'll look at building a basic smart contract in Rust using CosmWasm. CosmWasm is a smart contract compiler powered by Cosmos, which we'll deploy to the Terra blockchain. 

The contract, found in src, has 5 files in it. Each file has a specific purpose that tells the compiler how to define your contract in our case, but these can be redefined in lib.rs. In contract.rs, the main logic of the application is written. Error.rs defines the types of errors that can be returned by the contract. Msg.rs defines the messages that can be sent and received by the contract. Finally, state.rs defines the database that is stored natively in the contract.  

Rust makes it easy to make highly customizable and efficient smart contracts. We'll dive into contract.rs, as the other files define structs that we'll reference in the core contract. 

The purpose of our contract will be very straightforward. It maintains a pool of two "assets", which are really just two counters. The contract allows a user to increment one of the pools, which decreases the other, and vice versa. The contract aims to emulate a pool that can be swapped between, which is a popular and important architecture in Decentralized Finance. 

We start with importing some crates, and defining the contract name and version as a constant. When installing Rust, you should also have installed Cargo, which is Rust's package manager. You'll notice these are defined in Cargo.toml under depencies. 

```
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{StdResult, Deps, DepsMut, Env, MessageInfo, Response, to_binary, Binary};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{PoolResponse, ExecuteMsg, InstantiateMsg, QueryMsg};


use crate::state::{State, STATE};

```

There are three main functions that can be called in our smat contract, instantiate, execute, and query. You can see that each is marked with "entry point". Our first function is called instantiate. This is where we see how CosmWasm's standard contract objects are used. We see that we call instantiate with several arguments. 

```
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let mut _token1 = msg.token1;
    let mut _token2 = msg.token2;

    let state = State {
        token1: _token1,
        token2: _token2,
        amount1: msg.amount1,
        amount2: msg.amount2,
    };

    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    STATE.save(deps.storage, &state)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender)
    )
}
```

The first argument we pass is for deps. In CosmWasm, sending deps into a function allows the function to view the stored data in the contract, the database we declared in state.rs. If we want to be able to modify this data in our function, we pass DepsMut, or Deps' mutable version. This helps keep our contract safe from modifying our database when it should not be modified. 

The second argument and third argument passed are _env, and info. _env is not very important for our contract, the _env contains inforation about the transaction that the message was sent in. Info contains MessageInfo, a struct that contains the sender of the message. For example, here info would contain the person who sent the InstanstiateMsg message in this example. 

In msg, we pass in the actual message sent to the contract, so that we can use our user's provided information to instantiate their pool. 

You'll notice that in CosmWasm, functions must declare return types and errors. Here, we define Response as the return type, and ContractError as the potential error. 

The logic of instantiate() is straightforward. We declare a new state, and assign the contents of the instantiate message to the state. We then set the contract's version using the constants declared earlier in the contract, and save the current state to our deps.storage.

We then define our Response, where we use CosmWasm's default Response object, and then add custom attributes as necessary. In the instantiate function, we can just return the owner of the contract, or whoever initially sent InstantiateMsg.


Now, let's take a look at execute. Execute is where the contract's functions are declared that require DepsMut, which we mentioned earlier. Some functions in CosmWasm edit our state, and some are read-only. Execute() is where we define contracts that have the power to edit our state.

```
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::GetToken1for2 {token1} => get_token1for2(deps, token1),
        ExecuteMsg::GetToken2for1 {token2} => get_token2for1(deps, token2),
    }
}
```

While most of the function header is similar to instantiate, we see that in our function body we use a match statement. In Rust, match is similar to a switch statement in Python - The function accepts a msg object, and Rust's compiler will make sure you have declared what should happen when each possible  type of message is sent. Here, we see that we simply link each message, and it's arguments, to the function in the contract that we want to be called. 

```
pub fn get_token1for2(deps: DepsMut, amount: i32) -> Result<Response, ContractError> {

        let exchange_rate = 1;
        let pool_amount = amount;
        let return_amount = pool_amount * exchange_rate;
        STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
        if return_amount > state.amount2 {
            return Err(ContractError::Unauthorized {})
        }  
        state.amount1 += amount;
        state.amount2 = state.amount2 - return_amount;
        Ok(state)
    })?;

    Ok(Response::new().add_attribute("method", "GetToken1for2"))
}
```

In the actual logic for get_token1for2, we pass in the amount that we'd like to swap as amount. You can see that this is marked as an i32, this means a signed 32 bit integer. Rust allows you to be very granular about the amount of memory you reserve for different numbers, for example we could use i8, for 8 bits, or u32, for an unsigned 32 bit integer.This is a very powerful feature when writing complex and efficient programs. For now, we will use i32.  

The most important part of this function call is STATE.update, where we pass in our state declared as a mutable object, modify amount1 and amount2, and then save it. Rust uses Ok() as the signal to end this function's execution. You can see that the return type of STATE.update is _, Rust uses _ as a "catchall", meaning the return type can be anything. If we aim to return more than is left in the pool for asset 2, we will throw an Unauthorized error.  

Finally, in get_token1for2, we send a response with Ok() and add an atribute indicating that this was the function that was called. 

The logic for get_token2for1 is almost identical. 

Our final entry-point function is query, which you'll notice only requires Deps, and not DepsMut. This is as it is read-only, and is only getting the current state, not modifying it. We once again have a match statement, telling our contract what to do with each type of read-only message. There is only one in our contract, QueryMsg, and we call get_pool with this message. We encode the response from get_pool into binary so that the information can be sent in a message. 


```
pub fn get_pool(deps: Deps) -> StdResult<PoolResponse> {
    let state = STATE.load(deps.storage)?;
    Ok(PoolResponse { amount1: state.amount1, amount2: state.amount2, token1: state.token1, token2: state.token2 })
    }
```

The logic for get_pool loads the current state, and then responds with one of our predefined PoolResponses, which is a type of Response. You can see that we use StdResult and do not declare an error type, StdResult can be used if a custom error does not need to be specified. 

The rest of the contract has testing functions to make sure everything is working properly. Rust has powerful testing libraries and allows them to seamlessly integrate into program logic. The tests are straightforward, they ensure that our functions work properly by instantiating and sending them messages. Testing smart contracts in this manner offers the ability to very easily develop and iterate with the confidence that you are not breaking your contract's logic - That is, if the tests are written properly. We won't go over the written tests in this article, but you should always test your CosmWasm contracts thoroughly before deploying. 

Now, with our contract written, it is time to compile and deploy the contract to our localTerra environment. 

To compile our contract, we will need to set up our environment properly by installing LocalTerra and Terra Core. This article from Terra's docs detail these steps carefully. https://docs.terra.money/Tutorials/Smart-contracts/Set-up-local-environment.html#install-terra-core-locally

To compile our contract, we will use the command:

```
cargo wasm
```
We'll need to further optimize the contract to make the binary as small as possible. To do this, we call either:

```
cargo run-script optimize
```

Or this larger code block, if you are on an Arm64 machine. 

``` 
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer-arm64:0.12.4
  ```


To deploy our contract to LocalTerra, we'll need to spin up our localterra environment. To do this, make sure you have localterra installed and call the following:

```
docker-compose up
```

Once localterra is running, you should be able to run the script provided in scripts/index.js to deploy our compiled contract. We call several helper functions which you should explore, these take care of calling Terra.js's functions for contract upload, and sending our instantiation, execution and query messages. For our tutorial, we'll explain the main function, Deploy().

```
async function Deploy() {
    
    const cw20CodeId = await storeCode(
        terra,
        deployer,
        path.resolve("../artifacts/exchangepool-aarch64.wasm")
      );

      console.log(cw20CodeId);

      const instance = await instantiateContract(terra, deployer, deployer, cw20CodeId, {
        token1: "token1",
        token2: "token2",
        amount1: 50,
        amount2: 50
      });

      const address = JSON.parse(instance.raw_log)[0].events[1].attributes[3].value;


      await sendTransaction(terra, deployer, [
        new MsgExecuteContract(deployer.key.accAddress, address, {
            get_token1for2: {
            token1: 1,
          },
        }),
      ]);

      const pool = await terra.wasm.contractQuery(address, {"get_pool":{}})

      return pool;
    }
```