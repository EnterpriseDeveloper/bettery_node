const PublicEventContract = require("./abi/PublicEvents.json");
const ContractInit = require("./contractInit.js");
const ExpertsCalcOracle = require('./oracels/exprestCalc');
const TokenCalcOracle = require('./oracels/tokensCalc');

// TODO
const setAnswer = require("../services/events/event_is_finish");
const history = require("../services/history/history");
const onHoldHistory = require("../services/history/historyMoney");


const loadHandler = async () => {
    let publicEvent = await ContractInit.webSoketInit(process.env.NODE_ENV, PublicEventContract);
    publicEventsHandler(publicEvent);
}

const publicEventsHandler = (publicEvent) => {
    publicEvent.events.calculateExpert(async (err, event) => {
        if (err) {
            console.error('Error from calculate expert events', err)
            restartHandler();
        } else {
            ExpertsCalcOracle.expertCalc(event.returnValues);
        }
    })

    publicEvent.events.calculateTokensAmount(async (err, event) => {
        if (err) {
            console.error('Error from calculate calculate tokens amount', err)
            restartHandler();
        } else {
            TokenCalcOracle.tokensAmountCalc(event.returnValues);
        }
    })

    publicEvent.events.revertedEvent(async (err, event) => {
        if (err) {
            console.error('Error from reverted event', err)
            restartHandler();
        } else {
            TokenCalcOracle.tokensAmountCalc(event.returnValues);
        }
    })

    // TODO
    // QuizeInstance.events.eventIsFinish(async (err, event) => {
    //     if (err) {
    //         console.error('Error eventIsFinish', err)
    //         setTimeout(async () => {
    //             console.log("RESTART EVENT HANDEL")
    //             await this.loadHandlerContract()
    //         }, 3000)
    //     } else {
    //         console.log("EVENT IS finish work")
    //         console.log(event.returnValues)
    //         let eventId = event.returnValues.question_id;
    //         let ether = event.returnValues.payEther;
    //         let eventData = await QuizeInstance.methods.getQuestion(Number(eventId)).call();
    //         console.log(eventData);
    //         // set to Db
    //         setAnswer.setCorrectAnswer(eventData, eventId);

    //         // TO DO
    //         // setTimeout(() => {
    //         //     history.setReceiveHistory(eventData, eventId, ether);
    //         // }, 5000)

    //     }
    // })

    // QuizeInstance.events.payEvent(async (err, event) => {
    //     if (err) {
    //         console.error('Error payEvent', err)
    //     } else {
    //         let eventData = event.returnValues;
    //         console.log(eventData);
    //         onHoldHistory.setHistoryMoney(eventData);
    //     }
    // })

    // QuizeInstance.events.revertedEvent(async (err, event) => {
    //     if (err) {
    //         console.error('Error revertedEvent', err)
    //     } else {
    //         let eventData = event.returnValues;
    //         onHoldHistory.setRevertedHistoryMoney(eventData);
    //     }
    // })

}


const restartHandler = () => {
    setTimeout(async () => {
        console.log("RESTART EVENT HANDEL")
        await this.loadHandler()
    }, 3000)
}

module.exports = {
    loadHandler
}