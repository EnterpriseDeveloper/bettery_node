const PlayerPaymentContract = require("../abi/PlayerPayment.json");
const ContractInit = require("../contractInit");
const axios = require("axios");
const url = require("../../config/path");

const payToLosers = async (data) => {
    console.log("from payToLosers")
    console.log(data);
    let id = data.id;
    let avarageBet = data.avarageBet;
    let calcMintedToken = data.calcMintedToken;

    // TODO add prodaction 
    let path = "test" // process.env.NODE_ENV
    let contract = await ContractInit.init(path, PlayerPaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).estimateGas();
        await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).send({
            gas: gasEstimate,
            gasPrice: 0
        });

//        await setToDB(id, avarageBet, calcMintedToken);

    } catch (err) {
        console.log("err from pay to losers", err)
    }
}

const setToDB = async (id, avarageBet, calcMintedToken) => {
    let getData = {
        "select": [
            "publicEvents/finalAnswerNumber",
            {
                "publicEvents/parcipiantsAnswer":
                    ["publicActivites/amount", "publicActivites/answer", "publicActivites/from"]
            }
        ], "from": Number(id)
    }

    let getPlayers = await axios.post(`${url.path}/query`, getData).catch((err) => {
        console.log("DB error from payToLosers: " + err.response.data.message)
        return;
    })
    // TODO

    let finalAnswer = getPlayers.data[0]['publicEvents/parcipiantsAnswer'];

    //    let mintLost = (calcMintedToken * eventsData.getPlayerTokens(_id, i, z)) / (avarageBet * eventsData.getActivePlayers(_id));
}

module.exports = {
    payToLosers
}