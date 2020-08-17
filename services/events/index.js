const publicEvents = require("./publicEvents");
const privateEvents = require("./privateEvents");
const hashtags = require("./hashtags");
const invites = require("./invites");
const answer = require("./answers");
const deleteEvent = require("./deleteEvent");

module.exports = app => {
    app.post("/publicEvents/set", async (req, res) => {
        publicEvents.setQuestion(req, res);
    })

    app.get("/publicEvents/createId", async (req, res) => {
        publicEvents.createId(req, res);
    })

    app.post("/publicEvents/get_by_id", async (req, res) => {
        publicEvents.getById(req, res);
    })

    app.get("/publicEvents/get_all_private", async (req, res) => {
        publicEvents.getAll(req, res);
    })

    app.get("/privateEvents/createId", async (req, res) => {
        privateEvents.createId(req, res);
    })

    app.post("/privateEvents/createEvent", async (req, res) => {
        privateEvents.createPrivateEvent(req, res);
    })

    app.get("/hashtags/get_all", async (req, res) => {
        hashtags.getAllHashtags(req, res);
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

    app.post("/delete_event_id", async (req, res) => {
        deleteEvent.deleteEventID(req, res);
    })
}