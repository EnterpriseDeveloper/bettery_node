const getRoom = require('./getRoom');


module.exports = app => {
    app.post("/room/get_by_user_id", async (req, res) =>{
        getRoom.getByUserId(req, res)
    })
    app.post("/room/validation", async (req, res) =>{
        getRoom.roomValidation(req, res)
    })
}