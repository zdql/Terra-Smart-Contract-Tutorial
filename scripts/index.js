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



const terra = new LocalTerra();
const deployer = terra.wallets.test1;
let result;


async function Deploy() {
    
    const cw20CodeId = await storeCode(
        terra,
        deployer,
        path.resolve(__dirname, "../artifacts/exchangepool-aarch64.wasm.wasm")
      );

      console.log(chalk.green("Done!"), `${chalk.blue("codeId")}=${cw20CodeId}`);

      const deploy = await instantiateContract(terra, deployer, deployer, cw20CodeId, {
        token1: "token1",
        token2: "token2",
        amount1: 50,
        amount2: 50
      });
      console.log("deploy", deploy);

      const getToken1for2Test = await sendTransaction(terra, deployer, [
        new MsgExecuteContract(deployer.key.accAddress, result, {
          GetToken1for2: {
            token1: 1,
          },
        }),
      ]);

      console.log(chalk.green("Got token 1 for 2!"), `${chalk.blue("result")}=${getToken1for2Test}`);

    }

Deploy();


function toEncodedBinary() {
    return Buffer.from(JSON.stringify(obj)).toString("base64");
  }


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
  
    // Print the log info
    if (verbose) {
      console.log(chalk.magenta("\nTxHash:"), result.txhash);
      try {
        console.log(
          chalk.magenta("Raw log:"),
          JSON.stringify(JSON.parse(result.raw_log), null, 2)
        );
      } catch {
        console.log(chalk.magenta("Failed to parse log! Raw log:"), result.raw_log);
      }
    }
  
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