var express = require('express');
var bodyParser = require('body-parser')
var app = express();

const Contract = require("./contract-services/contract");
const setEthPrice = require("./services/funds/ethPrice");
const withdrawal = require("./services/funds/withdrawal");

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

require('./services/events')(app);
require('./services/funds')(app);
require('./services/history')(app);
require('./services/users')(app);

var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

//httpsServer.listen(443);

httpServer.listen(80, async () => {
   let contract = new Contract.Contract();
   contract.loadHandlerContract();

    setEthPrice.setEthPriceToContract();
  //  withdrawal.runBotWithdrawal();
    console.log("server run port 80");

});

