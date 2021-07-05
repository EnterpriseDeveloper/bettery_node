import axios from "axios";
import path from "../config/path";

const getAdditionalData = async (events: any, res: any) => {
    for (let i = 0; i < events.length; i++) {
        // get last comment
        let confComment = {
            "select": ["comments/comment", "comments/date"],
            "where": `comments/publicEventsId = ${Number(events[i].id)}`,
            "opts": {"orderBy": ["DESC", "comments/date"] }
        }
        let comments: any = await axios.post(path.path + "/query", confComment)
            .catch((err) => {
                console.log("DB error: " + err.response)
                res.status(400);
                res.send(err.response);
                return;
            })

        events[i].commentsAmount = comments.data.length
        if (comments.data.length != 0) {
            events[i].lastComment = comments.data[0]['comments/comment'];
        } else {
            events[i].lastComment = "null";
        }
    }

    return events;
}

export = {
    getAdditionalData
}