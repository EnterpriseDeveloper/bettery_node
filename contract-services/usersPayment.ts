import axios from "axios";
import {path} from "../config/path";
import Web3 from "web3";

const usersPayment = async (data: any) => {

    let {eventId, isMinted, dataForPayments} = getNeededData(data)

    if (eventId) {
        let params = {
            "select": [
                "publicEvents/host", {"publicEvents/host": ["users/wallet"]},
                "publicEvents/validatorsAnswer",
                {
                    "publicEvents/validatorsAnswer":
                        ["publicActivites/from", {"publicActivites/from": ["users/wallet"]}]
                },
                "publicEvents/parcipiantsAnswer", {"publicEvents/parcipiantsAnswer": ["publicActivites/amount", "publicActivites/from", {"publicActivites/from": ["users/wallet"]}]}

            ],
            "from": Number(eventId) //! 422212465065992
        }

        console.log(eventId, 'eventId')
        let dataFromDb: any = await axios.post(`${path}/query`, params).catch(err => {
            console.error("DB error in 'usersPayment': " + err.response.data.message)
            return
        })

        let participants = dataFromDb.data[0]['publicEvents/parcipiantsAnswer']; //? === all participants
        let validators = dataFromDb.data[0]['publicEvents/validatorsAnswer']; //? === all validators
        let hostWallet = dataFromDb.data[0]['publicEvents/host']['users/wallet'] //? === host wallet

        dataForPayments = arrayRestructuring(dataForPayments) // ? make[] = [[],[],[]]

        let dataForSend: any;

        const partcPayment = testSending(participants, dataForPayments, eventId, hostWallet, isMinted)
        const validatorsPayment = testSending(validators, dataForPayments, eventId, hostWallet, isMinted)

        dataForSend = partcPayment.concat(validatorsPayment)

        const {isPartc, isValidators} = checkHost(participants, validators, hostWallet)

        if (!isPartc.length && !isValidators.length) {
            let hostData = dataForPayments.filter((o: any) => {
                return o[0].key == 'recipient' && o[0].value == hostWallet
            })
            let web3 = new Web3();
            dataForSend.push({
                '_id': Number(eventId),
                'payHostAmount': web3.utils.fromWei(String(hostData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether'),
            })
        }
        sendToDB(dataForSend)
    }


}

const findQuantity = (arr: any, wallet: string) => {
    let all = arr.filter((el: any) => {
        return el[0].key == 'recipient' && el[0].value == wallet
    })
    return all.length
}

const testSending = (partc: any, data: any, eventId: any, hostWallet: string, isMinted: string) => {
    let web3 = new Web3();
    let arr: any = []
    // todo sort only winner
    partc.map((el: any) => {
        let wallet = el['publicActivites/from']['users/wallet']
        let amount = el['publicActivites/amount']

        let howMany = findQuantity(data, wallet)
        let sortData = data.filter((o: any) => {
            if (o[0].key == 'recipient' && o[0].value == wallet) {
                return o
            }
        })

        if (wallet == hostWallet) {
            let pay1: any, pay0: any
            let minted: any = undefined


            if (isMinted == 'true') {
                console.log('isMinted true')
                // pay1 = sortData[1] == undefined ? undefined : web3.utils.fromWei(String(sortData[2][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
                // pay0 = sortData[0] == undefined ? undefined : web3.utils.fromWei(String(sortData[1][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
                // minted = sortData[0] == undefined ? undefined : web3.utils.fromWei(String(sortData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
            }
            if (isMinted == 'false') {
                console.log('isMinted false')
                pay1 = sortData[1] == undefined ? undefined : web3.utils.fromWei(String(sortData[1][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
                pay0 = sortData[0] == undefined ? undefined : web3.utils.fromWei(String(sortData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
            }


            if (pay1 == undefined) {
                arr.push({
                    '_id': Number(eventId),
                    'payHostAmount': pay0
                })
            }
            if (pay1 !== undefined && pay0 !== undefined) {
                let payToken = pay1
                let payHost = pay0
                arr.push({
                    '_id': Number(el._id),
                    "mintedToken": 0,
                    "payToken": payToken,
                    "premiumToken": 0 //todo premiumToken
                }, {
                    '_id': Number(eventId),
                    'payHostAmount': payHost
                })
            }
        }

        if (wallet !== hostWallet) {
            let pay1: any, minted: any
            if (isMinted == 'false') {
                pay1 = sortData[0] == undefined ? 0 : web3.utils.fromWei(String(sortData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
                minted = false
            }
            if(isMinted == 'true'){
                minted = sortData[0] == undefined ? 0 : web3.utils.fromWei(String(sortData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
                pay1 = sortData[0] == undefined ? 0 : web3.utils.fromWei(String(sortData[1][2].value.replace(/[a-zа-яё]/gi, '')), 'ether');
            }
            arr.push({
                '_id': Number(el._id),
                "mintedToken": minted ? minted : 0,
                "payToken": pay1,
                "premiumToken": 0 //todo premiumToken
            })
        }
    })
    return arr
}

const getNeededData = (data: any) => {
    let walletList = JSON.parse(data.TxResult.result.log)

    let eventDetails: any = walletList[0].events.find((x: any) => {
        return x['type'] == "pub.event"
    });
    const eventId = eventDetails["attributes"].find((y: any) => {
        return y['key'] == 'id'
    })['value']
    const isMinted = eventDetails["attributes"].find((x: any) => {
        return x['key'] == 'minted'
    })['value']

    let dataForPayments = walletList[0].events.find((x: any) => {
        return x.type == "transfer"
    })["attributes"]

    return {
        eventId,
        isMinted,
        dataForPayments
    }
}

const sendToDB = (params: any) => {
    console.log(params, 'dataForSend')
    // axios.post(path + '/transact', params).catch(err => {
    //     console.log('error in usersPayment: ' + err.response.statusText)
    // })
    console.log("usersPayment: data sent successfully")
}

const arrayRestructuring = (arr: Array<any>) => {
    let size = 3;
    let subarray = [];

    for (let i = 0; i < Math.ceil(arr.length / size); i++) {
        subarray[i] = arr.slice((i * size), (i * size) + size);
    }

    return subarray;
}


const checkHost = (partc: any, validators: any, hostWallet: any) => {
    let isPartc = partc.filter((el: any) => {
        return el["publicActivites/from"]["users/wallet"] == hostWallet
    })
    let isValidators = validators.filter((el: any) => {
        return el["publicActivites/from"]["users/wallet"] == hostWallet
    })

    return {isPartc, isValidators}
}

export {
    usersPayment
}
