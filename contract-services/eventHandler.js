const PublicEventContract = require("./abi/PublicEvents.json");
const MiddlePaymentContract = require("./abi/MiddlePayment.json");
const PlayerPaymentContract = require("./abi/PlayerPayment.json");

const ContractInit = require("./contractInit.js");
const ExpertsCalcOracle = require('./oracels/exprestCalc');
const setAnswer = require("../services/events/event_is_finish");
const publicEvents = require("./publicEvents/index");
const playPaymentSentToDB = require("./publicEvents/playerPayment/setPaymentToDB");
const Web3 = require("web3");

let interval;

const loadHandler = async () => {
    let path = process.env.NODE_ENV
    let { provider, networkId } = ContractInit.webSoketInit();
    let web3 = new Web3(provider)
    let publicEvent = await ContractInit.connectToNetwork(provider, networkId, PublicEventContract, path);
    publicEventsHandler(publicEvent);
    let mpEvent = await ContractInit.connectToNetwork(provider, networkId, MiddlePaymentContract, path);
    MiddlePayment(mpEvent);
    let ppEvent = await ContractInit.connectToNetwork(provider, networkId, PlayerPaymentContract, path);
    PlayerPayment(ppEvent);

    // restar connection
    setTimeout(() => {
        interval = setInterval(() => {
            checkConnection(web3)
        }, 2000)
    }, 5000)
}

const checkConnection = (provider) => {
    if (!provider.currentProvider.connected) {
        console.log("RELOAD: ", Math.floor(new Date().getTime()/1000.0))
        clearInterval(interval);
        loadHandler();
    }
}

const publicEventsHandler = (publicEvent) => {
    publicEvent.events.calculateExpert(async (err, event) => {
        if (err) {
            console.error('Error from calculate expert events', err)
        } else {
            console.log("event calculateExpert work")
            ExpertsCalcOracle.expertCalc(event.returnValues);
        }
    })

    publicEvent.events.findCorrectAnswer(async (err, event) => {
        if (err) {
            console.error('Error from find сorrect answer events', err)
        } else {
            publicEvents.findCorrectAnswer.findCorrectAnswer(event.returnValues);
        }
    })

    publicEvent.events.revertedEvent(async (err, event) => {
        if (err) {
            console.error('Error from reverted event', err)
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
        } else {
            publicEvents.payToCompanies.payToCompanies(event.returnValues);
        }
    })

    middlePayment.events.payToHost(async (err, event) => {
        if (err) {
            console.error('Error from find pay to host events', err)
        } else {
            publicEvents.payToHost.payToHost(event.returnValues);
        }
    })

    middlePayment.events.payToExperts(async (err, event) => {
        if (err) {
            console.error('Error from find pay to expert events', err)
        } else {
            publicEvents.payToExperts.payToExperts(event.returnValues);
        }
    })

    middlePayment.events.payToPlayers(async (err, event) => {
        if (err) {
            console.error('Error from find pay to players events', err)
        } else {
            publicEvents.payToPlayers.payToPlayers(event.returnValues);
        }
    })

    middlePayment.events.revertedEvent(async (err, event) => {
        if (err) {
            console.error('Error from reverted event', err)
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
        } else {
            publicEvents.payToLosers.payToLosers(event.returnValues);
        }
    })

    playerPayment.events.payToRefferers(async (err, event) => {
        if (err) {
            console.error('Error from find pay to refferers events', err)
        } else {
            publicEvents.payToRefferers.payToRefferers(event.returnValues);
        }
    })

    playerPayment.events.eventFinish(async (err, event) => {
        if (err) {
            console.error('Error from event finish event', err)
        } else {
            console.log("event finish work")
            await playPaymentSentToDB.setToDB(event.returnValues);
            setAnswer.eventEnd(event.returnValues);
        }
    })

    playerPayment.events.eventMintedFinish(async (err, event) => {
        if (err) {
            console.error('Error from event finish event', err)
        } else {
            console.log("event minted finish work")
            setAnswer.eventEnd(event.returnValues);
        }
    })
}

module.exports = {
    loadHandler
}