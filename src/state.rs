use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::Coin;
use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub token1: Coin,
    pub token2: Coin,
    pub amount1: i32,
    pub amount2: i32,
}

pub const STATE: Item<State> = Item::new("state");

