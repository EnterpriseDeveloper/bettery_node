const axios = require("axios");
const path = require("../config/path");

const setInitWithd = (req, res) => {
    let data = [{
        "_id": "withdrawal$newWithdrawal",
        "userId": req.body.userId,
        "date": Math.floor(Date.now() / 1000),
        "transactionHash": req.body.transactionHash,
        "status": "pending",
        "amount": req.body.amount,
        "coinType": req.body.coinType
    }]
    axios.post(path.path + "/transact", data).then(() => {
        res.status(200);
        res.send({ "status": "done" })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const runBotWithdrawal = () => {
    let data = {
        "select": ["*"],
        "from": ["withdrawal/status", "pending"]
    }
    axios.post(path.path + "/query", data).then((x) => {
        console.log(x.data)
    }).catch((err) => {
        console.log(err)
    })

    // console.log(hash)
    // await this.PromiseTimeout(360000);
    // //Wait for 6 mins till the checkpoint is submitted, then run the confirm withdraw
    // this.matic
    //     .withdraw(hash, {
    //         from
    //     })
    //     .then(async logs => {
    //         console.log("Withdraw on Ropsten" + logs.transactionHash);
    //         // action on Transaction success
    //         // Withdraw process is completed, funds will be transfer to your account after challege period is over.
    //         await this.PromiseTimeout(10000);
    //         token = this.Ropsten_Erc20Address;
    //         this.matic
    //             .processExits(token, {
    //                 from
    //             })
    //             .then(logs => {
    //                 console.log(
    //                     "Process Exit on Ropsten:" + logs.transactionHash
    //                 )
    //                 return;
    //             });
    //     });
}

module.exports = {
    setInitWithd,
    runBotWithdrawal
}