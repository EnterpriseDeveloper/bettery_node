const getRoom = require('./getRoom');
const roomEvent = require('./roomEvent');
const room = require('./createRoom');
const notification = require('./notification');
const  checkToken  = require('../../middlewares/check-token');


module.exports = app => {
    app.get("/room/get_by_user_id", checkToken, async (req, res) => {
        getRoom.getByUserId(req, res);
    })
    app.post("/room/validation", checkToken, async (req, res) => {
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
    app.post("/room/join", checkToken, async (req, res) => {
        room.joinToRoom(req, res);
    })
    app.post("/room/leave", checkToken, async (req, res) => {
        room.leaveRoom(req, res);
    })
    app.post("/room/notification", checkToken, async (req, res) => {
        notification.subscribeToNotification(req, res);
    })
    app.get("/room/joined", checkToken, async (req, res) => {
        getRoom.getJoinedRoom(req, res);
    })
    app.get("/notification/get_by_user_id", checkToken, (req, res) => {
        notification.getNotificationByUserId(req, res);
    })
    app.post("/notification/read", checkToken, async (req, res) => {
        notification.readNotification(req, res);
    })
    app.post("/notification/delete", checkToken, async (req, res) => {
        notification.deleteNotifications(req, res);
    })
}
