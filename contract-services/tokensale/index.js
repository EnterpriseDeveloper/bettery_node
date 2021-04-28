const Web3 = require("web3");
const TokenSaleContract = require('../abi/QuizeTokenSale.json')
const BetteryTokenContract = require('../abi/BTYmain.json'); // TODO rename
const { readFileSync } = require('fs');
const path = require('path');
const config = require('../../config/networks');

module.exports = app => {
    // TODO
    app.post("/tokensale/info", async (req, res) => {
        let from = req.body.from;
        let provider;
        let networkId;
        let keys;
        if (from == "prod") {
            provider = config.mainnet;
            networkId = config.mainnetID;
            keys = "./keys/prod/privateKey";
        } else if (from == "dev") {
            provider = config.goerli;
            networkId = config.mainId;
            keys = "./keys/test/privateKey";
        }
        let tokenMarket = await tokenSale(provider, networkId, keys);
        let tokenSold = await tokenMarket.methods.tokensSold().call();
        let price = await tokenMarket.methods.tokenPrice().call();
        let betteryToken = await BetteryContract(provider, networkId, keys);
        let balance = await betteryToken.methods.balanceOf(TokenSaleContract.networks[networkId].address).call();
        let web3 = new Web3();
        res.status(200);
        res.send({
            price: web3.utils.fromWei(price, "mwei"),
            tokenSold: web3.utils.fromWei(tokenSold, "ether"),
            balance: web3.utils.fromWei(balance, "ether"),
            currencyType: "USDT"
        })
    })
}

async function BetteryContract(provider, networkId, keys) {
    let { web3, account } = await connectToContract(provider, keys);
    let abi = BetteryTokenContract.abi;
    let address = BetteryTokenContract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

async function tokenSale(provider, networkId, keys) {
    let { web3, account } = await connectToContract(provider, keys);
    let abi = TokenSaleContract.abi;
    let address = TokenSaleContract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

async function connectToContract(provider, keys) {
    let web3 = new Web3(provider);
    let privateKey = readFileSync(path.join(__dirname, keys), 'utf-8')
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { web3, account };
}