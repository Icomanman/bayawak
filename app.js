
const path = require('path');

const express = require('express');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');

const build_path = path.resolve(process.cwd(), 'build');
const useEnv = require('./helpers/env.js');

const initSocket = require('./utils/initSocket.js')

const app = express();
const { DEV_ADDRESS, NETWORK, SEED, USDC_TOKEN } = useEnv(false);
const walletProvider = new HDWalletProvider(SEED, NETWORK);
const web3 = new Web3(walletProvider);

const contractAddress = USDC_TOKEN; // (Proxy Contract)
const contractABI = require(`${build_path}/USDC.json`); // Implementation ABI (Implementation Contract)

// Start listening for events
(async function startEventListening() {
    let connected = false;
    const wss = await initSocket();

    try {
        connected = await wss.eth.net.isListening();
        console.log(`> Socket: ${wss.currentProvider.getStatus()}!`);
    } catch (err) {
        console.log('> Unable to connect.');
        console.error(`> ${err.message}`);
    }

    if (connected) {
        try {
            const USDC = new wss.eth.Contract(contractABI.abi, contractAddress);
            const transfer = USDC.events.Transfer({});
            console.log(USDC.events);

            transfer.on('data', data => {
                console.log(data);
                process.exit(0);
            });

            transfer.on('error', err => { throw new Error(err.message) });

            console.log('> Listening to ' + contractAddress);
        } catch (err) {
            console.log('> ERR');
            console.error(err.message);
            wss.currentProvider.disconnect();
        };
    }

    process.on('SIGINT', () => wss.currentProvider.disconnect());
})();

// Define your API endpoints or other server routes here
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// *************************************************
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});