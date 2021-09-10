import axios from "axios";
import {path} from "../config/path";
import Web3 from "web3";

// let fakeData = {
//         TxResult: {
//             height: '670502',
//             tx: 'CpoCCnYKOy9Wb3Jvc2hpbG92TWF4LmJldHRlcnkucHVibGljZXZlbnRzLk1zZ0NyZWF0ZUZpaGlzaFB1YkV2ZW50EjcKLWNvc21vczE1cXMydHU5OTkzeGUybjI2bnZ3MDBtbTN1bnV4MzY2NWV5bmVndBC5gICAgIBgEp8BY2VpbGluZyBtaWxsaW9uIGVjb2xvZ3kgYnJvbnplIGVzdGF0ZSBhY3RyZXNzIHRhbGsgY2FyZ28gZmV3IHN0YW1wIHN0ZWFrIGZvc3RlciB2ZXNzZWwgZXhjdXNlIG91dGRvb3IgbWFpZCBkZXNlcnQgdXN1YWwgc2xvdCB0b2dldGhlciBtb2JpbGUgYWxsZXkgc2lnaHQgaGFtbWVyElkKUQpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQIQ7oOs3jQICeN+gVLvDbHpovDMe7aBtxlEdJgWwQvWmhIECgIIARiuARIEEMCEPRpACFlVXQ0SC4QEAHfQCq6QNLMtq3purCxgGS/nxIGU3icZgIuDogq/XY1PDtZgj1MiMKm586EuBR708g9ROymw2A==',
//             result: {
//                 data: 'CiAKFENyZWF0ZUZpaGlzaFB1YkV2ZW50EggIuYCAgICAYA==',
//                 log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"CreateFihishPubEvent"},{"key":"sender","value":"cosmos1ch9mdxl5nh0kx8yursdhz7ew84fwp4e37r9p7e"},{"key":"sender","value":"cosmos1ch9mdxl5nh0kx8yursdhz7ew84fwp4e37r9p7e"},{"key":"sender","value":"cosmos1ch9mdxl5nh0kx8yursdhz7ew84fwp4e37r9p7e"}]},{"type":"pub.event","attributes":[{"key":"finished","value":"true"},{"key":"minted","value":"false"},{"key":"id","value":"422212465066041"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"cosmos1e5c0j2uh56qesguwxptq99flm0zrkkvppmgmgt"},{"key":"sender","value":"cosmos1ch9mdxl5nh0kx8yursdhz7ew84fwp4e37r9p7e"},{"key":"amount","value":"80000000000000000bet"},{"key":"recipient","value":"cosmos1jpealvn5weclseydk9s8dg9r4luav822z3k6v4"},{"key":"sender","value":"cosmos1ch9mdxl5nh0kx8yursdhz7ew84fwp4e37r9p7e"},{"key":"amount","value":"120000000000000000bet"},{"key":"recipient","value":"cosmos1e5c0j2uh56qesguwxptq99flm0zrkkvppmgmgt"},{"key":"sender","value":"cosmos1ch9mdxl5nh0kx8yursdhz7ew84fwp4e37r9p7e"},{"key":"amount","value":"2800000000000000000bet"}]}]}]',
//                 gas_wanted: '1000000',
//                 gas_used: '560780',
//                 events: [Array]
//             }
//         }
//     }

