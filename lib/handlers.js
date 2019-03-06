//Dependencies
const _data = require('./data'),
    etc = require('./etclib'),
    log = require('./logging');

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

/*
 * Users
 *   post (Create)
 * Requires: fName, lName, mobile, email, pass, tos
 * 
 */
handlers.users.post = function (data, callback) {
    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const fName = typeof data.payload.fName === 'string' && data.payload.fName.trim().length > 0 ? data.payload.fName.trim() : false; //get first name, if invalid or doesn't exist default to false
    const lName = typeof data.payload.lName === 'string' && data.payload.lName.trim().length > 0 ? data.payload.lName.trim() : false;// same with last name ^^
    const mobile = typeof data.payload.mobile === 'string' && data.payload.mobile.trim().length === 13 ? data.payload.mobile.trim() : false;// same with last name ^^
    const pass = typeof data.payload.pass === 'string' && data.payload.pass.length > 8 && format.test(data.payload.pass) === true ? data.payload.pass : false;
    const tos = typeof data.payload.tos === 'boolean' && data.payload.tos === true ? true : false;// same with last name ^^

    if (fName && lName && mobile && pass && tos) {
        _data.read('users', phone, function (err, data) {
            if (err) {
                const salt = etc.salt();//Get some salt on that, this will be added to the password when authenticating
                const hashedPass = etc.hash(pass+salt);//Hash the users password
                const pass = 'na';//Empty out password val

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
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data" }, "application/JSON");
    }
};

/*
 * Users
 *   put
 * Requires: fName, lName, mobile, email, pass, tos
 *
 */

//handlers.users.put = function (data, callback) {

//};



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
