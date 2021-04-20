const Web3 = require('web3');
const { readFileSync } = require('fs');
const path = require('path');
const networkConfig = require("../config/networks");


async function getAccount(provider, keys) {
    let web3 = new Web3(provider);
    let privateKey = readFileSync(path.join(__dirname, keys), 'utf-8')
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { web3, account };
}

async function init(networkWay, contract) {
    let network = networkWay == "production" ? networkConfig.maticMain : networkConfig.maticMumbaiHttps,
        networkId = networkWay == "production" ? networkConfig.maticMainId : networkConfig.maticMumbaiId,
        keys = networkWay == "production" ? "./keys/prod/privateKey" : "./keys/test/privateKey";
    return await connectToNetwork(network, networkId, contract, keys);
}

async function webSoketInit(networkWay, contract) {
    let network = networkWay == "production" ? networkConfig.matciMainWSS : networkConfig.maticMumbaiWSS,
        networkId = networkWay == "production" ? networkConfig.maticMainId : networkConfig.maticMumbaiId,
        keys = networkWay == "production" ? "./keys/prod/privateKey" : "./keys/test/privateKey"
    return await connectToNetwork(network, networkId, contract, keys);
}

async function connectToNetwork(network, networkId, contract, keys) {
    let { web3, account } = await getAccount(network, keys);
    let abi = contract.abi;
    let address = contract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

module.exports = {
    init,
    webSoketInit
}