//     let fakeDB = [
//         {
//             "_id": 422212465066041,
//             "publicEvents/host": {
//                 "_id": 351843720888324,
//                 "users/wallet": "cosmos1e5c0j2uh56qesguwxptq99flm0zrkkvppmgmgt"
//             },
//             "publicEvents/parcipiantsAnswer": [
//                 {
//                     "_id": 369435906932933,
//                     "publicActivites/amount": 1,
//                     "publicActivites/from": {
//                         "_id": 351843720888325,
//                         "users/wallet": "cosmos198ut9jtl5s9lyz9ndc90h3cj7z2xl6fumkqkhd"
//                     }
//                 },
//                 {
//                     "_id": 369435906932935,
//                     "publicActivites/amount": 1,
//                     "publicActivites/from": {
//                         "_id": 351843720888322,
//                         "users/wallet": "cosmos1fdjjfaj5ecevrqm4q6xs0ehmqgvgdzcywd3t2e"
//                     }
//                 }
//             ],
//             "publicEvents/validatorsAnswer": [
//                 {
//                     "_id": 369435906932940,
//                     "publicActivites/from": {
//                         "_id": 351843720888320,
//                         "users/wallet": "cosmos1jpealvn5weclseydk9s8dg9r4luav822z3k6v4"
//                     }
//                 }
//             ]
//         }
// ]

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
            "from": eventId //! 422212465066041
        }
        let dataFromDb: any = await axios.post(`${path}/query`, params).catch(err => {
            console.error("DB error in 'usersPayment': " + err.response.data.message)
            return
        })

        // dataFromDb.data = fakeDB

        let participants = dataFromDb.data[0]['publicEvents/parcipiantsAnswer'];
        let validators = dataFromDb.data[0]['publicEvents/validatorsAnswer'];
        let hostWallet = dataFromDb.data[0]['publicEvents/host']['users/wallet']

        dataForPayments = arrayRestructuring(dataForPayments) // ? ділю масив на подмасиви по 3

        if (isMinted == 'false') {
            console.log('not minted')
            let dataForSend: any;
            const partcPayment = preparationForSending(participants, dataForPayments, eventId, hostWallet);
            const validatorsPayment = preparationForSending(validators, dataForPayments, eventId, hostWallet);

            dataForSend = partcPayment.concat(validatorsPayment)

            const {isPartc, isValidators} = checkHost(participants, validators, hostWallet)
            console.log(isPartc.length, isValidators.length )

            if(!isPartc.length && !isValidators.length){
                let hostData = dataForPayments.filter((o: any)=>{return o[0].key == 'recipient' && o[0].value == hostWallet})
                let web3 = new Web3();
                dataForSend.push({
                    '_id': eventId,
                    'payHostAmount': web3.utils.fromWei(String(hostData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether'),
                })
            }
            console.log(dataForSend, 'dataForSend')
        }
        if (isMinted == 'true') {
            console.log('minted')
        }
    }


}

const findQuantity = (arr: any, wallet: string) => {
    let all = arr.filter((el: any) => {
        return el[0].key == 'recipient' && el[0].value == wallet
    })
    return all.length
}


let preparationForSending = (partc: any, data: any, eventId: any, hostWallet: string) => {
    let web3 = new Web3();

    let arr: any = []
    partc.map((el: any)=>{
        let wallet = el['publicActivites/from']['users/wallet']

        let howMany = findQuantity(data, wallet)
        let sortData = data.filter((o: any) =>{
            if(o[0].key == 'recipient' && o[0].value == wallet){
                return o
            }
        })

        if(howMany == 2){
            arr.push({
                '_id': Number(el._id),
                "mintedToken": 0,
                "payToken": web3.utils.fromWei(String(sortData[1][2].value.replace(/[a-zа-яё]/gi, '')), 'ether'),
                "premiumToken": 0 //todo premiumToken
            }, {
                '_id': Number(eventId),
                'payHostAmount': web3.utils.fromWei(String(sortData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether')
            })
        }

        if(howMany == 1 && wallet == hostWallet){
            arr.push({
                '_id': Number(eventId),
                'payHostAmount': web3.utils.fromWei(String(sortData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether')
            })
        }

        if(howMany == 1 && wallet != hostWallet){
            arr.push({
                '_id': Number(el._id),
                "mintedToken": 0,
                "payToken": web3.utils.fromWei(String(sortData[0][2].value.replace(/[a-zа-яё]/gi, '')), 'ether'),
                "premiumToken": 0 //todo premiumToke
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

// const letsMarkTheHost = (arr: any, wallet: string) => {
//
//     console.log(arr)
//
//     return arr.map((el: any) => {
//         if(el.key == 'recipient' && el.value == wallet){
//             el.host = true
//             return el
//         }else {
//             return el
//         }
//     })
// }

const checkHost = (partc: any, validators: any, hostWallet: any) => {
    let isPartc = partc.filter((el: any) => {
        return  el["publicActivites/from"]["users/wallet"] == hostWallet
    })
    let isValidators = validators.filter((el: any) => {
        return  el["publicActivites/from"]["users/wallet"] == hostWallet
    })

    return { isPartc, isValidators }
}

// usersPayment(fakeData)
export {
    usersPayment
}
