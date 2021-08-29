const { RpcClient } = require('tendermint');
import { demon, testDemon } from "../config/key";

function loadHandler() {
    const demonPath = process.env.NODE_ENV == "production" ? demon : testDemon;
    let client = RpcClient(`ws://${demonPath}:26657/websocket`)
    privEvents(client);
    pubEvents(client);

}

function pubEvents(client: any) {
    // calculate expert
    client.subscribe({ "query": "pub.event.calculateExpert = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents reverted", err)
        }
        console.log("test pub event calculate expert")
        console.log(event);

    })

    // lets finish event
    client.subscribe({ "query": "pub.event.letFinishEvent = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents reverted", err)
        }
        console.log("test pub event calculate expert")
        console.log(event);

    })

    // reverted event
    client.subscribe({ "query": "pub.event.reverted = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents reverted", err)
        }
        console.log("test pub event reverted")
        console.log(event);

    })
    // finished event
    client.subscribe({ "query": "pub.event.finished = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents finished", err)
        }
        console.log("test pub event finished")
        console.log(event);

    })
}

function privEvents(client: any) {
    client.subscribe({ "query": "priv.event.finish = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvent", err)
        }
        console.log("test pub event")
        console.log(event);

    })
}

export {
    loadHandler
}
