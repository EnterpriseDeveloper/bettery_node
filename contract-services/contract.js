const Web3 = require('web3');
const Quize = require('./Quize.json');
const setAnswer = require("../services/event_is_finish");
const history = require("../services/history");
const onHoldHistory = require("../services/historyMoney");
const { readFileSync } = require('fs')
const path = require('path')

class Contract {
    async loadContract() {
        await this._createWebInstance()
        return await this._createContractInstance();
    }

    async loadHandlerContract() {
        await this._createWebInstance()
        await this.eventHandler();
    }

    async _createWebInstance() {
        this.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ws-mumbai.matic.today'));
        let privateKey = readFileSync(path.join(__dirname, './privateKey'), 'utf-8')
        const prKey = this.web3.eth.accounts.privateKeyToAccount('0x' + privateKey);

        await this.web3.eth.accounts.wallet.add(prKey);
        let accounts = await this.web3.eth.accounts.wallet;
        this.account = accounts[0].address;
        return this.account;
    }

    _getCurrentNetwork() {
        return '80001'
    }

    getAccount(){
        return this.account;
    }

    async _createContractInstance() {
        const networkId = this._getCurrentNetwork()
        this.currentNetwork = Quize.networks[networkId]
        if (!this.currentNetwork) {
            throw Error('Contract not deployed on DAppChain')
        }

        const ABI = Quize.abi
        return new this.web3.eth.Contract(ABI, this.currentNetwork.address, {
            from: this.account
        })
    }

    async eventHandler() {
        let QuizeInstance = await this._createContractInstance();
        QuizeInstance.events.eventIsFinish(async (err, event) => {
            if (err) {
                console.error('Error eventIsFinish', err)
            } else {
                let eventId = event.returnValues.question_id;
                let ether = event.returnValues.payEther;
                let eventData = await QuizeInstance.methods.getQuestion(Number(eventId)).call();
                // set to Db
                setAnswer.setCorrectAnswer(eventData, eventId);

                setTimeout(() => {
                    history.setReceiveHistory(eventData, eventId, ether);
                }, 5000)

            }
        })

        QuizeInstance.events.payEvent(async (err, event) => {
            if (err) {
                console.error('Error payEvent', err)
            } else {
                let eventData = event.returnValues;
                onHoldHistory.setHistoryMoney(eventData);
            }
        })

        QuizeInstance.events.revertedEvent(async (err, event) => {
            if (err) {
                console.error('Error payEvent', err)
            } else {
                let eventData = event.returnValues;
                console.log("REVERT EVENT WORK");
                console.log(eventData)
                onHoldHistory.setRevertedHistoryMoney(eventData);
            }
        })
    }

}

module.exports = {
    Contract
}
