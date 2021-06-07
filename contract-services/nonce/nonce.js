const Web3 = require("web3");
const networkConfig = require("../../config/networks");

var Nonce = 0;


const nonceInit = async () => {
    let { account, web3 } = await getAccount();
    Nonce = await web3.eth.getTransactionCount(account);
}

const getNonce = () => {
    let x = Nonce;
    Nonce++;
    return x;
}

const getAccount = async () => {
    let provider = process.env.NODE_ENV == "production" ? networkConfig.maticMain : networkConfig.maticMumbaiHttps;
    let keys = process.env.NODE_ENV == "production" ? require("../keys/prod/privKey") : require("../keys/test/privKey");
    let web3 = new Web3(provider);
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + keys.key);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { account, web3 };
}

module.exports = {
    nonceInit,
    getNonce
}