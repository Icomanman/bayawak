
const child_process = require('child_process');
const path = require('path');

const express = require('express');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');

const build_path = path.resolve(process.cwd(), 'build');
const useEnv = require('./helpers/env.js');

const app = express();
const { DEV_ADDRESS, NETWORK, SEED } = useEnv(false);
const provider = new HDWalletProvider(SEED, NETWORK);


const web3 = new Web3(provider);

// const contractAddress = '0xb867eb81814F5655f598625dbA41209fc9aF3eED'; // USDC Implementation on Goerli
// const contractABI = require(`${build_path}/USDCGoerliImp.json`);;
const contractAddress = '0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF'; // USDC Implementation Mainnet
const contractABI = require(`${build_path}/USDC.json`);;

const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Start listening for events
(async function startEventListening() {
    console.log(`> ${NETWORK}`);
    // console.log(`> ${contract.options.address}`);
    // console.log(`> ${Object.keys(contract.events)}`);
    // console.log(`> ${await contract.methods.balanceOf(DEV_ADDRESS).call()}`);
    // console.log(`> ${await contract.methods.totalSupply().call()}`);

    const transferEvent = contract.events.Burn();
    transferEvent.on('data', (event) => {
        console.log('Transfer Event Data:', event.returnValues);
        // Implement your logic here to handle the Transfer event data
    });

    // setInterval(() => {
    //     // Event listening functionality
    //     contract.events['Transfer']({}, (error, event) => {
    //         if (error) {
    //             console.error("Error:", error);
    //             return;
    //         }

    //         console.log("New event received:");
    //         console.log(event.returnValues);
    //     })
    //     // .on("connected", () => {
    //     //     console.log("Connected to the blockchain");
    //     // })
    //     // .on("changed", (event) => {
    //     //     console.log("Event changed:", event.returnValues);
    //     // })
    //     // .on("error", (error) => {
    //     //     console.error("Event error:", error);
    //     // });

    //     console.log("End of routine");
    // }, 1000);

    // process.exit();
})();

// Define your API endpoints or other server routes here
app.get('/', (req, res) => {
    res.send('Server is running!');
});

const URL = 'http://localhost'
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// ***************************************************
// let start = 'xdg-open';
// let kill_comm = 'pkill -f chrome';
// if (process.platform == 'win32') {
//     start = 'start msedge';
//     kill_comm = "'TASKKILL /F /IM msedge.exe /T'";
// };

// process.on('exit', () => child_process.exec(kill_comm));
// console.log(`${start} ${URL}:${PORT}`);
// child_process.exec(`${start} ${URL}:${PORT}`);
// ***************************************************