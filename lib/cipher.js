/*
 * AES Cipher module
 * 
 * For data encryption within the project like: .tdat/users
 */

const crypto = require('crypto');

let cryp = {};

cryp.encrypt = function (KEY, normalText) {
    const cipher = crypto.createCipher('aes192', KEY);
    var encrypted = cipher.update(normalText, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

cryp.decrypt = function (KEY, encryptedText) {
    const decipher = crypto.createDecipher('aes192', KEY);
    var decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    try { decrypted += decipher.final('utf-8'); }
    catch (e) { decrypted = false; }
    return decrypted;
};

module.exports = cryp;