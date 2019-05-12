/*
 *  etcetera library
 * 
 *    'For the ones with no home.'
 * 
 * 
 */

//Dependencies
const cryp = require('crypto'),
    config = require('../config'),
    path = require('path'),
    fs = require('fs'),
    _data = require('./dataHandler');

console.log(_data+"tetsetsetset");
//Exist!
let etclib = {};


//Generate some salt to add to our password, this should be generated once for each user and added to any password they submit
etclib.genSalt = function() {
    var salt = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!&$*^%()£{}[];#:~,./<>?";
    for (var i = 0; i < 12; i++)
        salt += possible.charAt(Math.floor(Math.random() * possible.length));
    return salt;
};


//Hashing function set to SHA256, can't be decrypted because it's a hash so the hashsecret is pretty useless tbh - but it doesn't work without it
etclib.hash = function (str) {
    if (typeof str === 'string' && str.length > 1) {
        const hash = cryp.createHmac('sha256', config.hashSecret).update(str).digest('hex');
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

//Generate a 32(default) character long hexadecimal token
etclib.newToken = function() {
    var token = "";
    const possible = "0123456789abcdef";
    for (var i = 0; i < config.tokenLength; i++)
        token += possible.charAt(Math.floor(Math.random() * possible.length));
    return token;
};

//Check a tokens validity
etclib.isValid = function (token) {

    _data.read('actk', token, function (err, data) {
        if (!err && data) {
            const date = data.expires;
            const valid = data.expires > Date.now() + 1000 * 60;
            return valid;
        } else {
            return false;
        }
    });
};

//Fetch all token IDs
etclib.tokens = function (callback) {
    var files = {};
    const directoryPath = path.join(__dirname, "../.tdat/actk/");
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            callback(false);
        } else {
            //listing all files using forEach
            files.forEach(function (file) {
                files.file;
            });
            files.splice((files.indexOf("placeholder.txt")), 1);
            var retfiles = [];
            for (i = 0; i < files.length; i++) {
                var temp = files[i].replace('.json', '');
                retfiles.push(temp);
            }
            callback(retfiles);
        }
    });
};

module.exports = etclib;//Export