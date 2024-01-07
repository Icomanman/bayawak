
const useEnv = require('../helpers/env.js');

const { Web3 } = require('web3');

async function initConnection(socket = 'wss://mainnet.infura.io/ws/v3/') {
    let wss = null;
    const { API_KEY, DEV_ADDRESS, NETWORK, SEED } = useEnv();
    wss = new Web3(socket + API_KEY); // concise
    console.log(`> Socket: ${wss.currentProvider.getStatus()}...`);
    return wss;
}

module.exports = initConnection;