const {
    Client, LocalAddress, CryptoUtils, LoomProvider
} = require('loom-js');
const BN = require('bn.js');
const Web3 = require('web3');
const Quize = require('./Quize.json');
const setAnswer = require("../services/event_is_finish");
const history = require("../services/history");
const onHoldHistory = require("../services/historyMoney");
const { readFileSync } = require('fs')
const path = require('path')

class Contract {
    async loadContract() {
        this._createClient()
        this._createCurrentUserAddress()
        this._createWebInstance()
        return await this._createContractInstance();
    }

    async loadHandlerContract() {
        this._createClient()
        this._createCurrentUserAddress()
        this._createWebInstance()
        await this.eventHandler();
    }

    _createClient() {
        const privateKeyStr = readFileSync(path.join(__dirname, './private_key'), 'utf-8')
        this.privateKey = CryptoUtils.B64ToUint8Array(privateKeyStr)
        this.publicKey = CryptoUtils.publicKeyFromPrivateKey(this.privateKey)

        let writeUrl = 'wss://extdev-plasma-us1.dappchains.com/websocket';
        let readUrl = 'wss://extdev-plasma-us1.dappchains.com/queryws';
        let networkId = 'extdev-plasma-us1';

        this.client = new Client(networkId, writeUrl, readUrl)

        this.client.on('error', msg => {
            console.error('Error on connect to client', msg)
            console.warn('Please verify if loom command is running')
        })
    }

    _createCurrentUserAddress() {
        this.currentUserAddress = LocalAddress.fromPublicKey(this.publicKey).toString()
    }

    _createWebInstance() {
        this.web3 = new Web3(new LoomProvider(this.client, this.privateKey))
    }

    _getCurrentNetwork() {
        return '9545242630824'
    }

    async _createContractInstance() {
        const networkId = await this._getCurrentNetwork()
        this.currentNetwork = Quize.networks[networkId]
        if (!this.currentNetwork) {
            throw Error('Contract not deployed on DAppChain')
        }

        const ABI = Quize.abi
        return new this.web3.eth.Contract(ABI, this.currentNetwork.address, {
            from: this.currentUserAddress
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
                console.log(eventData)
                console.log("FINISH EVENT WORK")
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
                console.log("PAY EVENT WORK")
                let eventData = event.returnValues;
                onHoldHistory.setHistoryMoney(eventData);
            }
        })
    }

}

module.exports = {
    Contract
}
