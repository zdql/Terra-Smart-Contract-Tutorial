use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cosmwasm_std::Coin;


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub token1: Coin,
    pub token2: Coin,
    pub amount1: i32,
    pub amount2: i32
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    GetToken1for2 { token1: Coin },
    GetToken2for1 { token2: Coin },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    // GetPool returns the two pools and the amount inside them
    GetPool {},
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct PoolResponse {
    pub token1: Coin,
    pub token2: Coin,
    pub amount1: i32,
    pub amount2: i32,
}

pub struct AssetResponse {
    pub token: Coin,
    pub amount: i32,
}