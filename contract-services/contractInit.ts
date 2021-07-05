import Web3 from 'web3';
import { maticMain, maticMumbaiHttps, maticMainId, maticMumbaiId, matciMainWSS, maticMumbaiWSS } from "../config/networks";


async function getAccount(provider: any, keys: any) {
    let web3 = new Web3(provider);
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + keys.key);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { web3, account };
}

async function init(networkWay: any, contract: any) {
    let network = networkWay == "production" ? maticMain : maticMumbaiHttps,
        networkId = networkWay == "production" ? maticMainId : maticMumbaiId;
    return await connectToNetwork(network, networkId, contract, networkWay);
}

function webSoketInit(networkWay: any) {
    let network = networkWay == "production" ? matciMainWSS : maticMumbaiWSS,
        networkId = networkWay == "production" ? maticMainId : maticMumbaiId;
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
    return { provider, networkId };
}



async function connectToNetwork(network: any, networkId: any, contract: any, networkWay: any) {
    let keys = networkWay == "production" ? require("./keys/prod/privKey") : require("./keys/test/privKey");
    let { web3, account } = await getAccount(network, keys);
    let abi = contract.abi;
    let address = contract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

export {
    init,
    webSoketInit,
    connectToNetwork
}

