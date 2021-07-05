import getComments from './getComments';
import createComments from './createComments';
import activities from './activities';

module.exports = (io: any) => {
    io.on('connection', (socket: any) => {
        socket.on('get comments', async (eventId: any) => {
            socket.join(eventId);
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        });

        socket.on('create comment', async (msg: any) => {
            let eventId = msg.eventId
            socket.join(eventId);
            await createComments.createComment(msg)
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        })

        socket.on("activities", async (msg: any) => {
            let eventId = msg.eventId
            socket.join(eventId);
            await activities.iconActivities(msg)
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        });

        socket.on("typing in", async (msg: any) => {
            let eventId = msg.eventId
            socket.join(eventId);
            socket.broadcast.to(eventId).emit('typing out', msg.text);
        })

        socket.on("reply", async (msg: any) => {
            let eventId = msg.eventId
            socket.join(eventId);
            await createComments.replyToComment(msg);
            io.to(eventId).emit('receive comments', await getComments.getAllCommentsById(eventId));
        })
    });

}