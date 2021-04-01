const PlayerPaymentContract = require("../abi/PlayerPayment.json");
const ContractInit = require("../contractInit");
const axios = require("axios");
const url = require("../../config/path");
const Web3 = require("web3");

const payToLosers = async (data) => {
    console.log("from payToLosers")
    console.log(data);
    let id = data.id;
    let avarageBet = data.avarageBet;
    let calcMintedToken = data.calcMintedToken;
    let winPool = data.winPool;
    let avarageBetWin = data.avarageBetWin;
    let premimWin = data.premimWin;

    // TODO add prodaction 
    let path = "test" // process.env.NODE_ENV
    let contract = await ContractInit.init(path, PlayerPaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).estimateGas();
        await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).send({
            gas: gasEstimate,
            gasPrice: 0
        });

        await setToDB(id, avarageBet, calcMintedToken, winPool, avarageBetWin, premimWin);

    } catch (err) {
        console.log("err from pay to losers", err)
    }
}

const setToDB = async (id, _avarageBet, _calcMintedToken, _winPool, _avarageBetWin, _premimWin) => {
    let web3 = new Web3();
    let avarageBet = web3.utils.fromWei(String(_avarageBet), "ether");
    let calcMintedToken = web3.utils.fromWei(String(_calcMintedToken), "ether");
    let winPool = web3.utils.fromWei(String(_winPool), "ether");
    let avarageBetWin = web3.utils.fromWei(String(_avarageBetWin), "ether");
    let premimWin = web3.utils.fromWei(String(_premimWin), "ether");

    let getData = {
        "select": [
            "publicEvents/finalAnswerNumber",
            "publicEvents/premium",
            {
                "publicEvents/parcipiantsAnswer":
                    ["publicActivites/amount", "publicActivites/answer", "publicActivites/from"]
            }
        ], "from": Number(id)
    }

    let getPlayers = await axios.post(`${url.path}/query`, getData).catch((err) => {
        console.log("DB error from query payToLosers: " + err.response.data.message)
        return;
    })

    let allData = [];
    let finalAnswer = getPlayers.data[0]['publicEvents/finalAnswerNumber'];
    let allPlayers = getPlayers.data[0]['publicEvents/parcipiantsAnswer'];
    let premium = getPlayers.data[0]['publicEvents/premium'] == undefined ? false : getPlayers.data[0]['publicEvents/premium'];

    for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i]['publicActivites/answer'] != finalAnswer) {
            // calc winner
            let x = {
                "_id": allPlayers[i]["_id"],
                mintedToken: (calcMintedToken * allPlayers[i]['publicActivites/amount']) / (avarageBet * allPlayers.length),
                payToken: 0,
                premiumToken: 0
            }
            allData.push(x)
        } else {
            // calc loser
            let x = {
                "_id": allPlayers[i]["_id"],
                mintedToken: calcMintedToken * allPlayers[i]['publicActivites/amount'] / (avarageBet * allPlayers.length),
                payToken: ((winPool * allPlayers[i]['publicActivites/amount']) / avarageBetWin) + allPlayers[i]['publicActivites/amount'],
                premiumToken: premium ? premimWin * allPlayers[i]['publicActivites/amount'] / avarageBetWin : 0
            }
            allData.push(x)
        }
    }

    await axios.post(`${url.path}/transact`, allData).catch((err) => {
        console.log("DB error from transact payToLosers: " + err.response.data.message)
        return;
    })
    return;
}

module.exports = {
    payToLosers
}