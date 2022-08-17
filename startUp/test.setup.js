const mongoose = require('mongoose');
const dbDebug = require('debug')('app:db');

function testConnectDB() {
    
    beforeAll(async () => {
        const url='mongodb://localhost/test-apex';
        mongoose.createConnection(url); console.log('connected')
       })
}

module.exports = testConnectDB;
