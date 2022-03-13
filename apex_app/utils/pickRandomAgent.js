const User = require('../models/userModel');

async function pickAgentId(reqSegmentId) {
    const users = await User.find( {role: "loanAgent", segments: reqSegmentId} )
    const randomNumber = Math.floor(Math.random() * users.length);
    const choice = users[randomNumber]._id.toString();
    return choice;
}

module.exports = pickAgentId