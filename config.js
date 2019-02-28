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
        keyloc: './https/key.pem'
    },

    // Default production configuration.
    production: {
        httpport: 80,
        httpsport: 443,
        env: 'production',
        ip: '123.456.789.012', // should be a public IP, not 0.0.0.0
        secured: true,
        keephttpon: true,
        certloc: './https/cert.pem',
        keyloc: './https/key.pem'
    }

    // Custom configurations go here.
};

// Export environment (depending on how the script was launched)

// Grab the environment variable NODE_ENV and store it in currentEnv in lowercase. Leave blank if it doesn't exist.
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// If there is no environment or it isn't in our environment list then default to staging, else use that environment configuration.
const using = typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging;

module.exports = using;