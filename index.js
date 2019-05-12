/*
 * Main script for the API
 * 
 * Configuration is in config.js
 * 
 */

//Import logging, version checker and colours prior to everything else
const log = require('./lib/logging'),
    verCheck = require('./lib/versionChecker'),
    col = require('./lib/colours');

let exitVal = 0;

// Catch exit
process.on('SIGINT', () => {
    if (exitVal) {
        log.warn('Stopping server...');
        try {
            httpServer.close();
            httpsServer.close();
        } catch (e) { log.warn('A server was not running'); }
        log.success('Server stopped.');
        log.info('Killing process ...');
        process.exit();
    } else {
        log.warn('Exit requested - Press CTRL+C again to gracefully exit');
        exitVal = 1;
    }
});

// Start message after config has been set.
log.info('Firing up the engines!');

// Any dependencies
log.info('Calling in the troops (requiring dependencies)');

const http = require('http'),
    https = require('https'),
    url = require('url'),
    { StringDecoder } = require('string_decoder'),
    config = require('./config'),
    fs = require('fs'),
    handlers = require('./lib/handlers'),
    etc = require('./lib/etclib'),
    _data = require('./lib/dataHandler');


try {
    console.info(`\NJSAPIPROJ-${fs.readFileSync('.git/refs/heads/master').toString('utf-8')}\nUsing mode: ${config.env}\nhttps://github.com/dudeisbrendan03/RESTful-api\n`);
} catch (e) {
    console.error('Unknown version');
}
if (config.ip === '0.0.0.0')
    log.warn('You are running on all available IPs. This is considered bad practice and possibly dangerous, make sure you have double checked your config.');
else if (config.ip === '127.0.0.1')
    log.info('Running at localhost, the server will not be able to be access by other devices without tunneling.');

if (config.clearTokens) {
    log.warn("Going to remove expired tokens");
    var tkList = [];
    etc.tokens(function (tkList) {
        if (tkList) {
            tkList.forEach(function (tk) {
                var tmp = etc.isValid(tk);
                if (!tmp) {
                    _data.delete('actk', tk, function (err) {
                        if (!err) {
                            log.info(tk + " removed");
                        } else {
                            log.warn(tk + " could not be properly invalidated/unlinked");
                        }
                    });
                }
            });
        } else {
            log.warn("Couldn't attempt token removal");
        }
    });
    
}

// Check if HTTP and HTTPS are disabled
if (config.secured === false && config.keephttpon === false) {
    log.error('Both the HTTP and HTTPS servers are disabled. Will not start - now exiting.');
    log.info('Killing process');
    process.exit();
}

// Date/time
const date = new Date(),
    rdate = date + date.getHours();


// HTTP Server
const httpServer = http.createServer((req, res) => {
    if (config.keephttpon === true)
        logic(req, res);
});

let httpsServer;

// HTTPS Server
try {
    httpsServer = https.createServer({
        key: fs.readFileSync(config.keyloc).toString('utf8'),
        cert: fs.readFileSync(config.certloc).toString('utf8')
    }, (req, res) => config.secured ? logic(req, res) : undefined);
} catch (e) {
    log.error('HTTPS is unavailable as the certificate files are unavailable, damaged or missing.');
}

// Start the HTTP server
if (config.keephttpon === true) {
    httpServer.listen(config.httpport, config.ip, function () {
        log.success(`Server is listening on ${col.inverse}${config.ip}:${config.httpport}${col.background.blue + col.hicolour} HTTP`);
    });
    httpServer.on('error', () => {
        log.error('Failed to attach to the IP or port that was specified.');
        log.warn('Exiting');
        log.warn('Stopping server...');
        httpServer.close();
        log.success('Server stopped');
        log.info('Killing process');
        process.exit();
    });
}


// Start the HTTPS server
if (config.secured === true) {
    try {
        httpsServer.listen(config.httpsport, config.ip, () => {
            log.success(`Server is listening on ${col.inverse}${config.ip}:${config.httpsport}${col.background.blue + col.hicolour} HTTPS`);
        });
        httpsServer.on('error', function () {
            log.error('Failed to attach to the IP or port that was specified');
            log.warn('Exiting');
            log.warn('Stopping server...');
            httpsServer.close();
            log.success('Server stopped');
            log.info('Killing process');
            process.exit();
        });
    } catch (e) { log.error("Issue starting HTTPS server");}
    
}

