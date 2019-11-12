/*
 * Request handlers
 * 
 * This is how requests are processed, must be enabled via the router config in index.js
 */

//Dependencies
const _data = require('./dataHandler'),
    etc = require('./etclib'),
    log = require('./logging'),
    config = require('../config');

 /*
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
    if (['post','put','get','delete'].indexOf(data.method) > -1) handlers.user[data.method](data, callback);
    else callback(405, { status: 405, error: "NOT-ALLOWED", desc: "The method is not allowed.", methods: ['post', 'put', 'get', 'delete'] });
};


/*
 * Users
 *   post (Create)
 * Requires: fName, lName, mobile, email, pass, tos
 * (payload)
 */
handlers.user.post = function (data, callback) {
    const format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const phoneformat = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
    const fName = typeof data.payload.fName === 'string' && data.payload.fName.trim().length > 0 && (!phoneformat.test(data.payload.fName)) && (!format.test(data.payload.fName))? data.payload.fName.trim() : false; //get first name, if invalid or doesn't exist default to false
    const lName = typeof data.payload.lName === 'string' && (!phoneformat.test(data.payload.lName)) &&data.payload.lName.trim().length > 0 && (!format.test(data.payload.lName))? data.payload.lName.trim() : false;// same with last name ^^
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 2 && data.payload.email.includes('@') ? data.payload.email : false;
    const mobile = typeof data.payload.mobile === 'string'  && phoneformat.test(data.payload.mobile) && data.payload.mobile.trim().length >= 11 && data.payload.mobile.trim().length <= 21 ? data.payload.mobile.trim() : false;// same with last name ^^
    const pass = typeof data.payload.pass === 'string' && data.payload.pass.length > 8 && format.test(data.payload.pass) === true ? data.payload.pass : false;
    const tos = typeof data.payload.tos === 'boolean' && data.payload.tos === true ? true : false;// same with last name ^^
    if (fName && lName && mobile && email && pass && tos) {
        _data.read('users', email, function (err, data) {
            if (err) {
                const salt = etc.genSalt();//Get some salt on that, this will be added to the hash when authenticating
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
                            callback(500, { status: 500, error: "HASH-FAIL", desc: "An unknown error has occured." });
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
 * (query)
 */
handlers.user.get = function (data, callback) {
    //does the user exist
    const email = typeof data.queryStringObj.email === 'string' && data.queryStringObj.email.trim().length > 2 && data.queryStringObj.email.includes('@') ? data.queryStringObj.email : false;//get the users email
    const token = typeof data.queryStringObj.token === 'string' && data.queryStringObj.token.trim().length === config.tokenLength ? data.queryStringObj.token : false;//get the users token

    if (token && email) {
        try {
            etc.grants({ "token":String(token), email }, function (valid) {
                if (valid) {
                    if (email) {
                        _data.read('users', email, function (err, data) {
                            if (!err && data) {
                                //Remove salt and hash from response
                                delete data.pass;
                                delete data.salt;

                                callback(200, data);
                            } else {
                                callback(404, { status: 404, error: "USER-NOEXIST", desc: "The user in the query does not exist." });
                            }
                        });
                    } else {
                        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data." });
                    }
                } else {
                    etc.isValid(token, function (valid) {
                        if (valid) {
                            etc.verifyUser(email, function (valid) {
                                if (valid) { callback(401, { status: 401, error: "AUTH-MATCHTOKEN", desc: "The token could not be matched with the user when on call." }); }
                                else { callback(401, { status: 401, error: "USER-NO-EXIST", desc: "The user in the query does not exist." }); }
                            });

                        }
                        else { callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." }); }
                    });
                }
            });
        } catch (e) {
            callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
        }
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};

/*
 * Users
 *   put (update user)
 * Requires: email
 * Optional: fName, lName, pass, tos (must update one value)
 * (payload)
 */
handlers.user.put = function (data, callback) {
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 2 && data.payload.email.includes('@') ? data.payload.email : false;//get the users email
    
    //Check what we are updating
    const format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const phoneformat = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
    const fName = typeof data.payload.fName === 'string' && data.payload.fName.trim().length > 0 && (!format.test(data.payload.fName))? data.payload.fName.trim() : false; //get first name, if invalid or doesn't exist default to false
    const lName = typeof data.payload.lName === 'string' && data.payload.lName.trim().length > 0 && (!format.test(data.payload.lName))? data.payload.lName.trim() : false;// same with last name ^^
    const pass = typeof data.payload.pass === 'string' && data.payload.pass.length > 8 && format.test(data.payload.pass) === true ? data.payload.pass : false;
    const mobile = typeof data.payload.mobile === 'string' && data.payload.mobile.trim().length >= 11 && data.payload.mobile.trim().length <= 21 && phoneformat.test(data.payload.mobile.trim()) ? data.payload.mobile.trim() : false;// same with last name ^^
    const token = typeof data.payload.token === 'string' && data.payload.token.trim().length > 0 ? data.payload.token.trim() : false; //get first name, if invalid or doesn't exist default to false

    if (token) {
        try {
            etc.grants({ "token": String(token), email }, function (valid) {
                if (email && valid) {
                    _data.read('users', email, function (err, udata) {
                        if (!err && udata) {
                            if (fName) {
                                udata.fName = fName;
                            }
                            if (lName) {
                                udata.lName = lName;
                            }
                            if (pass) {
                                const userSalt = udata.salt;
                                udata.pass = etc.hash(pass + userSalt);
                            }
                            if (mobile) {
                                udata.mobile = mobile;
                            }

                            _data.update('users', email, udata, function (err) {
                                if (!err) {
                                    callback(204);
                                } else {
                                    log.error(err);
                                    callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                                }
                            });

                        } else {
                            callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                        }
                    });
                } else {
                    etc.isValid(token, function (valid) {
                        if (valid) {
                            etc.verifyUser(email, function (valid) {
                                if (valid) { callback(401, { status: 401, error: "AUTH-MATCHTOKEN", desc: "The token could not be matched with the user when on call." }); }
                                else { callback(401, { status: 401, error: "USER-NO-EXIST", desc: "The user in the query does not exist." }); }
                            });
                            
                        }
                        else { callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." }); }
                    }); 
                }
            });
        } catch (e) {
            callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
        }
    } else {
        callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." });
    }
};


/*
 * Users
 *   delete (remove a user)
 * Requires: email
 * (query)
 */
handlers.user.delete = function (data, callback) {
    //does the user exist
    const email = typeof data.queryStringObj.email === 'string' && data.queryStringObj.email.trim().length > 2 && data.queryStringObj.email.includes('@') ? data.queryStringObj.email : false;//get the users email

    const token = typeof data.queryStringObj.token === 'string' && data.queryStringObj.token.trim().length === config.tokenLength ? data.queryStringObj.token : false;//get the users token

    if (token && email) {
        try {
            etc.grants({ "token": String(token), email }, function (valid) {
                if (email && valid) {
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
                            callback(401, { status: 401, error: "USER-NOEXIST", desc: "The user in the query does not exist." });
                        }
                    });
                } else {
                    etc.isValid(token, function (valid) {
                        if (valid) {
                            etc.verifyUser(email, function (valid) {
                                if (valid) { callback(401, { status: 401, error: "AUTH-MATCHTOKEN", desc: "The token could not be matched with the user when on call." }); }
                                else { callback(401, { status: 401, error: "USER-NO-EXIST", desc: "The user in the query does not exist." }); }
                            });

                        }
                        else { callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." }); }
                    });
                }
            });
        } catch (e) {
            callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
        }
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};


/*Access token functions*/
handlers.accesstoken = function (data, callback) {
    if (['post','put','get','delete'].indexOf(data.method) > -1) {
        handlers.accesstoken[data.method](data, callback);
    } else {
        callback(405, { status: 405, error: "NOT-ALLOWED", desc: "The method is not allowed.", methods: ['post','put','get','delete'] });
    }
};


/*
 * Access tokens
 *   post (create token)
 * Requires: email, password
 * (payload)
 */
handlers.accesstoken.post = function (data, callback) {
    const email = typeof data.payload.email === 'string' && data.payload.email.trim().length > 2 ? data.payload.email : false;//get the users email
    const pass = typeof data.payload.pass === 'string' === true ? data.payload.pass : false;

    if (email && pass) {
        _data.read('users', email, function (err, udata) {
            if (!err && udata) {
                const sentPassHash = etc.hash(pass + udata.salt);

                if (udata.pass === sentPassHash && email === udata.email) {
                    const token = etc.newToken();//Users token
                    const expires = (Math.floor(Date.now() / 1000) + (config.timeZoneHours * 60 * 60)) + (60 * config.tokenTime);//Time until token expiry
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
            } else {
                callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
            }
        });
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};

/*
 * Access tokens
 *   get (check token)
 * Requires: token
 * (query)
 */
handlers.accesstoken.get = function (data, callback) {
    //does the user exist
    const token = typeof data.queryStringObj.token === 'string' ? data.queryStringObj.token : false;//get the users email

    if (token) {
        try {
            etc.grants({ "token": String(token), email }, function (valid) {
                if (token && valid) {
                    _data.read('actk', token, function (err, data) {
                        if (!err && data) {
                            delete data.email;

                            callback(200, data);
                        } else {
                            callback(401, { status: 401, error: "USER-NOEXIST", desc: "The user in the query does not exist." });
                        }
                    });
                } else {
                    callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." });
                }
            });
        } catch (e) {
            callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
        }
    } else {
        callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." });
    }
};

/*
 * Access tokens
 *   put (extend)
 * Requires: id
 * (payload)
 */
handlers.accesstoken.put = function (data, callback) {
    const token = typeof data.payload.token === 'string' ? data.payload.token : false;//get the token

    _data.read('actk', token, function (err, data) {
        if (!err && !token.op) {
            data.expires = (Math.floor(Date.now() / 1000) + (config.timeZoneHours * 60 * 60)) + (60 * config.tokenTime);//Time until token expiry
            _data.update('actk', token, data, function (err) {
                if (!err && data) {
                    if (data.expires > (Date.now()/1000)) {
                        delete data.email;
                        callback(200, data);
                    } else {
                        callback(422, { status: 422, error: "AUTH-EXPIREDTOKEN", desc: "Tried to renew expired token" });
                    }
                } else {
                    callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                }
            });
        } else {
            if (token.op) { callback(422, { status: 422, error: "AUTH-OPRENEW", desc: "You cannot renew an operator token" }); }
            else { callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." }); }
        }
    });
};

/*
 * Access tokens
 *   delete (logout)
 * Requires: id
 * (query)
 */
handlers.accesstoken.delete = function (data, callback) {
    const token = typeof data.queryStringObj.token === 'string' ? data.queryStringObj.token : false;//get the token

    if (token) {
        _data.read('actk', token, function (err, data) {
            if (!err && data) {
                _data.delete('actk', token, function (err) {
                    if (!err) {
                        callback(204);
                    } else {
                        callback(500, { status: 500, error: "", desc: "An unknown error has occured." });
                    }
                });
            } else {
                callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." });
            }
        });
    } else {
        callback(400, { status: 400, error: "NO-DATA", desc: "Missing required data or incorrect data" });
    }
};

/*Instance functions*/
handlers.instance = function (data, callback) {
    if (['post'].indexOf(data.method) > -1) {
        handlers.instance[data.method](data, callback);
    } else {
        callback(405, { status: 405, error: "NOT-ALLOWED", desc: "The method is not allowed.", methods: ['get'] });
    }
};
handlers.instance.info = function (data, callback) {
    if (['get'].indexOf(data.method) > -1) {
        handlers.instance.info[data.method](data, callback);
    } else {
        callback(405, { status: 405, error: "NOT-ALLOWED", desc: "The method is not allowed.", methods: ['get'] });
    }
};

//Return instance information
handlers.instance.info.get = function(data, callback) {
    //Return instance information
    try {
        const shipping = require('../shipping');
        const instanceinfo = {
            "_name": "RESTful-api",
            "instance": {
                "name": shipping.project.name,
                "url": shipping.project.url,
                "version": shipping.version.version,
                "stable": shipping.version.release
        
            },
            "NJSAPI-Source": {
                "_comment": "This is API is based off the RESTful-api project. You can get more information on the design and usage of the API here",
                "base-version": shipping.source.version,
                "base-stable": shipping.source.release,
                "base-git": shipping.source.git,
                "base-url": shipping.source.url,
                "base-latest": shipping.source["latest-stable-version"]
            }
        }
        callback(200, instanceinfo );
    } catch (e) {
        callback(500, { status: 500, error: "", desc:"" });
    }
};

handlers.instance.post = function (data, callback) {
    /* administrator token generation - 30 min forced
    1. get original token
    2. check token creator for "op" flag
    3. update token time to 30 minutes from this request
    4. add "op" flag to token
    5. in.* functions (ex. POST/GET on ./) should require a token with the op flag
    */
    const token = typeof data.payload.token === 'string' && data.payload.token.trim().length > 0 ? data.payload.token.trim() : false; //get first name, if invalid or doesn't exist default to false

    _data.read('actk', token, function (err, data) {
        if (!err) {
            const tokenStore = data;
            _data.read('users', tokenStore.email, function (err, data) {
                if (!err && data.op) {
                    //add "op" flag to token after checking if user has "op" flag
                    tokenStore["op"] = true;//Add the new operator flag
                    tokenStore.expires = (Math.floor(Date.now() / 1000) + (config.timeZoneHours * 60 * 60)) + (60 * 30);//Time until token expiry

                    _data.update('actk', token, tokenStore, function (err) {
                        if (!err) {
                            callback(204);
                        } else {
                            callback(500, { status: 500, error: "", desc: "An unclassified error prevented the token from being modified. Check that the token is correct and that you have the privileges to perform this operation." });
                        }
                    });
                } else {
                    if (!data.op) {
                        callback(403, { status: 403, error: "NOT-AUTHENTICATED3", desc: "The user associated with the token is not of operator class." });
                    } else {
                        callback(500, { status: 500, error: "", desc: "An unclassified error prevented the user from being read. This error is vague due to the fact that this feature is in development. Check that the token is correct and that you have the privileges to perform this operation." });
                    }
                }
            });
        } else {
            callback(401, { status: 401, error: "AUTH-BADTOKEN", desc: "Missing, malformed or invalid token." });
            //callback(500, { status: 500, error: "", desc: "An unclassified error prevented the token from being read. This error is vague due to the fact that this feature is in development. Check that the token is correct and that you have the privileges to perform this operation." });
        }
    });
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
//Handler not found
handlers.ohnoes = function (data, callback) {
    callback(404, { status: 404, error: "NOTFOUND", desc: "The requested content does not exist." }, "application/JSON");
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
