const { RpcClient } = require('tendermint');
import { demon, testDemon } from "../config/key";
import {
    findCorrectAnswer,
    reverted,
    expertCalc,
} from "./publicEvents/index";

import { usersPayment } from '../contract-services/usersPayment'

function loadHandler() {
    const demonPath = process.env.NODE_ENV == "production" ? demon : testDemon;
    pubEventReverted(demonPath);
    pubLetsFinishEvent(demonPath);
    pubEventCalcExpert(demonPath);
    pubEventFinished(demonPath);
}

function pubEventReverted(demonPath: string) {
    let client = RpcClient(`ws://${demonPath}:26657/websocket`);
    client.subscribe({ "query": "pub.event.reverted = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents reverted", err)
        }
        let data = JSON.parse(event.TxResult.result.log)
        reverted(data[0]);
    })
}

function pubLetsFinishEvent(demonPath: string) {
    let client = RpcClient(`ws://${demonPath}:26657/websocket`);
    client.subscribe({ "query": "pub.event.letfinishevent = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents reverted", err)
        }
        let data = JSON.parse(event.TxResult.result.log)
        setTimeout(() => {
            findCorrectAnswer(data[0]);
        }, 5000)
    })
}

function pubEventCalcExpert(demonPath: string) {
    let client = RpcClient(`ws://${demonPath}:26657/websocket`);
    client.subscribe({ "query": "pub.event.calculateExpert = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents reverted", err)
        }
        let data = JSON.parse(event.TxResult.result.log)
        expertCalc(data[0])
    })
}

async function pubEventFinished(demonPath: string) {
    let client = RpcClient(`ws://${demonPath}:26657/websocket`);
    client.subscribe({ "query": "pub.event.finished = \'true\'" }, (event: any, err: any) => {
        if (err) {
            console.log("pubEvents finished", err)
        }
        console.log("test pub event finished")
        console.log(event)

        usersPayment(event)
    })
}

// TODO think about error handler
function errHandler(client: any) {
    client.status('error', (err: any) => {
        if (String(err).search("websocket disconnected") != -1 ||
            String(err).search("subscription was cancelled") != -1 ||
            String(err).search("connect ECONNREFUSED") != -1) {
            setTimeout(() => {
                console.log("RELOAD: ", Math.floor(new Date().getTime() / 1000.0))
                loadHandler();
            }, 1000);
        } else {
            console.log(err);
        }
    })
}

export {
    loadHandler
}
