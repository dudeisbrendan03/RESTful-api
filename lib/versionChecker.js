const https = require('https');
const url = require('url');
const fs = require('fs');
const { log } = require("../index");
https.get({ host: 'api.github.com', path: '/repos/dudeisbrendan03/RESTful-api/commits/master', headers: { 'User-Agent': 'request' } }, function (res) {
    let json = '';
    res.on('data', function (chunk) { json += chunk; });
    res.on('end', function () {
        var data = JSON.parse(json);
        const parseName = url.parse(data.html_url);
        const getPath = parseName.pathname;
        const formatPath = getPath.replace(/((?!\w+$).)/g, '');
        const ver = fs.readFileSync('.git/refs/heads/master').toString('utf-8')
        if (formatPath != ver.replace(/\n$/,'')) {
            log.error('AN UPDATE IS AVAILABLE. YOU SHOULD PULL CHANGES ASAP!')
            console.log(`\nCurrent version: ${ver}\nAvailable version: ${formatPath}`)
        }
    });
});
