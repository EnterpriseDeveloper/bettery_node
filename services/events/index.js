const questions = require("./qestion");
const hashtags = require("./hashtags");
const invites = require("./invites");
const answer = require("./answers");
const deleteEvent = require("./deleteEvent");

module.exports = app => {
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