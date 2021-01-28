const getRoom = require('./getRoom');
const roomEvent = require('./roomEvent');
const room = require('./createRoom');
const notification = require('./notification');


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
    app.post("/room/join", async (req, res) => {
        room.joinToRoom(req, res);
    })
    app.post("/room/leave", async (req, res) => {
        room.leaveRoom(req, res);
    })
    app.post("/room/notification", async (req, res) => {
        notification.subscribeToNotification(req, res);
    })
    app.post("/room/joined", async (req, res) => {
        getRoom.getJoinedRoom(req, res);
    })
    app.post("/notification/get_by_user_id", (req, res) => {
        notification.getNotificationByUserId(req, res);
    })
    app.post("/notification/read", async (req, res) => {
        notification.readNotification(req, res);
    })
    app.post("/notification/delete", async (req, res) => {
        notification.deleteNotifications(req, res);
    })
}
