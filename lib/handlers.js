//Dependencies
const _data = require('./dataHandler'),
    etc = require('./etclib'),
    log = require('./logging'),
    config = require('../config');

 ﻿/*
 *  Handlers:
 * sample   - Is the server up? Send back JSON content to test
 * up       - JSON response test
 * demosite - Test of non-JSON content
 * ohnoes   - 404 content in JSON
 * favicon  - Give that sweet browser it's icon
 */


let handlers = {};




/* User functions*/
handlers.user = function (data, callback) {
    if (['post','put','get','delete'].indexOf(data.method) > -1) {
        handlers.user[data.method](data, callback);
    } else {
        callback(405, { status: 405, error: "NOT-ALLOWED", desc: "The method is not allowed." });
    }
};


/*
 * Users
 *   post (Create)
 * Requires: fName, lName, mobile, email, pass, tos
 * 
 */
handlers.user.post = function (data, callback) {
    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const fName = typeof data.payload.fName === 'string' && data.payload.fName.trim().length > 0 && (!format.test(data.payload.fName))? data.payload.fName.trim() : false; //get first name, if invalid or doesn't exist default to false
    const lName = typeof data.payload.lName === 'string' && data.payload.lName.trim().length > 0 && (!format.test(data.payload.lName))? data.payload.lName.trim() : false;// same with last name ^^
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 2 && data.payload.email.includes('@') ? data.payload.email : false;
    const mobile = typeof data.payload.mobile === 'string' && data.payload.mobile.trim().length >= 11 && data.payload.mobile.trim().length <= 21 ? data.payload.mobile.trim() : false;// same with last name ^^
    const pass = typeof data.payload.pass === 'string' && data.payload.pass.length > 8 && format.test(data.payload.pass) === true ? data.payload.pass : false;
    const tos = typeof data.payload.tos === 'boolean' && data.payload.tos === true ? true : false;// same with last name ^^
    if (fName && lName && mobile && email && pass && tos) {
        _data.read('users', email, function (err, data) {
            if (err) {
                const salt = etc.genSalt();//Get some salt on that, this will be added to the password when authenticating
                const hashedPass = etc.hash(pass+salt);//Hash the users password

                if (hashedPass) {
                    const user = {//Create user object
                        fName,
                        lName,
                        mobile,
                        email,
                        'pass': hashedPass,
                        salt,
                        tos
                    };

                    //Create and store that user
                    _data.create('users', email, user, function (err) {
                        if (!err) {
                            callback(204);
                        } else {
                            log.error('Unknown error has occured.\n' + String(err));
                            callback(500, { status: 500, error: "Failed hashing.", desc: "An unknown error has occured." });
                        }
                    });
                } else {
                    callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                }
            } else {
                callback(400, { status: 400, error: "USER-EXISTS", desc: "The user in the query already exists." });
            }
        });
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};

/*
 * Users
 *   get (allow user to access own data)
 * Requires: email
 *
 */
handlers.user.get = function (data, callback) {
    //does the user exist
    const email = typeof data.queryStringObj.email === 'string' && data.queryStringObj.email.trim().length > 2 && data.queryStringObj.email.includes('@') ? data.queryStringObj.email : false;//get the users email
    if (email) {
        _data.read('users', email, function (err, data) {
            if (!err && data) {
                //Remove salt and hash from response
                delete data.hashedPass;
                delete data.salt;

                callback(200,data);
            } else {
                callback(404, { status: 404, error: "USER-NOEXIST", desc: "The user in the query does not exist." });
            }
        });
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};

/*
 * Users
 *   put (update user)
 * Requires: email
 * Optional: fName, lName, pass, tos (must update one value)
 */
handlers.user.put = function (data, callback) {
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 2 && data.payload.email.includes('@') ? data.payload.email : false;//get the users email
    
    //Check what we are updating
    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const fName = typeof data.payload.fName === 'string' && data.payload.fName.trim().length > 0 && (!format.test(data.payload.fName))? data.payload.fName.trim() : false; //get first name, if invalid or doesn't exist default to false
    const lName = typeof data.payload.lName === 'string' && data.payload.lName.trim().length > 0 && (!format.test(data.payload.lName))? data.payload.lName.trim() : false;// same with last name ^^
    const pass = typeof data.payload.pass === 'string' && data.payload.pass.length > 8 && format.test(data.payload.pass) === true ? data.payload.pass : false;


    if(email){
        _data.read('users',email,function (err, udata){
            if(!err && udata){
                if(fName){
                    udata.fName = fName;
                }
                if(lName){
                    udata.lName = lName;
                }
                if(pass){
                    const userSalt = udata.salt;
                    udata.pass = etc.hash(pass+userSalt);
                }

                _data.update('users',email,udata,function(err){
                    if(!err){
                        callback(204);
                    } else {
                        log.error(err);
                        callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                    }
                });
                callback(204);
            } else {
                callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
            }
        });
    } else {
        callback(404, { status: 404, error: "USER-NO-EXIST", desc: "The user in the query does not exist." });
    }
};


/*
 * Users
 *   delete (remove a user)
 * Requires: fName, lName, mobile, email, pass, tos
 *
 */
handlers.user.delete = function (data, callback) {
    //does the user exist
    const email = typeof data.queryStringObj.email === 'string' && data.queryStringObj.email.trim().length > 2 && data.queryStringObj.email.includes('@') ? data.queryStringObj.email : false;//get the users email
    if (email) {
        _data.read('users', email, function (err, data) {
            if (!err && data) {
                _data.delete('users', email, function (err) {
                    if (!err) {
                        callback(204);
                    } else {
                        callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                    }
                });
            } else {
                callback(404, { status: 404, error: "USER-NOEXIST", desc: "The user in the query does not exist." });
            }
        });
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};


/*Access token functions*/
handlers.accesstoken = function (data, callback) {
    if (['post'].indexOf(data.method) > -1) {
        handlers.accesstoken[data.method](data, callback);
    } else {
        callback(405, { status: 405, error: "NOT-ALLOWED", desc: "The method is not allowed." });
    }
};


/*
 * Access tokens
 *   post (create token)
 * Requires: email, password
 *
 */

handlers.accesstoken.post = function (data, callback) {
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 2 ? data.payload.email : false;//get the users email
    const pass = typeof data.payload.pass === 'string' === true ? data.payload.pass : false;

    if (email && pass) {
        _data.read('users', email, function (err, udata) {
            const sentPassHash = etc.hash(pass + udata.salt);

            if (udata.pass === sentPassHash && email === udata.email) {
                const token = etc.newToken();//Users token
                const expires = Date.now() + 100 * 60 * config.tokenTime;//Time until token expiry
                const tObj = { email, token, expires };//object with token data
                //Store token information
                _data.create('actk', token, tObj, function () {
                    if (!err) {
                        callback(200, tObj);
                    } else {
                        callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                    }
                });
            } else {
                callback(403, { status: 403, error: "NOT-AUTHENTICATED2", desc: "Failed login attempt" });
            }
        });
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};

/*Note for future development: Start using 3 callbacks

1st - The code to respond with
2nd - Payload/content
3rd - Type (if none specified then default to JSON. By doing this we allow other payloads like HTML or other bin. content) 
*/

//Sample handler
handlers.sample = function (data, callback) {
    //Callback a 200 status code and a payload object for the demo
    callback(200, { 'sample': 'json' });
};
//Check if the server is available
handlers.ping = function (data, callback) {
    callback(204);//literally nothing
};
handlers.up = function (data, callback) {
    if (data.headers['status'] === 'na') {
        callback(200, { 'ImGood': 'ThanksForAsking uwu' });
    } else if (data.headers['headers.status'] === 'na') {
        callback(200, { 'ImGood': 'ThanksForAsking uwu' });
    } else {
        callback(204);
    }
};
handlers.demosite = function (data, callback) {
    //Send a demo website
    callback(200, "<body><h1>test</h1></body>", "text/HTML");
};
handlers.best = function (data, callback) {
    callback(200, "<head><link href='https://fonts.googleapis.com/css?family=Major+Mono+Display' rel='stylesheet'></head><body><style>body, html, h1 {font-family: 'Major Mono Display', monospace;}; h3{font-family: 'Major Mono Display', monospace; font-size: 24px}</style><h1>Mar is a cutie</h1><h3>❤</h3></body", 'text/HTML');
};
//Handler not found
handlers.ohnoes = function (data, callback) {
    callback(404, { status: 404, error: "NOFOUND-1", desc: "The requested content does not exist." }, "application/JSON");
};

//Favicon handler
handlers.favicon = function (data, callback) {
    try {
        callback(200, fs.readFileSync(config.favicon), "image/vnd.microsoft.icon");
    } catch (err) {
        callback(404);
    }
};

module.exports = handlers;
