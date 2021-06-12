const axios = require('axios');

const linkAccount = async (req, res) => {
    // TODO
    let primaryUserId = req.body.userId;
    let primaryToken = req.body.primaryToken;
    let secondToken = req.body.secondToken;
    let data = await axios.post(`https://bettery.us.auth0.com/api/v2/users/${primaryUserId}/identities`,
        { "link_with": secondToken },
        {
            headers: { 'Authorization': `Bearer ${primaryToken}` }
        })

    console.log(data);    

}

module.exports = {
    linkAccount
}

