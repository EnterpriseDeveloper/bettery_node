const PublicEventContract = require("./abi/PublicEvent.json");
const ContractInit = require("./contractInit.js");
const ExpertsCalcOracle = require('./oracels/exprestCalc');
const TokenCalcOracle = require('./oracels/tokensCalc');


const loadHandler = async () => {
    let publicEvent = await ContractInit.init(process.env.NODE_ENV, PublicEventContract);
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