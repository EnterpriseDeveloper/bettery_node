const PlayerPaymentContract = require("../abi/PlayerPayment.json");
const ContractInit = require("../contractInit");
const axios = require("axios");
const url = require("../../config/path");
const _ = require("lodash");
const Web3 = require("web3");
const getNonce = require("../nonce/nonce");
const statuses = require("./status");

const payToRefferers = async (data) => {
    console.log("from payToRefferers")
    console.log(data);

    let id = data.id;
    let status = await statuses.getStatus(id);
    console.log(status)
    if(status == "payToLosers"){
        await statuses.setStatus(id, "payToRefferers");
        let path = process.env.NODE_ENV
        let contract = await ContractInit.init(path, PlayerPaymentContract);
        let getPlayers = await fetchDataFromDb(id);
    
        let mintedTokens = Number(getPlayers.data[0]["publicEvents/mintedTokens"]);
        let players = getPlayers.data[0]["publicEvents/parcipiantsAnswer"];
        const ref = letFindAllRef(players);
        let refAmount = getRefAmount(ref);
        let contrPercet = await getPercentFromContract(contract)
        let allData = calcTokens(ref, refAmount, mintedTokens, contrPercet);
        let fakeAddr = await contract.methods.fakeAddr().call();
        let { payRefAddr, payRefAmount, payComp } = getRefStruct(allData, fakeAddr, refAmount, mintedTokens, contrPercet);
    
        try {
            let gasEstimate = await contract.methods.payToReff(
                id,
                payRefAddr[0],
                payRefAmount[0],
                payRefAddr[1],
                payRefAmount[1],
                payRefAddr[2],
                payRefAmount[2],
                payComp
            ).estimateGas();
            let nonce = await getNonce.getNonce();
            await contract.methods.payToReff(
                id,
                payRefAddr[0],
                payRefAmount[0],
                payRefAddr[1],
                payRefAmount[1],
                payRefAddr[2],
                payRefAmount[2],
                payComp
            ).send({
                gas: gasEstimate * 2,
                gasPrice: 0,
                nonce: nonce
            });
    
            // TODO add to db ref payments
        } catch (err) {
            console.log("err from pay to pay to refferers", err)
        }
    }else{
        console.log("Duplicate from payToRefferers")
    }
   
}

