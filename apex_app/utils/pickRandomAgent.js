const User = require('../models/userModel');

async function pickAgentId(lenderId, role, segmentId) {
    const users = await User.find( { lenderId, role, active: true, segments: segmentId } );
    const randomNumber = Math.floor(Math.random() * users.length);
return users[randomNumber];
}

module.exports = pickAgentId;