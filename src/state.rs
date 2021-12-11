use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub token1: String,
    pub token2: String,
    pub amount1: i32,
    pub amount2: i32,
}

pub const STATE: Item<State> = Item::new("state");

