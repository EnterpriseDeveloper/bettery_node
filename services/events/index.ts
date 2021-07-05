import publicEvents from "./publicEvents";
import privateEvents from "./privateEvents";
import hashtags from "./hashtags";
import publicActivites from "./publicActivites";
import eventLimitPrivate from '../../middlewares/eventLimitsPrivate'
import eventLimitPublic from '../../middlewares/eventLimitsPublic'
import revert from "./revert";
import contract from "../../contract-services/publicEvents/findCorrectAnswer"
import checkToken from '../../middlewares/check-token'

module.exports = (app: any) => {
    app.post("/publicEvents/createEvent", checkToken, eventLimitPublic, async (req: any, res: any) => {
        publicEvents.createEvent(req, res);
    })

    app.post("/publicEvents/get_by_id", async (req: any, res: any) => {
        publicEvents.getById(req, res);
    })

    app.post("/publicEvents/get_all", async (req: any, res: any) => {
        publicEvents.getAll(req, res);
    })

    app.get("/publicEvents/get_all_for_test", async (req: any, res: any) => {
        publicEvents.getAllForTest(req, res);
    })

    app.post("/publicEvents/participate", checkToken, async (req: any, res: any) => {
        publicActivites.participate(req, res);
    })

    app.post("/publicEvents/validate", checkToken, async (req: any, res: any) => {
        publicActivites.validate(req, res);
    })

    app.post("/privateEvents/createEvent", checkToken, eventLimitPrivate, async (req: any, res: any) => {
        privateEvents.createPrivateEvent(req, res);
    })

    app.post("/privateEvents/get_by_id", async (req: any, res: any) => {
        privateEvents.getById(req, res);
    })
    app.post("/privateEvents/participate", checkToken, async (req: any, res: any) => {
        privateEvents.participate(req, res);
    })
    app.post("/privateEvents/validate", checkToken, async (req: any, res: any) => {
        privateEvents.validate(req, res);
    })

    app.get("/hashtags/get_all", async (req: any, res: any) => {
        hashtags.getAllHashtags(req, res);
    })

    app.post("/publicEvents/revert", async (req: any, res: any) => {
        revert.getEventData(req, res);
    })

    app.post("/bettery_event", async (req: any, res: any) => {
        publicEvents.getBetteryEvent(req, res)
    })

    app.post("/public_event/finishEvent", async (req: any, res: any) => {
        let id = req.body.id
        let data = {
            id: id
        }

        await contract.findCorrectAnswer(data);
        res.status(200);
        res.send({ status: "OK" });
    })
}
