const publicEvents = require("./publicEvents");
const privateEvents = require("./privateEvents");
const hashtags = require("./hashtags");
const invites = require("./invites");
const answer = require("./answers");
const deleteEvent = require("./deleteEvent");
const eventLimitPrivate = require('../../middlewares/eventLimitsPrivate')
const eventLimitPublic = require('../../middlewares/eventLimitsPublic')

module.exports = app => {
    app.post("/publicEvents/set", async (req, res) => {
        publicEvents.setQuestion(req, res);
    })

    app.post("/publicEvents/createId", eventLimitPublic, async (req, res) => {
        publicEvents.createId(req, res);
    })

    app.post("/publicEvents/get_by_id", async (req, res) => {
        publicEvents.getById(req, res);
    })

    app.post("/publicEvents/get_all", async (req, res) => {
        publicEvents.getAll(req, res);
    })

    app.post("/privateEvents/createId", eventLimitPrivate, async (req, res) => {
        privateEvents.createId(req, res);
    })

    app.post("/privateEvents/createEvent", async (req, res) => {
        privateEvents.createPrivateEvent(req, res);
    })

    app.post("/privateEvents/get_by_id", async (req, res) => {
        privateEvents.getById(req, res);
    })
    app.post("/privateEvents/participate", async (req, res) => {
        privateEvents.participate(req, res);
    })
    app.post("/privateEvents/validate", async (req, res) => {
        privateEvents.validate(req, res);
    })

    app.get("/hashtags/get_all", async (req, res) => {
        hashtags.getAllHashtags(req, res);
    })

    app.post("/answer", async (req, res) => {
        answer.setAnswer(req, res)
    })

    app.post("/delete_event_id", async (req, res) => {
        deleteEvent.deleteEventID(req, res);
    })

    app.post("/bettery_event", async (req, res) => {
        publicEvents.getBetteryEvent(req, res)
    })
}