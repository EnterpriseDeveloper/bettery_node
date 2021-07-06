import express from 'express';
import bodyParser from 'body-parser'
const app = express();
import fs from 'fs';
import { refundBot } from './bot/refundBot';
import { loadHandler } from "./contract-services/eventHandler";
import { nonceInit } from "./contract-services/nonce/nonce";

var http = require('http');

if (process.env.NODE_TEST == 'false') {
    var https = require('https');

    let key = "./keys/key.pem",
        cert = "./keys/star_bettery_io.crt",
        ca1 = "./keys/DigiCertCA.crt",
        ca2 = "./keys/My_CA_Bundle.crt",
        ca3 = "./keys/TrustedRoot.crt";

    var credentials = {
        key: fs.readFileSync(key, 'utf8'),
        cert: fs.readFileSync(cert, 'utf8'),
        ca: [
            fs.readFileSync(ca1, 'utf8'),
            fs.readFileSync(ca2, 'utf8'),
            fs.readFileSync(ca3, 'utf8')
        ]
    };

    var httpsServer = https.createServer(credentials, app);
    var io = require('socket.io')(httpsServer);

    require('./services/comments')(io);

    httpsServer.listen(443);
}


var cors = require('cors');

app.use(cors({
    origin: "*"
}))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.text({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
var httpServer = http.createServer(app);

if (process.env.NODE_TEST != 'false') {
    var io = require('socket.io')(httpServer);
    require('./services/comments')(io);
}


require('./services/events')(app);
require('./services/funds')(app);
require('./services/users')(app);
require('./services/rooms')(app);
require('./services/subscribe')(app);
require('./services/image')(app);
require('./contract-services/tokensale')(app);

httpServer.listen(80, async () => {
    await nonceInit();
    await loadHandler();
    setInterval(() => {
        refundBot();
    }, 1000 * 60 * 60 * 24 * 3);

    console.log("server run port 80");
});

