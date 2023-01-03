const config = require('config');
const crypto = require('crypto');

const algorithm = 'aes128';
const initVector = config.get('crypto.initVector');
const secret = config.get('crypto.secret_key');
const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 16);
console.log('key', key)

function encryptqueryFilter(lenderId) {
    // Cipher func

    const cipher = crypto.createCipheriv(algorithm, key, initVector);

    const message = `id=${lenderId}`;

    // Encrypt the message
    let encryptedData = cipher.update(message, 'utf-8', 'hex'); // input encoding, output encoding

    encryptedData += cipher.final('hex');

    return encryptedData;
}

function decryptqueryFilter(encryptedData) {
    // Decipher Func
    const decipher = crypto.createDecipheriv(algorithm, key, initVector);

    let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');

    decryptedData += decipher.final('utf-8');

    return decryptedData;
}

module.exports = {
    encryptqueryFilter,
    decryptqueryFilter,
};
