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

//Respond to requests with a string
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

        //Now the request has finished we want to go back to what we were doing before
        
        //Respond to the req
        res.end('Avaliable.\n');

        //Log the req path
        console.log('\n'+request+`[r] Requested recieved:\n  On path: '${trimPath}'\n  Using method: ${method.toUpperCase()}\n  With query: ${JSON.stringify(queryStringObj)}\n  The headers:\n    ${JSON.stringify(headers)}\n  Paylod: ${String(buffer)}`,none)

    });
});

//Start the server
server.listen(9876,function(){
    console.log(success+'[s] Server is listening on ',col.inverse,'9876',none)
})