
function randomPasswordGenerator() {
    let password = '';
    const numerals = "0123456789";
    const symbols = "!@#$%&+=./?~-_!@#$%&+=./?~-_:";
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&+=./?~-_";

    for(let i = 0; i < 4; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));

        for(let i = 0; i < 1; i++) {
            password += numerals.charAt(Math.floor(Math.random() * numerals.length));
        }

        for(let i = 0; i < 1; i++) {
            password += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }
    
    }

    return password;
}

module.exports = randomPasswordGenerator;