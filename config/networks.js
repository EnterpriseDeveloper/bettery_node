const keys = require("./key");

const goerli = `https://goerli.infura.io/v3/${keys.infura}`;
const maticMumbaiWSS = 'wss://ws-mumbai.matic.today';
const matciMainWSS = `wss://wispy-spring-star.matic.quiknode.pro/${keys.quiknode}/`;
const maticMumbaiHttps = 'https://rpc-mumbai.maticvigil.com/v1/0a4eb295e6abcd89e03e21b86b4e15a59fb1a8ab';
const mainId = 5;
const maticMumbaiId = 80001;
const mainnet = `https://mainnet.infura.io/v3/${keys.infura}`;
const mainnetID = 1;
const maticMain = `https://wispy-spring-star.matic.quiknode.pro/${keys.quiknode}/`;
const maticMainId = 137;
const gasEstimationMumbaiAPI = 'https://gasstation-mumbai.matic.today';
const gasEstimationMainAPI ="https://gasstation-mainnet.matic.network"


module.exports = {
    goerli,
    maticMumbaiWSS,
    matciMainWSS,
    maticMumbaiHttps,
    mainId,
    maticMumbaiId,
    gasEstimationMumbaiAPI,
    mainnet,
    mainnetID,
    maticMain,
    maticMainId,
    gasEstimationMainAPI
}