const Web3 = require('web3');
const { readFileSync } = require('fs');
const path = require('path');

const Quize = require('./abi/Quize.json');
const BetteryToken = require("./abi/BetteryToken.json");

const setAnswer = require("../services/events/event_is_finish");
const history = require("../services/history/history");
const onHoldHistory = require("../services/history/historyMoney");

const networkConfig = require("../config/networks");

class Contract {
    constructor() {
        this.provider = networkConfig.maticMumbai;
    }
    async loadContract() {
        await this.connectToNetwork(this.provider)
        return await this._createContractInstance();
    }

    async loadHandlerContract() {
        await this.connectToNetwork(this.provider)
        await this.eventHandler();
    }

    async connectToNetwork(provider) {
        this.web3 = new Web3(provider);
        let privateKey = readFileSync(path.join(__dirname, './privateKey'), 'utf-8')
        const prKey = this.web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
        await this.web3.eth.accounts.wallet.add(prKey);
        let accounts = await this.web3.eth.accounts.wallet;
        this.account = accounts[0].address;
        return { web3: this.web3, account: this.account };
    }

    async betteryToken() {
        let { web3, account } = await this.connectToNetwork(this.provider);
        let networkId = networkConfig.maticId;
        let abi = BetteryToken.abi;
        let address = BetteryToken.networks[networkId].address;
        return new web3.eth.Contract(abi, address, { from: account });
    }

    getAccount() {
        return this.account;
    }

    async _createContractInstance() {
        const networkId = networkConfig.maticId
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
                console.log(eventData);
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
