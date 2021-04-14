const axios = require("axios");
const url = require("../../../config/path");
const Web3 = require("web3");

const setToDB = async (data) => {
    let web3 = new Web3();
    let id = Number(data.id);
    let avarageBet = Number(web3.utils.fromWei(String(data.avarageBet), "ether"));
    let calcMintedToken = Number(web3.utils.fromWei(String(data.calcMintedToken), "ether"));
    let winPool = Number(web3.utils.fromWei(String(data.winPool), "ether"));
    let avarageBetWin = Number(web3.utils.fromWei(String(data.avarageBetWin), "ether"));
    let premimWin = Number(web3.utils.fromWei(String(data.premimWin), "ether"));

    let getData = {
        "select": [
            "publicEvents/finalAnswerNumber",
            "publicEvents/premium",
            "publicEvents/mintedTokens",
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
    let mintedToken = getPlayers.data[0]['publicEvents/mintedTokens'] == undefined ? 0 : getPlayers.data[0]['publicEvents/mintedTokens'];

    for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i]['publicActivites/answer'] != finalAnswer) {
            // calc winner
            let x = {
                "_id": allPlayers[i]["_id"],
                mintedToken: mintedToken > 0 ? (calcMintedToken * allPlayers[i]['publicActivites/amount']) / (avarageBet * allPlayers.length) : 0,
                payToken: 0,
                premiumToken: 0
            }
            allData.push(x)
        } else {
            // calc loser
            let x = {
                "_id": allPlayers[i]["_id"],
                mintedToken: mintedToken > 0 ? (calcMintedToken * allPlayers[i]['publicActivites/amount']) / (avarageBet * allPlayers.length) : 0,
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
    setToDB
}