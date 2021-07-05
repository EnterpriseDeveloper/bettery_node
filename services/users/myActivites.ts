import axios from "axios";
import path from "../../config/path";
import structure from '../../structure/event.struct';
import filterData from '../../helpers/filter';
import additionalData from '../../helpers/additionalData';

const getAllUserEvents = async (req: any, res: any) => {
    let eventData: any[] = [];
    let from = req.body.from;
    let to = req.body.to;
    let search = req.body.search != undefined ? req.body.search : '';
    let userId = req.body.userId;
    let finished = req.body.finished;

    let config = {
        select: [
            {
                "users/publicActivites": ["*", {
                    'publicActivites/eventId': ["*",
                        { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/host': ["*"] },
                        { 'publicEvents/room': ["*"] }]
                }]
            },
            {
                "users/hostPublicEvents": ["*",
                    { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                    { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                    { 'publicEvents/host': ["*"] },
                    { 'publicEvents/room': ["*"] }]
            }
        ],
        from: userId
    }

    let allData: any = await axios.post(path.path + "/query", config).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err.response.data.message);
    })
    let data = allData.data[0];
    if (data['users/publicActivites'] == undefined && data['users/hostPublicEvents'] == undefined) {
        res.status(200);
        res.send({
            allAmountEvents: 0,
            amount: 0,
            events: []
        });
    } else {
        if (data['users/publicActivites'] != undefined) {
            data['users/publicActivites'].forEach((x: any) => {
                if (x['publicActivites/eventId'] != undefined) {
                    eventData.push(x['publicActivites/eventId']);
                }
            })
        }
        if (data['users/hostPublicEvents'] != undefined) {
            data['users/hostPublicEvents'].forEach((x: any) => {
                eventData.push(x);
            })
        }

        let unique = eventData.filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i)
        let obj = structure.publicEventStructure(unique);
        let dataEvetns = search.length >= 1 ? filterData.searchData(obj, search) : obj;
        if (!finished) {
            dataEvetns = dataEvetns.filter((e: any) => { return e.finalAnswer === null })
        }
        let events = {
            allAmountEvents: obj.length,
            amount: dataEvetns.length,
            events: await additionalData.getAdditionalData(dataEvetns.slice(from, to), res)
        }
        res.status(200)
        res.send(events)
    }
}


export = {
    getAllUserEvents
}

