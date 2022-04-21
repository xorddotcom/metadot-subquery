import { Command } from "commander";
import fs from "fs";
import compose from "lodash/fp/compose";
import path from "path";
import yaml from "yaml";

import { SupportedChains } from "../src/constants/chains";
import CHAIN_CONFIG from "./chain-config";

const program = new Command();
program
  .version("0.0.1")
  .requiredOption(
    "-n, --network <name>",
    "input network name as written in chaintypes.js",
    "polkadot"
  )
  .option("-b, --blockNumber <blockNumber>", "start block to index from")
  .option("-g, --genesisHash <genesisHash>", "genesis hash of network")
  .option("-e, --endpoint <endpoint>", "endpoint of network")
  .option("-d, --dictionary <dictionary>", "dictionary of network");
program.parse(process.argv);

const NETWORK = program.network;
const BASE_MANIFEST_PATH = path.resolve(__dirname, "../base-project.yaml");
const MANIFEST_PATH = path.resolve(__dirname, "../project.yaml");

const commandlineInput = {
  startBlockNumber: program.blockNumber,
  genesisHash: program.genesisHash,
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
  const genesisHash = commandlineInput.genesisHash ? commandlineInput.genesisHash : obj.genesisHash;
  const endpoint = commandlineInput.endpoint ? commandlineInput.endpoint : obj.endpoint;
  const dictionary = commandlineInput.dictionary ? commandlineInput.dictionary : obj.dictionary;
  const chaintypes = obj.chaintypes;

  // create chaintypes file
  fs.writeFileSync(
    path.resolve(__dirname, "../chaintypes.json"),
    JSON.stringify(chaintypes, null, 2),
    {
      encoding: "utf-8",
    }
  );

  // update start block
  _manifest.dataSources[0].startBlock = startBlockNumber;

  // update network details
  _manifest["network"] = {
    genesisHash: genesisHash,
    endpoint: endpoint,
    dictionary: dictionary,
  };

  if (chaintypes) {
    _manifest["network"].chaintypes.file = "./chaintypes.json";
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
