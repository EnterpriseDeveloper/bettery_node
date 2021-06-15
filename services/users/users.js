
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

const additionalInfo = async (req, res) => {
    let conf = {
        "select": ["linkedAccounts", {
            "invitedBy":
                ["_id", "users/avatar", "users/nickName"]
        }],
        "from": Number(req.body.id)
    }

    let data = await axios.post(path.path + "/query", conf).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        return;
    })

    // TODO add location, language, share data, public/private email
    let x = data.data[0];
    let user = {
        linkedAccounts: x['linkedAccounts'] == undefined ? [] : x['linkedAccounts'],
        invitedBy: x["invitedBy"] == undefined ? null : {
            id: x["invitedBy"]["_id"],
            nickName: x["invitedBy"]["users/nickName"],
            avatar: x["invitedBy"]["users/avatar"]
        }
    }
    res.status(200);
    res.send(user);
}


module.exports = {
    allUsers,
    getUserById,
    additionalInfo
}