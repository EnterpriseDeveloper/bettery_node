const userStructure = (data) => {
    return data.map((x) => {
        return {
            _id: x["_id"],
            wallet: x["users/wallet"],
            nickName: x["users/nickName"],
            avatar: x["users/avatar"],
            email: x["users/email"],
            verifier: x["users/verifier"],
            historyTransaction: x["historyTransactions"] === undefined ? [] : x["historyTransactions"].map((history) => {
                return {
                    id: history._id,
                    date: history['historyTransactions/date'],
                    paymentWay: history['historyTransactions/paymentWay'],
                    amount: history['historyTransactions/amount'],
                    role: history['historyTransactions/role'],
                    currencyType: history['historyTransactions/currencyType'],
                    eventId: history['historyTransactions/eventId'] === undefined ? "Deleted" : history['historyTransactions/eventId']["_id"]
                }
            })
        }
    })
}

module.exports = {
    userStructure
}