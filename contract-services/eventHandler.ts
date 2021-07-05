import PublicEventContract from "./abi/PublicEvents.json";
import MiddlePaymentContract from "./abi/MiddlePayment.json";
import PlayerPaymentContract from "./abi/PlayerPayment.json";

import ContractInit from "./contractInit";
import ExpertsCalcOracle from './oracels/exprestCalc';
import setAnswer from "../services/events/event_is_finish";
import publicEvents from "./publicEvents/index";
import playPaymentSentToDB from "./publicEvents/playerPayment/setPaymentToDB";
import Web3 from "web3";

let hasProviderEnded = false;

const loadHandler = async () => {
    let path = process.env.NODE_ENV
    let { provider, networkId } = ContractInit.webSoketInit(path);
    let web3 = new Web3(provider)
    let publicEvent = await ContractInit.connectToNetwork(provider, networkId, PublicEventContract, path);
    publicEventsHandler(publicEvent);
    let mpEvent = await ContractInit.connectToNetwork(provider, networkId, MiddlePaymentContract, path);
    MiddlePayment(mpEvent);
    let ppEvent = await ContractInit.connectToNetwork(provider, networkId, PlayerPaymentContract, path);
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

    // restar connection
    // setTimeout(() => {
    //     let interval = setInterval(() => {
    //         checkConnection(web3, interval)
    //     }, 1000)
    // }, 5000)
}

// const checkConnection = (provider, interval) => {
//     if (!provider.currentProvider.connected) {
//         console.log("RELOAD: ", Math.floor(new Date().getTime() / 1000.0))
//         clearInterval(interval);
//         loadHandler();
//         return;
//     } else {
//         return;
//     }
// }

const publicEventsHandler = (publicEvent: any) => {
    publicEvent.events.calculateExpert(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from calculate expert events', err)
        } else {
            console.log("event calculateExpert work")
            ExpertsCalcOracle.expertCalc(event.returnValues);
        }
    })

    publicEvent.events.findCorrectAnswer(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find сorrect answer events', err)
        } else {
            publicEvents.findCorrectAnswer.findCorrectAnswer(event.returnValues);
        }
    })

    publicEvent.events.revertedEvent(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from reverted event', err)
        } else {
            console.log("event revertedEvent work")
            publicEvents.reverted.reverted(event.returnValues)
        }
    })


}

const MiddlePayment = async (middlePayment: any) => {
    middlePayment.events.payToCompanies(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to companies events', err)
        } else {
            publicEvents.payToCompanies.payToCompanies(event.returnValues);
        }
    })

    middlePayment.events.payToHost(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to host events', err)
        } else {
            publicEvents.payToHost.payToHost(event.returnValues);
        }
    })

    middlePayment.events.payToExperts(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to expert events', err)
        } else {
            publicEvents.payToExperts.payToExperts(event.returnValues);
        }
    })

    middlePayment.events.payToPlayers(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to players events', err)
        } else {
            publicEvents.payToPlayers.payToPlayers(event.returnValues);
        }
    })

    middlePayment.events.revertedEvent(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from reverted event', err)
        } else {
            console.log("event revertedEvent work")
            publicEvents.reverted.reverted(event.returnValues)
        }
    })
}

const PlayerPayment = async (playerPayment: any) => {
    playerPayment.events.payToLosers(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to losers events', err)
        } else {
            publicEvents.payToLosers.payToLosers(event.returnValues);
        }
    })

    playerPayment.events.payToRefferers(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from find pay to refferers events', err)
        } else {
            publicEvents.payToRefferers.payToRefferers(event.returnValues);
        }
    })

    playerPayment.events.eventFinish(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from event finish event', err)
        } else {
            console.log("event finish work")
            await playPaymentSentToDB.setToDB(event.returnValues);
            setAnswer.eventEnd(event.returnValues);
        }
    })

    playerPayment.events.eventMintedFinish(async (err: any, event: any) => {
        if (err) {
            errorDebug('Error from event finish event', err)
        } else {
            console.log("event minted finish work")
            setAnswer.eventEnd(event.returnValues);
        }
    })
}

const errorDebug = (from: any, err: any) => {
    let error = String(err);
    if (error.search("close code `1006`") == -1) {
        console.log(from, err);
    }
}

export = {
    loadHandler
}