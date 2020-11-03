const getComments = require('./getComments');
const createComments = require('./createComments');

module.exports = io => {
    io.on('connection', (socket) => {
        socket.on('get comments', async (eventId) => {
            socket.join(eventId);
            io.to(eventId).emit('resieve comments', await getComments.getAllCommentsById(eventId));
        });

        socket.on('create comment', async (msg) => {
            let eventId = msg.eventId
            socket.join(eventId);
            await createComments.createComment(msg)
            io.to(eventId).emit('resieve comments', await getComments.getAllCommentsById(eventId));
        })

        socket.on("smile activites", async (msg) => {

        });
        socket.on("angry activites", async (msg) => {

        });
        socket.on("star activites", async (msg) => {

        });
        socket.on("wink activites", async (msg) => {

        });
    });

}