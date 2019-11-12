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

//Exist!
let etclib = {};


//Generate some salt to add to our password, this should be generated once for each user and added to any password they submit
etclib.genSalt = function() {
    var salt = "";
    const possible = "abcdef1234567890";
    for (var i = 0; i < 12; i++)
        salt += possible.charAt(Math.floor(Math.random() * possible.length));
    return salt;
};


//Hashing function set to SHA256, can't be decrypted because it's a hash so the cryptoSecret is pretty useless tbh - but it doesn't work without it
etclib.hash = function (str) {
    if (typeof str === 'string' && str.length > 1) {
        const hash = cryp.createHmac('sha256', config.cryptoSecret).update(str).digest('hex');
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
etclib.isValid = function (token,callback) {

    _data.read('actk', token, function (err, data) {
        if (!err && data) {
            const expr = data.expires;
            const time = Math.floor(Date.now() / 1000) + (config.timeZoneHours * 60 * 60);
            const valid = expr > time;
            callback(valid);
        } else {
            callback(false);
        }
    });
};

//Fetch all token IDs
etclib.tokens = function (callback) {
    const directoryPath = path.join(__dirname, "../.tdat/actk/");
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            callback(false);
        } else {
            //listing all files using forEach
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

//Check if user is valid
etclib.verifyUser = function (email, callback) {
    _data.read('users', email, function (err, data) {
        if (!err && data) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

//Check if token may be used to grant user access to function
etclib.grants = function (validityObject, callback) {
    //Callback: error, validity
    //Check if a token is time valid
    try {
        //can insert other verification methods later on, not need at the minute. This will be used and designed in the future ;-P
        _data.read('actk', validityObject.token, function (err, tokdat) {
            if (!err) {
                etclib.isValid(validityObject.token, function (tmp) {
                    if (tokdat.email === validityObject.email && tmp) {
                        callback(true);
                    } else if (!validityObject.email && tmp) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        });

    } catch (e) {
        log.error('Problem while attempting to validate a token.');
        callback(false);
    }
};

//Verify a hash
etclib.hashVerify = function (hash) {
   /* const possible = /[a-f][0-9]/g;
    const notpossible = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?][g-z]/g;
    const verify = typeof hash === 'string' && possible.test(hash) && (!notpossible.test(hash)) && hash.length >= 32 ? true: false;
    return verify;*/
    return false;//abandon
};

module.exports = etclib;//Export