// Instead of making http.createServer and https.createServer we can place all the code/logic from the current setup which then may be called by either one.
// Respond to requests with a string and get all the content and data from the request
const logic = (req, res) => {
    // Parse the request
    const reqUrl = url.parse(req.url, true);//Get the URL the user used and parse it.

    // Get the path
    const path = reqUrl.pathname;//The path the user requested: untrimmed
    const trimPath = path.replace(/^\/+|\/+$/g, '');

    /* Educate ourselves about the request

    Figure out:
    - The query (if applicable)
    - The method
    - The headers

    */
    const queryStringObj = reqUrl.query; // Get the query as an object
    const method = req.method.toLowerCase(); // Figure out method (POST, GET, DELETE, PUT, HEAD)
    const headers = req.headers; // Get the headers as an object

    // Get payload/content/body of the request (if applicable)
    const decoder = new StringDecoder('utf-8');// To decode stream - we only expect to receive utf-8
    let payload = ''; // A buffer/placeholder for a string - Is being received in pieces, need a buffer to assemble the data as it comes in. Will be appended until the data been completely received
    // Every time the request streams in a piece, we decode it and append it to the
    req.on('data', data => payload += decoder.write(data));
    req.on('end', () => { // The request has finished - if there is no payload this will still be called
        payload += decoder.end(); // The request has finished, finish up

        // Send the request to the correct handler, if non is available/found send to ohnoes
        const handlerReq = router[trimPath] || handlers.ohnoes; // if stat code is number, leave it as it is and if it isnt a number then define stat code as 200

        // Construct the object to send to the handler
        const sPayload = etc.safePJS(payload);//make sure that the payload wont cause any errors/issues, if it does return an empty object
        const data = { trimPath, queryStringObj, method, headers, 'payload':sPayload };
        

        // Now send the req to the handler specified in the router
        handlerReq(data, function (statCode, payload, objTyp) {
            // Use the status code from the handler, or just use 200 (OK)
            statCode = typeof statCode === 'number' ? statCode : 200;
            objTyp = typeof objTyp === 'string' ? objTyp : 'application/JSON';

            // Use the payload from the handler or return empty obj.
            // Check if we're using JSON/didn't define the payload type then go ahead and convert the JSON/obj into a string

            let payloadStr = '', noStr = false;
            if (objTyp === 'application/JSON') {
                payload = typeof payload === 'object' ? payload : {};
                // Convert the payload to a string to send back to the user
                payloadStr = JSON.stringify(payload);
            } else if (objTyp.includes('image/')) {
                payloadStr = payload;
                noStr = true;
            } else payloadStr = String(payload);

            // Respond to the req
            res.setHeader('Content-Type', objTyp);
            res.setHeader('status', 'good');
            res.writeHead(statCode);
            res.end(payloadStr);

            const payloadPrint = noStr ? 'MAY NOT PRINT, NON STR DATA' : payloadStr;
            log.request([
                'Responding to request:',
                `  Code: ${statCode}`,
                `  Payload: ${payloadPrint}`,
                `  Type: ${objTyp}`,
                `  Time: ${rdate}`
            ].join('\n'));
        });

        // Now the request has finished we want to go back to what we were doing before


        // Log the req path

        log.request([
            'Request received:',
            `  Path: '${trimPath}'`,
            `  Method: ${method.toUpperCase()}`,
            `  Query: ${JSON.stringify(queryStringObj)}`,
            `  Headers: ${JSON.stringify(headers)}`,
            `  Payload: ${payload}`,
            `  Time: ${new Date() + date.getHours()}`
        ].join('\n'));
    });
};


//A cool router
var router = {
    "up": handlers.up,
    "sample": handlers.sample,
    "best": handlers.best,
    "demosite": handlers.demosite,
    "ping": handlers.ping,
    "user": handlers.user,
    "auth": handlers.accesstoken,
    "favicon.ico": handlers.favicon
};

module.exports = httpServer