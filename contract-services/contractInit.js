const Web3 = require('web3');
const networkConfig = require("../config/networks");


async function getAccount(provider, keys) {
    let web3 = new Web3(provider);
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + keys.key);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { web3, account };
}

async function init(networkWay, contract) {
    let network = networkWay == "production" ? networkConfig.maticMain : networkConfig.maticMumbaiHttps,
        networkId = networkWay == "production" ? networkConfig.maticMainId : networkConfig.maticMumbaiId,
        keys = networkWay == "production" ? require("./keys/prod/privKey") : require("./keys/test/privKey");
    return await connectToNetwork(network, networkId, contract, keys);
}

async function webSoketInit(networkWay, contract) {
    let network = networkWay == "production" ? networkConfig.matciMainWSS : networkConfig.maticMumbaiWSS,
        networkId = networkWay == "production" ? networkConfig.maticMainId : networkConfig.maticMumbaiId,
        keys = networkWay == "production" ? require("./keys/prod/privKey") : require("./keys/test/privKey");
    return await connectToNetwork(network, networkId, contract, keys);
}

async function connectToNetwork(network, networkId, contract, keys) {
    let { web3, account } = await getAccount(network, keys);
    let abi = contract.abi;
    let address = contract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

async function webSocketCheck(networkWay){
    let network = networkWay == "production" ? networkConfig.matciMainWSS : networkConfig.maticMumbaiWSS;
    return new Web3.providers.WebsocketProvider(network)
}

module.exports = {
    init,
    webSoketInit,
    webSocketCheck
}