const fetchDataFromDb = async (id) => {
    let fetchData = {
        "select": [
            "mintedTokens",
            {
                "publicEvents/parcipiantsAnswer": [
                    {
                        "publicActivites/from": [
                            {
                                "users/invitedBy": [
                                    "users/wallet",
                                    {
                                        "users/invitedBy": [
                                            "users/wallet",
                                            { "users/invitedBy": ["_id", "users/wallet"] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "from": Number(id)
    }

    return await axios.post(`${url.path}/query`, fetchData).catch((err) => {
        console.log("DB error from query payToRefferers: " + err.response.data.message)
        return;
    })
}

const letFindAllRef = (players) => {
    let allData = [];
    for (let i = 0; i < players.length; i++) {
        // find L1
        if (players[i]['publicActivites/from']['users/invitedBy']) {
            let walletRef = players[i]['publicActivites/from']['users/invitedBy']['users/wallet']
            let findRef = _.findIndex(allData, (x) => { return x.wallet == walletRef && x.level == 0 })
            if (findRef == -1) {
                allData.push({
                    wallet: walletRef,
                    amount: 1,
                    level: 0
                })
            } else {
                allData[findRef].amount++;
            }
            //  find L2
            if (players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']) {
                let walletRef = players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']['users/wallet']
                let findRef = _.findIndex(allData, (x) => { return x.wallet == walletRef && x.level == 1 })
                if (findRef == -1) {
                    allData.push({
                        wallet: walletRef,
                        amount: 1,
                        level: 1
                    })
                } else {
                    allData[findRef].amount++;
                }

                // find L3
                if (players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']['users/invitedBy']) {
                    let walletRef = players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']['users/invitedBy']['users/wallet']
                    let findRef = _.findIndex(allData, (x) => { return x.wallet == walletRef && x.level == 2 })
                    if (findRef == -1) {
                        allData.push({
                            wallet: walletRef,
                            amount: 1,
                            level: 2
                        })
                    } else {
                        allData[findRef].amount++;
                    }
                }
            }
        }
    }
    return allData;
}

const getRefAmount = (allData) => {
    let ref1 = 0, ref2 = 0, ref3 = 0, refAmount = [];
    for (let i = 0; i < allData.length; i++) {
        if (allData[i].level == 0) {
            ref1 = ref1 + allData[i].amount;
        }
        if (allData[i].level == 1) {
            ref2 = ref2 + allData[i].amount;
        }
        if (allData[i].level == 2) {
            ref3 = ref3 + allData[i].amount;
        }
    }
    refAmount[0] = ref1;
    refAmount[1] = ref2;
    refAmount[2] = ref3;
    return refAmount;
}

const calcTokens = (allData, refAmount, mintedTokens, percent) => {
    return allData.map((x) => {
        return {
            ...x,
            tokens: (percent[x.level] * mintedTokens / 100) * x.amount / refAmount[x.level]
        }
    })
}

const getPercentFromContract = async (contract) => {
    let percent = [];
    percent[0] = Number(await contract.methods.firstRefer().call());
    percent[1] = Number(await contract.methods.secontRefer().call());
    percent[2] = Number(await contract.methods.thirdRefer().call());
    return percent;
}

const getRefStruct = (allData, fakeAddr, refAmount, mintedTokens, contrPercet) => {
    let web3 = new Web3();
    let payRefAddr = [[], [], []];
    let payRefAmount = [[], [], []];
    let payComp = 0;
    if (refAmount[0] > 0) {
        for (let i = 0; i < allData.length; i++) {
            if (allData[i].level == 0) {
                payRefAddr[0].push(allData[i].wallet);
                payRefAmount[0].push(web3.utils.toWei(String(allData[i].tokens), "ether"))
            }
        }
        if (refAmount[1] > 0) {
            for (let i = 0; i < allData.length; i++) {
                if (allData[i].level == 1) {
                    payRefAddr[1].push(allData[i].wallet);
                    payRefAmount[1].push(web3.utils.toWei(String(allData[i].tokens), "ether"))
                }
            }
            if (refAmount[2] > 100) {
                for (let i = 0; i < allData.length; i++) {
                    if (allData[i].level == 2) {
                        payRefAddr[2].push(allData[i].wallet);
                        payRefAmount[2].push(web3.utils.toWei(String(allData[i].tokens), "ether"))
                    }
                }
            } else {
                payRefAddr[2][0] = fakeAddr;
                payRefAmount[2][0] = '0';
                payComp = web3.utils.toWei(String((contrPercet[2]) * mintedTokens / 100), "ether");
            }
        } else {
            payRefAddr[1][0] = fakeAddr;
            payRefAddr[2][0] = fakeAddr;
            payRefAmount[1][0] = '0';
            payRefAmount[2][0] = '0';
            payComp = web3.utils.toWei(String((contrPercet[1] + contrPercet[2]) * mintedTokens / 100), "ether");
        }

    } else {
        payRefAddr[0][0] = fakeAddr;
        payRefAddr[1][0] = fakeAddr;
        payRefAddr[2][0] = fakeAddr;
        payRefAmount[0][0] = '0';
        payRefAmount[1][0] = '0';
        payRefAmount[2][0] = '0';
        payComp = web3.utils.toWei(String((contrPercet[0] + contrPercet[1] + contrPercet[2]) * mintedTokens / 100), "ether");
    }

    return { payRefAddr, payRefAmount, payComp }
}

module.exports = {
    payToRefferers
}