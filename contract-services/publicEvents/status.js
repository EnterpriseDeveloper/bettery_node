const axios = require("axios");
const path = require("../../config/path");

const getStatus = async (id) => {
    const query = {
        "select": ["publicEvents/status"],
        "from": Number(id)
    }

    let data = await axios.post(`${path.path}/query`, query).catch((err) => {
        console.log("get status err", err)
        return
    })
    return data.data[0]['publicEvents/status'];
}

const setStatus = async (id, status) => {
    const query = [{
        _id: Number(id),
        status: status
    }]

    return await axios.post(`${path.path}/transact`, query).catch((err)=>{
        console.log("set status err", err)
        return;
    })
}

module.exports = {
    getStatus,
    setStatus
}