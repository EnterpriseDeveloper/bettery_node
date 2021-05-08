const keys = require("./key");

const goerli = `https://goerli.infura.io/v3/${keys.infura}`;
const maticMumbaiWSS = 'wss://ws-mumbai.matic.today';
const matciMainWSS = `wss://wispy-spring-star.matic.quiknode.pro/${keys.quiknode}/`;
const maticMumbaiHttps = 'https://rpc-mumbai.matic.today';
const gasEstimationAPI = 'https://gasstation-mumbai.matic.today';
const mainId = 5;
const maticMumbaiId = 80001;
const mainnet = `https://mainnet.infura.io/v3/${keys.infura}`;
const mainnetID = 1;
const maticMain = `https://wispy-spring-star.matic.quiknode.pro/${keys.quiknode}/`;
const maticMainId = 137;

module.exports = {
    goerli,
    maticMumbaiWSS,
    matciMainWSS,
    maticMumbaiHttps,
    mainId,
    maticMumbaiId,
    gasEstimationAPI,
    mainnet,
    mainnetID,
    maticMain,
    maticMainId
}