import { Command } from "commander";
import fs from "fs";
import compose from "lodash/fp/compose";
import path from "path";
import yaml from "yaml";

import { SupportedChains } from "../constants/chains";
import CHAIN_CONFIG from "./chain-config";

const program = new Command();
program
  .version("0.0.1")
  .requiredOption(
    "-n, --network <name>",
    "input network name as written in chaintypes.js",
    "polkadot"
  )
  .option("-b, --blockNumber [blockNumber]", "start block to index from", null)
  .option("-c, --chainId [chainId]", "chainId of network", null)
  .option("-e, --endpoint [endpoint]", "endpoint of network", null)
  .option("-d, --dictionary [dictionary]", "dictionary of network", null);
program.parse(process.argv);

const NETWORK = program.network;
const BASE_MANIFEST_PATH = path.resolve("./base-project.yaml");
const MANIFEST_PATH = path.resolve("./project.yaml");
const CHAINTYPES_PATH = path.resolve("./chaintypes.json");

const commandlineInput = {
  startBlockNumber: program.blockNumber,
  chainId: program.chainId,
  endpoint: program.endpoint,
  dictionary: program.dictionary,
};

function readManifestFile() {
  const content = fs.readFileSync(BASE_MANIFEST_PATH, "utf-8");
  const parsedContent = yaml.parse(content);
  return parsedContent;
}

function patchManifest(manifest) {
  const _manifest = { ...manifest };

  const obj = CHAIN_CONFIG[SupportedChains[NETWORK?.toUpperCase()]];

  if (!obj) throw Error("Network object doesnot exist in scripts/chain-config.js");

  // if any commandline input is there use that otherwise the chain-config.js
  const startBlockNumber = commandlineInput.startBlockNumber
    ? Number(commandlineInput.startBlockNumber)
    : obj.startBlock;
  const chainId = commandlineInput.chainId ? commandlineInput.chainId : obj.chainId;
  const endpoint = commandlineInput.endpoint ? commandlineInput.endpoint : obj.endpoint;
  const dictionary = commandlineInput.dictionary ? commandlineInput.dictionary : obj.dictionary;
  const chaintypes = obj.chaintypes;

  // delete chaintypes.json
  if (fs.existsSync(CHAINTYPES_PATH)) {
    fs.unlinkSync(CHAINTYPES_PATH);
  }

  // update start block
  _manifest.dataSources[0].startBlock = startBlockNumber;

  // update network details
  _manifest["network"] = {
    chainId: chainId,
    endpoint: endpoint,
  };

  if (dictionary) {
    _manifest["network"].dictionary = dictionary;
  }

  // create chaintypes file if chaintypes exist
  if (chaintypes) {
    fs.writeFileSync(path.resolve(CHAINTYPES_PATH), JSON.stringify(chaintypes, null, 2), {
      encoding: "utf-8",
    });
    _manifest["network"].chaintypes = { file: "./chaintypes.json" };
  }

  return _manifest;
}

function writeManifest(manifest) {
  const _manifest = yaml.stringify(manifest, undefined);

  fs.writeFileSync(MANIFEST_PATH, _manifest, { encoding: "utf-8" });
  console.log(`manifest file updated with network: ${NETWORK}`);
}

const run = compose(writeManifest, patchManifest, readManifestFile);
run();
