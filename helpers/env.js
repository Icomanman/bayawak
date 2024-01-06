
require('dotenv').config();

module.exports = function (is_dev = true) {
    return {
        DEV_ADDRESS: process.env.DEV_ADD,
        NETWORK: is_dev ? process.env.TEST_NET : process.env.MAIN_NET,
        SEED: process.env.SEED
    }
};