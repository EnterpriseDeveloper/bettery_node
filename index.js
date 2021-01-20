var express = require('express');
var bodyParser = require('body-parser')
var app = express();

const Contract = require("./contract-services/contract");
const setEthPrice = require("./services/funds/ethPrice");
const refundBot = require('./bot/refundBot');

const multer = require('multer');
const upload = multer();

var fs = require('fs');
var http = require('http');

var https = require('https');
var credentials = {

    key: fs.readFileSync("./keys/server.key"),

    // cert: fs.readFileSync("./keys/bettery.crt"),

    cert: fs.readFileSync("./keys/13_229_200_135.crt"),

    ca: [

        fs.readFileSync('./keys/AAACertificateServices.crt'),

        fs.readFileSync('./keys/SectigoRSADomainValidationSecureServerCA.crt'),

        fs.readFileSync('./keys/USERTrustRSAAAACA.crt')

    ]
};

var cors = require('cors');

app.use(cors({
    origin: "*"
}))
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
    extended: true
}));
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
var io = require('socket.io')(httpsServer);

require('./services/events')(app);
require('./services/funds')(app);
require('./services/history')(app);
require('./services/users')(app);
require('./services/rooms')(app);
require('./services/subscribe')(app);
require('./contract-services/tokensale')(app);
require('./services/comments')(io);

// app.get("/.well-known/pki-validation/39840D6583E10EEF80C3F7113D7FFEF6.txt", async (req, res) => {
//     fs.readFile('./keys/39840D6583E10EEF80C3F7113D7FFEF6.txt', (e, data) => {
//         if (e) throw e;
//         res.send(data);
//     });
// })

httpsServer.listen(443);

httpServer.listen(80, async () => {
    let contract = new Contract.Contract();
    contract.loadHandlerContract();
    setEthPrice.setEthPriceToContract();
    setInterval(() => {
        refundBot.refundBot();
    }, 1000 * 60 * 60 * 24 * 7);
    console.log("server run port 80");

});

