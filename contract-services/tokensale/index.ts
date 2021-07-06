// @ts-nocheck
import Web3 from "web3";
import TokenSaleContract from '../abi/QuizeTokenSale.json'
import BetteryTokenContract from '../abi/BTYmain.json'; // TODO rename
import { mainnet, goerli, mainnetID, mainId } from '../../config/networks';

export default function TokenSale(app: any) {
    // TODO
    app.post("/tokensale/info", async (req: any, res: any) => {
        let from = req.body.from;
        let provider = from == "prod" ? mainnet : goerli;
        let networkId: any = from == "prod" ? mainnetID : mainId;
        let keys = from == "prod" ? require("../keys/prod/privKey") : require("../keys/test/privKey");

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

async function BetteryContract(provider: any, networkId: any, keys: any) {
    let { web3, account } = await connectToContract(provider, keys);
    let abi = BetteryTokenContract.abi;
    let address = BetteryTokenContract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

async function tokenSale(provider: any, networkId: any, keys: any) {
    let { web3, account } = await connectToContract(provider, keys);
    let abi = TokenSaleContract.abi;
    let address = TokenSaleContract.networks[networkId].address;
    return new web3.eth.Contract(abi, address, { from: account });
}

async function connectToContract(provider: any, keys: any) {
    let web3 = new Web3(provider);
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + keys.key);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { web3, account };
}