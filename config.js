 // Returns the config for a specific environment.

/*
    settings:
        httpport: port the HTTP server will run on
        httpsport: port the HTTPS server will run on
        env: name of the environment
        ip: IP to attach to
        secured: enable HTTPS
        keepHTTPOn: enable HTTP
        certloc: location of the HTTPS certificate
        keyloc: location of the HTTPS key
*/

const environments = {

    // Default staging configuration.
    staging: {
        httpport: 8080,
        httpsport: 8081,
        env: 'staging',
        ip: '0.0.0.0', // should be localhost/private
        secured: false, // doesn't need to be secured in local development
        keephttpon: true,
        certloc: './https/cert.pem',
        keyloc: './https/key.pem',
        cabundleloc: '',
        favicon: './resouces/favicon.ico',
        cryptoSecret: 'a',//Has no effect while utilizing SHA256, will also be used for ciphering though. Make sure that this file is not accessible by non-SU users.
        tokenLength: 32, //The length of provisioned tokens
        tokenTime: 60, //Time (in minutes) until a token expires
        clearTokens: true, //Remove old tokens on boot
        timeZoneHours: 1,//Hours to add to token and API timing to resolve timezone issues
        aesEnabled: false //Turns Encryption on for user data
    },

    // Default production configuration.
    production: {
        httpport: 80,
        httpsport: 443,
        env: 'production',
        ip: '123.456.789.012', // do not run on all interfaces
        secured: true,
        keephttpon: true,
        certloc: './https/cert.pem',
        keyloc: './https/key.pem',
        cabundleloc: '',
        favicon: './resouces/favicon.ico',
        cryptoSecret: 'a',
        tokenLength: 32,
        tokenTime: 60,
        clearTokens: true,
        timeZoneHours: 1,
        aesEnabled: false
    },

    // Just clear tokens
    tokclear: {//This will JUST execute the token clearing function. Server will not start and this is safe to run WHILE the server is running or not.
        httpport: 0,
        httpsport: 0,
        env: 'tokclear',
        ip: '0',
        secured: false,
        keephttpon: false,
        certloc: '',
        keyloc: '',
        cabundleloc: '',
        favicon: '',
        cryptoSecret: '',
        tokenLength: 0,
        tokenTime: 0,
        clearTokens: true,
        timeZoneHours: 1,//This is THE ONLY settings that should be touched in tokClear
        aesEnabled: false
    },

    // Custom configurations go here.
};

// Export environment (depending on how the script was launched)

// Grab the environment variable NODE_ENV and store it in currentEnv in lowercase. Leave blank if it doesn't exist.
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// If there is no environment or it isn't in our environment list then default to staging, else use that environment configuration.
const using = typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging;

module.exports = using;