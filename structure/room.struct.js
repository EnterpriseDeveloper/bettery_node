const roomStruct = (data) => {
    return data.map((z) => {
        return {
            id: z["_id"],
            user: {
                id: z['room/owner']._id,
                nickName: z['room/owner']['users/nickName'],
                avatar: z['room/owner']['users/avatar']
            },
            name: z['room/name'],
            color: z['room/color'],
            privateEventsId: z['room/privateEventsId'] == undefined ? [] : z['room/privateEventsId'],
            publicEventsId: z['room/publicEventsId'] == undefined ? [] : z['room/publicEventsId']
        }
    })
}

module.exports = {
    roomStruct
}