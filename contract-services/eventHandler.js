const PublicEventContract = require("./abi/PublicEvents.json");
const ContractInit = require("./contractInit.js");
const ExpertsCalcOracle = require('./oracels/exprestCalc');
const setAnswer = require("../services/events/event_is_finish");


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
            console.log("event calculateExpert work")
            ExpertsCalcOracle.expertCalc(event.returnValues);
        }
    })

    publicEvent.events.revertedEvent(async (err, event) => {
        if (err) {
            console.error('Error from reverted event', err)
            restartHandler();
        } else {
            console.log("event revertedEvent work")
            // TODO 
        }
    })

    QuizeInstance.events.eventFinish(async (err, event) => {
        if (err) {
            console.error('Error from eventFinish event', err)
            restartHandler();
        } else {
            console.log("event finish work")
            setAnswer.setCorrectAnswer(event.returnValues);
            // TODO add calcalation of tokens
        }
    })
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