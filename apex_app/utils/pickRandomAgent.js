const User = require('../models/userModel');

async function pickAgentId(segmentId) {
    console.log(segmentId);
    const users = await User.find( {role: "loanAgent", segments: segmentId} );
    const randomNumber = Math.floor(Math.random() * users.length);
    return users[randomNumber]._id.toString();
}

module.exports = pickAgentId