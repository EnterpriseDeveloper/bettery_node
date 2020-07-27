const matic = require('@maticnetwork/maticjs');
const config = require('../config/matic.json');
const HDWalletProvider = require('@truffle/hdwallet-provider')
const networkConfig = require("../config/networks");
const { readFileSync } = require('fs');
const path = require('path');


const getMaticPOSClient = async () => {
    const privateKey = readFileSync(path.join(__dirname, 'privateKey'), 'utf-8')
    let MaticPOSClient = matic.MaticPOSClient;
    return new MaticPOSClient({
        network: 'testnet',
        version: 'mumbai',
        parentProvider: new HDWalletProvider(privateKey, networkConfig.goerli),
        maticProvider: new HDWalletProvider(privateKey, networkConfig.maticMumbaiHttps),
        posRootChainManager: config.root.RootChainManagerProxy,
        posERC20Predicate: config.root.ERC20PredicateProxy,
    })
}

module.exports = { getMaticPOSClient } 