var express = require('express');
var bodyParser = require('body-parser')
var app = express();
const fs = require('fs');
const refundBot = require('./bot/refundBot');
const loadContractHandler = require("./contract-services/eventHandler");

const multer = require('multer');
const upload = multer();

var http = require('http');
var https = require('https');

let key = process.env.NODE_ENV == "production" ? "./keys/key.pem" : "/home/ubuntu/node/keys/server.key",
    cert = process.env.NODE_ENV == "production" ? "./keys/star_bettery_io.crt" : "/home/ubuntu/node/keys/13_229_200_135.crt",
    ca1 = process.env.NODE_ENV == "production" ? "./keys/DigiCertCA.crt" : '/home/ubuntu/node/keys/AAACertificateServices.crt',
    ca2 = process.env.NODE_ENV == "production" ? "./keys/My_CA_Bundle.crt" : '/home/ubuntu/node/keys/SectigoRSADomainValidationSecureServerCA.crt',
    ca3 = process.env.NODE_ENV == "production" ? "./keys/TrustedRoot.crt" : '/home/ubuntu/node/keys/USERTrustRSAAAACA.crt';

var credentials = {
    key: fs.readFileSync(key, 'utf8'),
    cert: fs.readFileSync(cert, 'utf8'),
    ca: [
        fs.readFileSync(ca1, 'utf8'),
        fs.readFileSync(ca2, 'utf8'),
        fs.readFileSync(ca3, 'utf8')
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

httpsServer.listen(443);
httpServer.listen(80, async () => {
    await loadContractHandler.loadHandler();
    setInterval(() => {
        refundBot.refundBot();
    }, 1000 * 60 * 60 * 24 * 3);

    console.log("server run port 80");

});

