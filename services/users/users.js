
const axios = require("axios");
const path = require("../../config/path");
const structure = require('../../structure/user.struct')

const getUserById = (req, res) => {
    let conf = {
        "select": ["*",
            { "historyTransactions": ["*"] }
        ],
        "from": Number(req.body.id)
    }

    axios.post(path.path + "/query", conf).then((x) => {
        if (x.data.length != 0) {
            let o = structure.userStructure([x.data[0]])

            res.status(200);
            res.send(o);

        } else {
            res.status(400);
            res.send("user do not exist");
        }
    }).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err);
    })
}

const allUsers = (req, res) => {

    let conf = {
        "select": ["*",
            { "historyTransactions": ["*"] }
        ],
        "from": "users"
    }

    axios.post(path.path + "/query", conf).then((o) => {
        let result = structure.userStructure(o.data);

        res.status(200);
        res.send(result);
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}


module.exports = {
    allUsers,
    getUserById
}