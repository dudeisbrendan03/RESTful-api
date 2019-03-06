/*
 *  etcetera library
 * 
 *    'For the ones with no home.'
 * 
 * 
 */

//Dependencies
const cryp = require('crypto'),
    config = require('../config');

//Exist!
let etclib = {};


//Generate some salt to add to our password, this should be generated once for each user and added to any password they submit
etclib.gensalt = function() {
    const salt = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!&$*^%()£{}[];#:~,./<>?";
    for (var i = 0; i < 12; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return salt;
};


//Hashing function set to SHA256, can't be decrypted because it's a hash so the hashsecret is pretty useless tbh - but it doesn't work without it
etclib.hash = function (str) {
    if (typeof str === 'string' && str.length > 1) {
        const hash = cryp.createHmac('sha256', config.hashSecret).update(str).digest(hex);
        return hash;
    } else {
        return false;
    }
};

//Safe parse JSON - to prevent the script crashing we're going to parse the JSON then return a blank object if we fail to, this prevents index from crashing.
etclib.safePJS = function (obj) {
    try {
        var parsed = JSON.parse(obj);
    } catch (e) {
        parsed = {};
    }
    return parsed;
};


module.exports = etclib;//Export