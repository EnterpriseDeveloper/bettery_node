import {connectToSign} from '../../contract-services/connectToChain'

const findCorrectAnswer = async (data: any) => {
    console.log("from findCorrectAnswer")
    console.log(data);
    let id = data.id
    let { memonic, address, client } = await connectToSign()

    const msg = {
        typeUrl: "/VoroshilovMax.bettery.publicevents.MsgCreateFihishPubEvent",
        value: {
            creator: address,
            pubId: id
        }
    };
    const fee = {
        amount: [],
        gas: "1000000",
    };

    console.log(msg)
    try{
        let tx =  await client.signAndBroadcast(address, [msg], fee, memonic);
        console.log(tx);
    }catch(err){
        console.log(err)
    }
}
setTimeout(()=>{
    findCorrectAnswer({id: 422212465065989})
},5000)



export {
    findCorrectAnswer
}