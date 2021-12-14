import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";
import {
  isTxError,
  Coin,
  LocalTerra,
  MsgInstantiateContract,
  MsgStoreCode,
  MsgExecuteContract,
  Fee
} from "@terra-money/terra.js";
import { assert } from "console";


const terra = new LocalTerra();
const deployer = terra.wallets.test1;
let result;

async function instantiateContract(
    terra,
    deployer,
    admin, 
    codeId,
    instantiateMsg
  ) {
    const result = await sendTransaction(terra, deployer, [
      new MsgInstantiateContract(
        deployer.key.accAddress,
        admin.key.accAddress,
        codeId,
        instantiateMsg
      ),
    ]);
    return result;
  }


async function sendTransaction(
    terra,
    sender,
    msgs,
    verbose = false
  ) {
    const tx = await sender.createAndSignTx({
      msgs,
      fee: new Fee(30000000, [new Coin("uluna", 4500000), new Coin("uusd", 4500000)]),
    });
  
    const result = await terra.tx.broadcast(tx);
 
    if (isTxError(result)) {
      throw new Error(
        chalk.red("Transaction failed!") +
          `\n${chalk.yellow("code")}: ${result.code}` +
          `\n${chalk.yellow("codespace")}: ${result.codespace}` +
          `\n${chalk.yellow("raw_log")}: ${result.raw_log}`
      );
    }
  
    return result;
  }


  export async function storeCode(
    terra,
    deployer,
    filepath
  ) {
    const code = fs.readFileSync(filepath).toString("base64");
    const result = await sendTransaction(terra, deployer, [
      new MsgStoreCode(deployer.key.accAddress, code),
    ]);
    return parseInt(result.logs[0].eventsByType.store_code.code_id[0]);
  }




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



Deploy();


