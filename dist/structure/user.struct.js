"use strict";
var userStructure = function (data) {
    return data.map(function (x) {
        return {
            _id: x["_id"],
            wallet: x["users/wallet"],
            nickName: x["users/nickName"],
            avatar: x["users/avatar"],
            email: x["users/email"],
            verifier: x["users/verifier"],
            linkedAccounts: x["users/linkedAccounts"] === undefined ? [] : x["users/linkedAccounts"]
        };
    });
};
module.exports = {
    userStructure: userStructure
};
