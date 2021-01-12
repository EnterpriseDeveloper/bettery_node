const getRoom = require('./getRoom');
const roomEvent = require('./roomEvent');


module.exports = app => {
    app.post("/room/get_by_user_id", async (req, res) => {
        getRoom.getByUserId(req, res);
    })
    app.post("/room/validation", async (req, res) => {
        getRoom.roomValidation(req, res);
    })
    app.post("/room/get_event_by_room_id", async (req, res) => {
        roomEvent.getEventByRoomId(req, res);
    })
    app.post("/room/info", async (req, res) => {
        roomEvent.roomInfo(req, res);
    })
    app.get("/room/get_all", async (req, res) => {
        getRoom.getAllRooms(req, res);
    })
}