var express = require('express');
var bodyParser = require('body-parser')
var app = express();

const auth = require("./services/users");
const questions = require("./services/qestion");
const hashtags = require("./services/hashtags");
const myActivites = require("./services/myActivites");
const answer = require("./services/answers");
const Contract = require("./contract-services/contract");
const deleteEvent = require("./services/deleteEvent");
const invites = require("./services/invites")
const historyQuize = require("./services/historyQuize");
const setEthPrice = require("./services/ethPrice");

const test = require("./services/historyMoney");


const multer = require('multer');
const upload = multer();

var fs = require('fs');
var http = require('http');
var https = require('https');

// var credentials = {

//     key: fs.readFileSync("./keys/server.key"),

//     cert: fs.readFileSync("./keys/api_siawallet_io.crt"),

//     ca: [

//         fs.readFileSync('./keys/AddTrustExternalCARoot.crt'),

//         fs.readFileSync('./keys/SectigoRSADomainValidationSecureServerCA.crt'),

//         fs.readFileSync('./keys/USERTrustRSAAddTrustCA.crt')

//     ]
// };



var cors = require('cors');

app.use(cors({
    origin: "*"
}))
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.post("/user/validate", async (req, res) => {
    auth.validate(req, res);
})

app.post("/user/regist", async (req, res) => {
    auth.registration(req, res);
})

app.get("/user/all", async (req, res) => {
    auth.allUsers(req, res);
})

app.post("/user/loomWallet", async (req, res) => {
    auth.setLoomWallet(req, res);
})

app.post("/question/set", async (req, res) => {
    questions.setQuestion(req, res);
})

app.get("/question/createId", async (req, res) => {
    questions.createId(req, res);
})

app.post("/question/get_by_id", async (req, res) => {
    questions.getById(req, res);
})

app.get("/question/get_all_private", async (req, res) => {
    questions.getAll(req, res);
})

app.get("/hashtags/get_all", async (req, res) => {
    hashtags.getAllHashtags(req, res);
})

app.post("/my_activites/invites", async (req, res) => {
    myActivites.getAllInvites(req, res);
})

app.post("/my_activites/current", async (req, res) => {
    myActivites.getCurrentEvent(req, res);
})

app.post("/my_activites/past", async (req, res) => {
    myActivites.getPastEvent(req, res);
})


app.post("/invites/delete", async (req, res) => {
    invites.deleteInvitation(req, res);
})


app.post("/answer", async (req, res) => {
    answer.setAnswer(req, res)
})

app.post("/delete_event", async (req, res) => {
    deleteEvent.deleteEvent(req, res);
})

app.post("/history_quize/get_by_id", async (req, res) => {
    historyQuize.historyQuizeById(req, res);
})

app.get("/eth_price", async (req, res) => {
    setEthPrice.getEthPrice(req, res);
})


var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

//httpsServer.listen(443);

httpServer.listen(80, async () => {
    let contract = new Contract.Contract();
    contract.loadHandlerContract();

    setEthPrice.setEthPriceToContract();
    console.log("server run port 80")
});

