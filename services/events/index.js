const publicEvents = require("./publicEvents");
const privateEvents = require("./privateEvents");
const hashtags = require("./hashtags");
const publicActivites = require("./publicActivites");
const eventLimitPrivate = require('../../middlewares/eventLimitsPrivate')
const eventLimitPublic = require('../../middlewares/eventLimitsPublic')
const revert = require("./revert");

module.exports = app => {
    app.post("/publicEvents/createEvent", eventLimitPublic, async (req, res) => {
        publicEvents.createEvent(req, res);
    })

    app.post("/publicEvents/get_by_id", async (req, res) => {
        publicEvents.getById(req, res);
    })

    app.post("/publicEvents/get_all", async (req, res) => {
        publicEvents.getAll(req, res);
    })

    app.post("/publicEvents/participate", async (req, res) => {
        publicActivites.participate(req, res);
    })

    app.post("/publicEvents/validate", async (req, res) => {
        publicActivites.validate(req, res);
    })

    app.post("/privateEvents/createEvent", eventLimitPrivate, async (req, res) => {
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

    app.post("/publicEvents/revert", async (req, res) => {
        revert.getEventData(req, res);
    })

    app.post("/bettery_event", async (req, res) => {
        publicEvents.getBetteryEvent(req, res)
    })
}