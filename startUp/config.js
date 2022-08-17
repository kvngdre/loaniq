const path = require('path');


module.exports = function() {
    process.env["NODE_CONFIG_DIR"] = path.resolve(__dirname, '../config');
    console.log(`NODE ENV: ${process.env.NODE_ENV}`);
}