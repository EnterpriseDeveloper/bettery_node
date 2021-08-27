const { RpcClient } = require('tendermint');
import { demon, testDemon } from "../config/key";

function loadHandler(){
    const demonPath = process.env.NODE_ENV == "production" ? demon : testDemon;
    let client = RpcClient(`ws://${demonPath}:26657/websocket`)
    privEvents(client);
    pubEvents(client);

}

function pubEvents(client: any) {
    // reverted event
    client.subscribe({ "query": "priv.event.reverted = \'true\'" }, (event: any, err: any) => {
        if(err){
            console.log("pubEvents reverted", err)
        }
        console.log("test pub event reverted")
        console.log(event);
    
    })
    // finished event
    client.subscribe({ "query": "priv.event.finished = \'true\'" }, (event: any, err: any) => {
        if(err){
            console.log("pubEvents finished", err)
        }
        console.log("test pub event finished")
        console.log(event);
    
    })
}

function privEvents(client: any) {
    client.subscribe({ "query": "priv.event.finish = \'true\'" }, (event: any, err: any) => {
        if(err){
            console.log("pubEvent", err)
        }
        console.log("test pub event")
        console.log(event);
    
    })
}

export {
    loadHandler
}
