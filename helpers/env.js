
require('dotenv').config();

module.exports = function (is_dev = true) {
    return {
        NETWORK: is_dev ? process.env.TEST_NET : process.env.MAIN_NET
    }
};