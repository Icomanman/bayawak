
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

// const contractAddress = '0x43506849D7C04F9138D1A2050bbF3A0c054402dd'; // USDC Implementation Mainnet
const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC Token Mainnet
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
        let received = false;
        try {
            const USDC = new wss.eth.Contract(contractABI.abi, contractAddress);
            USDC.events.Transfer({}, (err, result) => {
                if (err) throw new Error(err.message);
                received = true;
                console.log('> Incoming...');
                console.log(result);
            });

            console.log('> Listening to ' + contractAddress);
            let i = 0;
            while (!received || i < 120) {
                await new Promise(resolve =>
                    setTimeout(() => {
                        console.log(i);
                        i += 1;
                        resolve();
                    }, 1000)
                );
            }
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