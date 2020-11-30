const Web3 = require("web3");
const TokenSaleContract = require('../abi/QuizeTokenSale.json')
const BetteryTokenContract = require('../abi/EthERC20Coin.json');
const { readFileSync } = require('fs');
const path = require('path');

module.exports = app => {
    app.get("/tokensale/info", async (req, res) => {
        let provider = "https://goerli.infura.io/v3/2b5ec85db4a74c8d8ed304ff2398690d";
        let networkId = 5;
        let tokenMarket = await tokenSale(provider, networkId);
        let tokenSold = await tokenMarket.methods.tokensSold().call();
        let price = await tokenMarket.methods.tokenPrice().call();
        let betteryToken = await BetteryContract(provider, networkId);
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

async function BetteryContract(provider, networkId) {
    let { web3, account } = await connectToContract(provider);
    let abi = BetteryTokenContract.abi;
    let address = BetteryTokenContract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

async function tokenSale(provider, networkId) {
    let { web3, account } = await connectToContract(provider);
    let abi = TokenSaleContract.abi;
    let address = TokenSaleContract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

async function connectToContract(provider) {
    let web3 = new Web3(provider);
    let privateKey = readFileSync(path.join(__dirname, '../privateKey'), 'utf-8')
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { web3, account };
}