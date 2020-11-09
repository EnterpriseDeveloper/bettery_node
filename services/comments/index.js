const getComments = require('./getComments');
const createComments = require('./createComments');
const activities = require('./activities');

module.exports = io => {
    io.on('connection', (socket) => {
        socket.on('get comments', async (eventId) => {
            socket.join(eventId);
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        });

        socket.on('create comment', async (msg) => {
            let eventId = msg.eventId
            socket.join(eventId);
            await createComments.createComment(msg)
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        })

        socket.on("activities", async (msg) => {
            let eventId = msg.eventId
            socket.join(eventId);
            await activities.iconActivities(msg)
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        });

        socket.on("typing in", async (msg) =>{
            let eventId = msg.eventId
            socket.join(eventId);
            io.to(eventId).emit('typing out', msg.text);
        })

        socket.on("reply", async (msg) =>{
            let eventId = msg.eventId
            socket.join(eventId);
            await createComments.replyToComment(msg);
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        })
    });

}