const User = require('../models/userModel');

function pickAgentId(requestBody) {
    const users = User.find( {role: "loanAgent"} );
    const randomNumber = Math.floor(Math.random() * users.length);
    const choice = users[randomNumber];
    return choice._id;
}

module.exports = pickAgentId