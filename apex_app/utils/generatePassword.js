
function randomPasswordGenerator() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&+=";

    let password = '';

    for(let i = 0; i < 9; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
}

module.exports = randomPasswordGenerator;