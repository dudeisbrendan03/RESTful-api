//Returns the config for a specific environment


var environments = {};

/*
Settings:

Port    - the port the server will run on
Env     - the name of the environment
Ip      - The IP to attach to
Secured - Enable HTTPS
*/

//Staging
environments.staging = {
    'port'  :   8765,
    'env'   :   'staging',
    'ip'    :   '127.0.0.1',//should be localhost/private
'secured'   :   false//doesn't need to be secured in local development
};

//Production
environments.production = {
    'port'  :   9876,
    'env'   :   'production',
    'ip'    :   '123.456.789.012',//should be a public IP - not 0.0.0.0
'secured'   :   true
};

//Idiot (runs on port 80)
environments.idiot = {
    'port'  :   80,
    'env'   :   'idiot',
    'ip'    :   '0.0.0.0',
'secured'   :   false
}

//Less of an idiot (run on port 8080)
environments.lessidiot = {
    'port'  :   8080,
    'env'   :   'Less of an idiot',
    'ip'    :   '0.0.0.0',
'secured'   :   true
}
//Export environment (depending on how the script was launched)
var curEnv  =   typeof(process.env.NODE_ENV)    ==  'string'    ?   process.env.NODE_ENV.toLowerCase()  :   '';//Grab the environment varialbe NODE_ENV and store it in curEnv in lower case, if it doesn't exist leave it blank
var using   =   typeof(environments[curEnv])    ==  'object'    ?   environments[curEnv]    :   environments.staging;//If there is no env or it isn't in our env list then swap to staging, else use that environment config

module.exports =   using;