/**
 * @dev Usage: compile 'contractName' (without the extension, .sol)
 * Compiles the .sol contract and saves the output .json inside /build.
 * Prompts whether or not to purge /build prior to execution.
 * Default directory is /contracts
 */
const path = require('path');
const fs = require('fs');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const getEnv = require('./env');

const { DEV_ADDRESS, SEED, NETWORK } = getEnv();
const provider = new HDWalletProvider(SEED, NETWORK);
const web3 = new Web3(provider);
const addresses_path = path.resolve(process.cwd(), 'addresses');
const build_path = path.resolve(process.cwd(), 'build');
const args_path = path.resolve(process.cwd(), 'args');

try {
    fs.readdirSync(addresses_path);
} catch (err) {
    console.log(err.message);
    fs.mkdirSync(`${process.cwd()}/addresses`);
    console.log('> /addresses created instead. Please re-run the deploy script');
    process.exit(1);
}

(async function () {
    console.log(`> Deploying from ${DEV_ADDRESS}...`);
    try {
        const { abi, evm } = require(`${build_path}/${process.argv[2]}.json`);
        const constructor_args = require(`${args_path}/${process.argv[2]}.args.json`);
        const result = await new web3.eth.Contract(abi)
            .deploy({ data: evm.bytecode.object, arguments: constructor_args.args })
            .send({ from: DEV_ADDRESS, gas: 5000000 });

        console.log(`> Contract successfully deployed at: ${result.options.address}`);
        fs.writeFileSync(`${addresses_path}/${process.argv[2]}.address.txt`, result.options.address, 'utf-8');
    } catch (err) {
        console.log('> FAILED.', err.message);
    }
    provider.engine.stop();
})();
