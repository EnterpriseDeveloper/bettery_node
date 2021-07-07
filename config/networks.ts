import {infura} from "./key";

// Matic main
const maticMain = `https://nd-166-193-145.p2pify.com/2f7e02c8a0c734ceacc688cd604521bc`;
const matciMainWSS = `wss://ws-nd-166-193-145.p2pify.com/2f7e02c8a0c734ceacc688cd604521bc`;
const maticMainId = 137;
// Mumbai
const maticMumbaiHttps = 'https://competent-panini:demise-sphere-refuse-spoils-down-fiber@nd-425-039-881.p2pify.com';
const maticMumbaiWSS = 'wss://competent-panini:demise-sphere-refuse-spoils-down-fiber@ws-nd-425-039-881.p2pify.com';
const maticMumbaiId = 80001;
// Goerli
const goerli = `https://goerli.infura.io/v3/${infura}`;
const mainId = 5;
// Main Ether
const mainnet = `https://mainnet.infura.io/v3/${infura}`;
const mainnetID = 1;
// Gas estimation
const gasEstimationMumbaiAPI = 'https://gasstation-mumbai.matic.today';
const gasEstimationMainAPI = "https://gasstation-mainnet.matic.network"


export {
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