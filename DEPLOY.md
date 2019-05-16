# Deployment instructions

## Clone the repo
Clone the repo containing the API

```git clone https://github.com/dudeisbrendan03/RESTful-api```

## Setup basic settings
There is **no** need to use NPM at all when setting up the API (in fact a package.json shouldn't exist in master as it's only used for our automated tests). 

1. Open `config.json` with an editor of your choice
2. Change your production environment config to set your: ports, ssl certs, token settings and server settings (HTTPS will be disabled if no certs are configured, there has to be at least one service enabled for the script to run).
3. Start up your production server by running `NODE_ENV=production node .`

*More usage on how to setup handlers/requests will come later*