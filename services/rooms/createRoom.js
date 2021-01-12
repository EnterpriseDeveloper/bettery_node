const createRoom = (data, type) =>{
    return newRoom = {
       _id: "room$newRoom",
       [type]: [data._id],
       name: data.roomName,
       image: data.roomImage,
       color: data.roomColor,
       owner: data.host
    }
}

module.exports = {
    createRoom
}