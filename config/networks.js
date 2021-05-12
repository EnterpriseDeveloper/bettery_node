const keys = require("./key");

// Matic main
const maticMain = `https://wispy-spring-star.matic.quiknode.pro/${keys.quiknode}/`;
const matciMainWSS = `wss://wispy-spring-star.matic.quiknode.pro/${keys.quiknode}/`;
const maticMainId = 137;
// Mumbai
const maticMumbaiHttps = 'https://matic-testnet-archive-rpc.bwarelabs.com';
const maticMumbaiWSS = 'wss://ws-mumbai.matic.today';
const maticMumbaiId = 80001;
// Goerli
const goerli = `https://goerli.infura.io/v3/${keys.infura}`;
const mainId = 5;
// Main Ether
const mainnet = `https://mainnet.infura.io/v3/${keys.infura}`;
const mainnetID = 1;
// Gas estimation
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