
const path = require('path');

const express = require('express');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');

const build_path = path.resolve(process.cwd(), 'build');
const useEnv = require('./helpers/env.js');

const initSocket = require('./utils/initSocket.js')

const app = express();
const { DEV_ADDRESS, NETWORK, SEED } = useEnv(false);
const walletProvider = new HDWalletProvider(SEED, NETWORK);
const web3 = new Web3(walletProvider);

const contractAddress = '0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF'; // USDC Implementation Mainnet
const contractABI = require(`${build_path}/USDC.json`);;

const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

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
            console.log(connected);
            // const subscription = await wss.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
            //     if (error) {
            //         console.error('Error:', error);
            //     } else {
            //         console.log('New Block Header:', blockHeader);
            //     }
            // });
        } catch (err) {
            console.log('> ERR');
            console.error(err.message);
            wss.currentProvider.disconnect();
        };
    }

    // process.exit();
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