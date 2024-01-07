
require('dotenv').config();

module.exports = function (is_dev = true) {
    return {
        API_KEY: process.env.ETH_MATIC,
        API_SECRET: process.env.ETH_MATIC_SECRET,
        DEV_ADDRESS: process.env.DEV_ADD,
        NETWORK: is_dev ? process.env.TEST_NET : process.env.MAIN_NET,
        SEED: process.env.SEED
    }
};