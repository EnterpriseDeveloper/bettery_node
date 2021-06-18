const PublicEventContract = require("./abi/PublicEvents.json");
const MiddlePaymentContract = require("./abi/MiddlePayment.json");
const PlayerPaymentContract = require("./abi/PlayerPayment.json");

const ContractInit = require("./contractInit.js");
const ExpertsCalcOracle = require('./oracels/exprestCalc');
const setAnswer = require("../services/events/event_is_finish");
const publicEvents = require("./publicEvents/index");
const playPaymentSentToDB = require("./publicEvents/playerPayment/setPaymentToDB");

const loadHandler = async () => {
    let path = process.env.NODE_ENV
    let { provider, networkId } = ContractInit.webSoketInit();
    let publicEvent = await ContractInit.connectToNetwork(provider, networkId, PublicEventContract, path);
    publicEventsHandler(publicEvent);
    let mpEvent = await ContractInit.connectToNetwork(provider, networkId, MiddlePaymentContract, path);
    MiddlePayment(mpEvent);
    let ppEvent = await ContractInit.connectToNetwork(provider, networkId, PlayerPaymentContract, path);
    PlayerPayment(ppEvent);
    setTimeout(() => {
        provider.disconnect();
        console.log("Reconnect");
        loadHandler();
    }, 7 * 60 * 60 * 1000)

}

const publicEventsHandler = (publicEvent) => {
    publicEvent.events.calculateExpert(async (err, event) => {
        if (err) {
            console.error('Error from calculate expert events', err)
            //    retry(Date.now());
        } else {
            console.log("event calculateExpert work")
            ExpertsCalcOracle.expertCalc(event.returnValues);
        }
    })

    publicEvent.events.findCorrectAnswer(async (err, event) => {
        if (err) {
            console.error('Error from find сorrect answer events', err)
            //   retry(Date.now());
        } else {
            publicEvents.findCorrectAnswer.findCorrectAnswer(event.returnValues);
        }
    })

    publicEvent.events.revertedEvent(async (err, event) => {
        if (err) {
            console.error('Error from reverted event', err)
            //    retry(Date.now());
        } else {
            console.log("event revertedEvent work")
            publicEvents.reverted.reverted(event.returnValues)
        }
    })


}

const MiddlePayment = async (middlePayment) => {
    middlePayment.events.payToCompanies(async (err, event) => {
        if (err) {
            console.error('Error from find pay to companies events', err)
            //    retry(Date.now());
        } else {
            publicEvents.payToCompanies.payToCompanies(event.returnValues);
        }
    })

    middlePayment.events.payToHost(async (err, event) => {
        if (err) {
            console.error('Error from find pay to host events', err)
            //    retry(Date.now());
        } else {
            publicEvents.payToHost.payToHost(event.returnValues);
        }
    })

    middlePayment.events.payToExperts(async (err, event) => {
        if (err) {
            console.error('Error from find pay to expert events', err)
            //   retry(Date.now());
        } else {
            publicEvents.payToExperts.payToExperts(event.returnValues);
        }
    })

    middlePayment.events.payToPlayers(async (err, event) => {
        if (err) {
            console.error('Error from find pay to players events', err)
            //    retry(Date.now());
        } else {
            publicEvents.payToPlayers.payToPlayers(event.returnValues);
        }
    })

    middlePayment.events.revertedEvent(async (err, event) => {
        if (err) {
            console.error('Error from reverted event', err)
            //    retry(Date.now());
        } else {
            console.log("event revertedEvent work")
            publicEvents.reverted.reverted(event.returnValues)
        }
    })
}

const PlayerPayment = async (playerPayment) => {
    playerPayment.events.payToLosers(async (err, event) => {
        if (err) {
            console.error('Error from find pay to losers events', err)
            //    retry(Date.now());
        } else {
            publicEvents.payToLosers.payToLosers(event.returnValues);
        }
    })

    playerPayment.events.payToRefferers(async (err, event) => {
        if (err) {
            console.error('Error from find pay to refferers events', err)
            //    retry(Date.now());
        } else {
            publicEvents.payToRefferers.payToRefferers(event.returnValues);
        }
    })

    playerPayment.events.eventFinish(async (err, event) => {
        if (err) {
            console.error('Error from event finish event', err)
            //    retry(Date.now());
        } else {
            console.log("event finish work")
            await playPaymentSentToDB.setToDB(event.returnValues);
            setAnswer.eventEnd(event.returnValues);
        }
    })

    playerPayment.events.eventMintedFinish(async (err, event) => {
        if (err) {
            console.error('Error from event finish event', err)
            //    retry(Date.now());
        } else {
            console.log("event minted finish work")
            setAnswer.eventEnd(event.returnValues);
        }
    })
}


const retry = (date) => {
    setTimeout(async () => {
        console.log("RESTART EVENT HANDEL")
        await loadHandler()
    }, 1000)
}

module.exports = {
    loadHandler
}