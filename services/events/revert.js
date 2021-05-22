const contractInit = require("../../contract-services/contractInit");
const MPContr = require("../../contract-services/abi/MiddlePayment.json");
const axios = require("axios");
const url = require("../../config/path");
const getNonce = require("../../contract-services/nonce/nonce");

const getEventData = async (req, res) =>{
    let id = Number(req.body.id);
    let purpose = req.body.purpose;

    let config = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*"] }
        ],
        "from": id
    }

    let data = await axios.post(`${url.path}/query`, config).catch((err) => {
        console.log(err);
        return;
    })

    console.log(data.data[0])

    if (data.data.length != 0) {
        if(data.data[0]['publicEvents/status'].search('finished') != -1){
            res.status(400);
            res.send({"status": "already finished"});
        }else if(data.data[0]['publicEvents/status'].search("reverted") != -1){
            res.status(400);
            res.send({"status": "already reverted"});
        }else{
            let partic = data.data[0]['publicEvents/parcipiantsAnswer']
            await revertEvent(id, partic, purpose);
            res.status(200);
            res.send({"status": "done"});
        }
    }else{
        res.status(400);
        res.send({"status": "event not found"});
    }
}

const revertEvent = async (eventId, participant, purpose) => {
    let revert = [{
        "_id": eventId,
        "status": `reverted: ${purpose}`,
        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
    }]

    await axios.post(`${url.path}/transact`, revert).catch((err) => {
        console.log(err);
        return;
    })

    if (participant !== undefined) {
        let path = process.env.NODE_ENV
        let betteryContract = await contractInit.init(path, MPContr)
        try {
            const gasEstimate = await betteryContract.methods.revertedPayment(eventId, purpose).estimateGas();
            let nonce = await getNonce.getNonce();
            await betteryContract.methods.revertedPayment(eventId, purpose).send({
                gas: gasEstimate * 2,
                gasPrice: 0,
                nonce: nonce
            });
        } catch (err) {
            console.log("error from refund Bot")
            console.log(err)
        }
    }
}

module.exports = {
    getEventData,
    revertEvent
}