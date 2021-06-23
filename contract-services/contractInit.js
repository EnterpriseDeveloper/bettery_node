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
        networkId = networkWay == "production" ? networkConfig.maticMainId : networkConfig.maticMumbaiId;
    return await connectToNetwork(network, networkId, contract, networkWay);
}

function webSoketInit(networkWay) {
    let network = networkWay == "production" ? networkConfig.matciMainWSS : networkConfig.maticMumbaiWSS,
        networkId = networkWay == "production" ? networkConfig.maticMainId : networkConfig.maticMumbaiId;
    let options = {
        timeout: 30000, // ms
        clientConfig: {
            // Useful if requests are large
            maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
            maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
            // Useful to keep a connection alive
            keepalive: true,
            keepaliveInterval: -1 // ms
        },
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 1000, // ms
            maxAttempts: 20,
            onTimeout: false
        }
    };
    let provider = new Web3.providers.WebsocketProvider(network);
    provider.on('error', e => {
        console.log('!!!!WS ERROR!!!!', e)
    });
    provider.on('end', e => {
        console.log('!!!!WS CLOSE!!!!');
        console.log(e);
    });
    return { provider, networkId };
}



async function connectToNetwork(network, networkId, contract, networkWay) {
    let keys = networkWay == "production" ? require("./keys/prod/privKey") : require("./keys/test/privKey");
    let { web3, account } = await getAccount(network, keys);
    let abi = contract.abi;
    let address = contract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

module.exports = {
    init,
    webSoketInit,
    connectToNetwork
}

