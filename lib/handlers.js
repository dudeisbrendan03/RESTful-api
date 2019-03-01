/*
 *  Handlers:
 * sample   - Is the server up? Send back JSON content to test
 * up       - JSON response test
 * demosite - Test of non-JSON content
 * ohnoes   - 404 content in JSON
 * favicon  - Give that sweet browser it's icon
 */


let handlers = {};


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
    callback(200, "<body><h1>test</h1></body>", "application/HTML");
};
handlers.best = function (data, callback) {
    callback(200, "<head><link href='https://fonts.googleapis.com/css?family=Major+Mono+Display' rel='stylesheet'></head><body><style>body, html, h1 {font-family: 'Major Mono Display', monospace;}; h3{font-family: 'Major Mono Display', monospace; font-size: 24px}</style><h1>Mar is a cutie</h1><h3>❤</h3></body", 'application/HTML');
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