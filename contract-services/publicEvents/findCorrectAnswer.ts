import {connectToSign} from '../../contract-services/connectToChain'
let send: number = 0;

const findCorrectAnswer = async (data: any) => {
    console.log("from findCorrectAnswer")
    let eventData = data.events.find((x: any)=>{return x.type == "pub.event"})
    console.log(eventData);
    let id = eventData.attributes.find((x: any)=>{return x.key == "id"})
    if(Number(id.value) != send){
        sendToBlockChain(Number(id.value))
    }
}

const sendToBlockChain = async (id: number) =>{
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
    try{
        let tx =  await client.signAndBroadcast(address, [msg], fee, memonic);
        console.log(tx);
    }catch(err){
        console.log(err)
    }
}
// setTimeout(()=>{
//     sendToBlockChain(422212465065991)
// },5000)



export {
    findCorrectAnswer
}