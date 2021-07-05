import getRoom from './getRoom';
import roomEvent from './roomEvent';
import room from './createRoom';
import notification from './notification';
import checkToken from '../../middlewares/check-token';


export = (app: any) => {
    app.get("/room/get_by_user_id", checkToken, async (req: any, res: any) => {
        getRoom.getByUserId(req, res);
    })
    app.post("/room/validation", checkToken, async (req: any, res: any) => {
        getRoom.roomValidation(req, res);
    })
    app.post("/room/get_event_by_room_id", async (req: any, res: any) => {
        roomEvent.getEventByRoomId(req, res);
    })
    app.post("/room/info", async (req: any, res: any) => {
        roomEvent.roomInfo(req, res);
    })
    app.get("/room/get_all", async (req: any, res: any) => {
        getRoom.getAllRooms(req, res);
    })
    app.post("/room/join", checkToken, async (req: any, res: any) => {
        room.joinToRoom(req, res);
    })
    app.post("/room/leave", checkToken, async (req: any, res: any) => {
        room.leaveRoom(req, res);
    })
    app.post("/room/notification", checkToken, async (req: any, res: any) => {
        notification.subscribeToNotification(req, res);
    })
    app.get("/room/joined", checkToken, async (req: any, res: any) => {
        getRoom.getJoinedRoom(req, res);
    })
    app.get("/notification/get_by_user_id", checkToken, (req: any, res: any) => {
        notification.getNotificationByUserId(req, res);
    })
    app.post("/notification/read", checkToken, async (req: any, res: any) => {
        notification.readNotification(req, res);
    })
    app.post("/notification/delete", checkToken, async (req: any, res: any) => {
        notification.deleteNotifications(req, res);
    })
}
