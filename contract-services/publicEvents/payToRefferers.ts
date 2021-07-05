import PlayerPaymentContract from "../abi/PlayerPayment.json";
import { init } from "../contractInit";
import axios from "axios";
import { path } from "../../config/path";
import Web3 from "web3";
import { getNonce } from "../nonce/nonce";
import getGasPrice from "../gasPrice/getGasPrice"
import { gasPercent } from "../../config/limits"

const payToRefferers = async (data: any) => {
    console.log("from payToRefferers")
    console.log(data);

    let id = data.id;
    let path = process.env.NODE_ENV
    let contract = await init(path, PlayerPaymentContract);
    let getPlayers: any = await fetchDataFromDb(id);

    let mintedTokens = Number(getPlayers.data[0]["mintedTokens"]);
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
            gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice.getGasPriceSafeLow(),
            nonce: await getNonce()
        });

        // TODO add to db ref payments
    } catch (err) {
        console.log("err from pay to pay to refferers", err)
    }
}

const fetchDataFromDb = async (id: any) => {
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

    return await axios.post(`${path}/query`, fetchData).catch((err) => {
        console.log("DB error from query payToRefferers: " + err.response.data.message)
        return;
    })
}

const letFindAllRef = (players: any) => {
    let allData = [];
    for (let i = 0; i < players.length; i++) {
        // find L1
        if (players[i]['publicActivites/from']['users/invitedBy']) {
            let walletRef = players[i]['publicActivites/from']['users/invitedBy']['users/wallet']
            let findRef = allData.findIndex((x) => { return x.wallet == walletRef && x.level == 0 })
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
                let findRef = allData.findIndex((x) => { return x.wallet == walletRef && x.level == 1 })
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
                    let findRef = allData.findIndex((x) => { return x.wallet == walletRef && x.level == 2 })
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

const getRefAmount = (allData: any) => {
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

const calcTokens = (allData: any, refAmount: any, mintedTokens: any, percent: any) => {
    return allData.map((x: any) => {
        return {
            ...x,
            tokens: (percent[x.level] * mintedTokens / 100) * x.amount / refAmount[x.level]
        }
    })
}

const getPercentFromContract = async (contract: any) => {
    let percent = [];
    percent[0] = Number(await contract.methods.firstRefer().call());
    percent[1] = Number(await contract.methods.secontRefer().call());
    percent[2] = Number(await contract.methods.thirdRefer().call());
    return percent;
}

const getRefStruct = (allData: any, fakeAddr: any, refAmount: any, mintedTokens: any, contrPercet: any) => {
    let web3 = new Web3();
    let payRefAddr: any[] = [[], [], []];
    let payRefAmount: any[] = [[], [], []];
    let payComp: any = 0;
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

export {
    payToRefferers
}