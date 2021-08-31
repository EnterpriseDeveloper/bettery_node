import PublicEventContract from "./abi/PublicEvents.json";
import MiddlePaymentContract from "./abi/MiddlePayment.json";
import PlayerPaymentContract from "./abi/PlayerPayment.json";

import { webSoketInit, connectToNetwork } from "./contractInit";
//import { expertCalc } from './oracels/exprestCalc';
import { eventEnd } from "../services/events/event_is_finish";
import {
    findCorrectAnswer,
    payToCompanies,
    payToExperts,
    payToHost,
    payToLosers,
    payToPlayers,
    payToRefferers,
    reverted
} from "./publicEvents/index";
import { setToDB } from "./publicEvents/playerPayment/setPaymentToDB";
import Web3 from "web3";

let hasProviderEnded = false;

const loadHandler = async () => {
    let path = process.env.NODE_ENV
    let { provider, networkId } = webSoketInit(path);
    let web3 = new Web3(provider)
    let publicEvent = await connectToNetwork(provider, networkId, PublicEventContract, path);
    publicEventsHandler(publicEvent);
    let mpEvent = await connectToNetwork(provider, networkId, MiddlePaymentContract, path);
    MiddlePayment(mpEvent);
    let ppEvent = await connectToNetwork(provider, networkId, PlayerPaymentContract, path);
    PlayerPayment(ppEvent);
    hasProviderEnded = false;
    provider.on('error', (e: void) => {
        errorDebug('!!!!WS ERROR!!!!', e)
    });
    provider.on('end', (e: void) => {
        console.log('!!!!WS CLOSE!!!!');
        if (hasProviderEnded) return;
        hasProviderEnded = true;
        provider.reset();
        provider.removeAllListeners("connect");
        provider.removeAllListeners("error");
        provider.removeAllListeners("end");
        setTimeout(() => {
            console.log("RELOAD: ", Math.floor(new Date().getTime() / 1000.0))
            loadHandler();
        }, 1000);
    });
}

const publicEventsHandler = (publicEvent: any) => {
    // publicEvent.events.calculateExpert(async (err: any, event: any) => {
    //     if (err) {
    //         errorDebug('Error from calculate expert events', err)
    //     } else {
    //         console.log("event calculateExpert work")
    //         expertCalc(event.returnValues);
    //     }
    // })

    publicEvent.events.findCorrectAnswer(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find сorrect answer events', err)
        } else {
            findCorrectAnswer(event.returnValues);
        }
    })

    publicEvent.events.revertedEvent(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from reverted event', err)
        } else {
            console.log("event revertedEvent work")
            reverted(event.returnValues)
        }
    })


}

const MiddlePayment = async (middlePayment: any) => {
    middlePayment.events.payToCompanies(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to companies events', err)
        } else {
            payToCompanies(event.returnValues);
        }
    })

    middlePayment.events.payToHost(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to host events', err)
        } else {
            payToHost(event.returnValues);
        }
    })

    middlePayment.events.payToExperts(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to expert events', err)
        } else {
            payToExperts(event.returnValues);
        }
    })

    middlePayment.events.payToPlayers(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to players events', err)
        } else {
            payToPlayers(event.returnValues);
        }
    })

    middlePayment.events.revertedEvent(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from reverted event', err)
        } else {
            console.log("event revertedEvent work")
            reverted(event.returnValues)
        }
    })
}

const PlayerPayment = async (playerPayment: any) => {
    playerPayment.events.payToLosers(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to losers events', err)
        } else {
            payToLosers(event.returnValues);
        }
    })

    playerPayment.events.payToRefferers(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to refferers events', err)
        } else {
            payToRefferers(event.returnValues);
        }
    })

    playerPayment.events.eventFinish(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from event finish event', err)
        } else {
            console.log("event finish work")
            await setToDB(event.returnValues);
            eventEnd(event.returnValues);
        }
    })

    playerPayment.events.eventMintedFinish(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from event finish event', err)
        } else {
            console.log("event minted finish work")
            eventEnd(event.returnValues);
        }
    })
}

const errorDebug = (from: any, err: any) => {
    let error = String(err);
    if (error.search("close code `1006`") == -1) {
        console.log(from, err);
    }
}

export {
    loadHandler
}