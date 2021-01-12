const axios = require('axios');
const path = require('../../config/path');
const structure = require('../../structure/event.struct');

const getEventByRoomId = async (req, res) => {
    let id = req.body.id;
    let event = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "where": `publicEvents/room = ${Number(id)}`
    }

    const eventData = await axios.post(`${path.path}/query`, event).catch((err) => {
        res.status(404);
        res.send({ message: err });
        return;
    })

    let events = structure.publicEventStructure(eventData.data)
    res.status(200);
    res.send(events);
}

module.exports = {
    getEventByRoomId
}