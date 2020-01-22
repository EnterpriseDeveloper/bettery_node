const {
    Client, LocalAddress, CryptoUtils, LoomProvider
} = require('loom-js');
const BN = require('bn.js');
const Web3 = require('web3');
const Quize = require('./Quize.json');
const setAnswer = require("../services/event_is_finish");

class Contract {
    async loadContract() {
        this.onEvent = null
        this._createClient()
        this._createCurrentUserAddress()
        this._createWebInstance()
        await this._createContractInstance()
    }

    _createClient() {
        this.privateKey = CryptoUtils.generatePrivateKey();
        this.publicKey = CryptoUtils.publicKeyFromPrivateKey(this.privateKey);

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

    async _createContractInstance() {
        const networkId = await this._getCurrentNetwork()
        this.currentNetwork = Quize.networks[networkId]
        if (!this.currentNetwork) {
            throw Error('Contract not deployed on DAppChain')
        }

        const ABI = Quize.abi
        this.QuizeInstance = new this.web3.eth.Contract(ABI, this.currentNetwork.address, {
            from: this.currentUserAddress
        })

        this.QuizeInstance.events.eventIsFinish( async (err, event) => {
            if (err) console.error('Error on event', err)
            else {
                let eventId = event.returnValues.question_id;
                let eventData = await this.QuizeInstance.methods.getQuestion(Number(eventId)).call();
                console.log(eventData)
                // set to Db
                setAnswer.setCorrectAnswer(eventData, eventId);
            }
        })
    }

    _getCurrentNetwork() {
        return '9545242630824'
    }
}

module.exports = {
    Contract
}
