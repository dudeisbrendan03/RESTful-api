//Returns the config for a specific environment


var environments = {};


//Staging
environments.staging = {
    'port'  :   8765,
    'env'   :   'staging',
};

//Production
environments.production = {
    'port'  :   9876,
    'env'   :   'production',
};

//Export environment (depending on how the script was launched)
var curEnv  =   typeof(process.env.NODE_ENV)    ==  'string'    ?   process.env.NODE_ENV.toLowerCase()  :   '';//Grab the environment varialbe NODE_ENV and store it in curEnv in lower case, if it doesn't exist leave it blank
var using   =   typeof(environments[curEnv])    ==  'object'    ?   environments[curEnv]    :   environments.staging;//If there is no env or it isn't in our env list then swap to staging, else use that environment config

module.exports =   using;