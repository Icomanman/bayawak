
const assert = require('assert');
const path = require('path');
const Web3 = require('web3');
const ganache = require('ganache-cli');

const build_path = path.resolve(process.cwd(), 'build');
const test_net = new Web3(ganache.provider());

const { abi, evm } = require(`${build_path}/InitMarket.json`);

let accounts;
let manager;

beforeEach(async () => {
    accounts = await test_net.eth.getAccounts();
    manager = accounts[0];

    contract = await new test_net.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object,
            arguments: []
        })
        .send({
            from: manager,
            gas: 5000000
        });
});

describe('> Main Test Template', () => {
    it('1. Deploys properly and returns the address...', async () => {
        contract.ok(contract.options.address);
    });
})