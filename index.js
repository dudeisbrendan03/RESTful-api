/*
Index file for the API
*/
//Colour because they're important!
const col = require('./colourdat');

//Quick console colours
info = col.bg_blue+col.white
request = col.bg_black+col.yellow
warn = col.bg_red+col.white
success = col.bg_green+col.white
none = col.reset+col.reset

//Start message after config has been set.
console.info(info+'[i] Firing up the engines!',none)

//Any dependencies
console.info(info+'[i] Calling in the troops (requiring dependencies)',none)
const http          = require('http');
const url           = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config        = require('./config');
console.info('\nNJSAPIPROJ-V1-'+config.env+'\n')

//Date/time
var date = new Date();
var current_hour = date.getHours();
rdate = date+current_hour

//Respond to requests with a string and get all the content and data from the request
//HTTP Server
var server = http.createServer(function(req,res) {
    //Parse the req
    var reqUrl = url.parse(req.url,true);//Get the URL the user used and parse it.

    //Get the path
    var path = reqUrl.pathname;//The path the user requested: untrimmed
    var trimPath = path.replace(/^\/+|\/+$/g,'');

    /*
    Educate ourselves about the request
    
    Figure out:
    -The query (if applicable)
    -The method
    -The headers
    */
    var queryStringObj = reqUrl.query; //Get the query as an object
    var method = req.method.toLowerCase(); //Figure out method (POST, GET, DELETE, PUT, HEAD)
    var headers = req.headers; //Get the headers as an object

    //Get payload/content/body of the request (if applicable)
    var decoder = new StringDecoder('utf-8');//To decode stream - we only expect to recieve utf-8
    var buffer = '';//A buffer/placeholder for a string - Is being recieved in pieces, need a buffer to assemble the data as it comes in. Will be appended until the data been completely recieved
    req.on('data',function(data) {//Every time the request streams in a piece, we decode it and append it to the buffer
        buffer += decoder.write(data)
    });
    req.on('end',function(){//The request has finished - if there is no payload this will still be called
        buffer += decoder.end();//The request has finished, finish up

        //Send the request to the correct handler, if non is available/found send to ohnoes
        var handlerReq  =   typeof(router[trimPath]) !== 'undefined' ? router[trimPath] : handlers.ohnoes;//if stat code is number, leave it as it is and if it isnt a number then define stat code as 200

        //Construct the object to send to the handler
        var data = {
            'trimPath'  :   trimPath,
            'queryStringObj'  :   queryStringObj,
            'method'  :   method,
            'headers'  :   headers,
            'payload'  :   buffer
        };


        //Now send the req to the handler specified in the router
        handlerReq(data,function(statCode,payload) {
            //Use the status code from the handler, or just use 200 (OK)
            statCode    = typeof(statCode) == 'number' ? statCode : 200;
            
            //Use the payload from the handler or return empty obj.
            //NOTE about the shitty if/else filters: they're a secret
            if (trimPath == 'best') {
                var payloadStr  = payload
            } else {
                payload = typeof(payload) == 'object' ? payload : {};
                //Convert the payload to a string to send back to the user
                var payloadStr  = JSON.stringify(payload);
            };            

            //Respond to the req
            if (trimPath == 'best') {
                res.setHeader('Content-Type','application/HTML')
            }   else {
                res.setHeader('Content-Type','application/JSON')
            };
            res.writeHead(statCode);
            res.end(payloadStr);
    
            //Logthatshit
            console.info('\n'+request+`[r] Request responded to:\n  Returning w/ code: ${String(statCode)}\n  With payload: ${String(payloadStr)}\n  At time: ${rdate}`)
        });

        //Now the request has finished we want to go back to what we were doing before
        

        //Log the req path
        console.log('\n'+request+`[r] Requested recieved:\n  On path: '${trimPath}'\n  Using method: ${method.toUpperCase()}\n  With query: ${JSON.stringify(queryStringObj)}\n  The headers:\n    ${JSON.stringify(headers)}\n  Payload: ${String(buffer)}\n  At time: ${new Date()+date.getHours()}`,none)

    });
});

//Start the server
server.listen(config.port,function(){
    console.log(success+'[s] Server is listening on ',col.inverse,config.port,none)
})



/*
Handlers
_______________
Sample - A demo handler
ohnoes - A 404 handler
*/
var handlers = {};

//Sample handler
handlers.sample = function(data,callback) {
    //Callback a 200 status code and a payload object for the demo
    callback(200,{'sample':'json'});
};

handlers.best = function(data,callback) {
    callback(200,"<head><link href='https://fonts.googleapis.com/css?family=Major+Mono+Display' rel='stylesheet'></head><body><style>body, html, h1 {font-family: 'Major Mono Display', monospace;}; h3{font-family: 'Major Mono Display', monospace; font-size: 24px}</style><h1>Mar is a cutie</h1><h3>❤</h3></body")
}
//Handler not found
handlers.ohnoes = function(data,callback) {
    callback(404);
};

//A cool router
var router = {
    "sample" : handlers.sample,
    "best" : handlers.best
};