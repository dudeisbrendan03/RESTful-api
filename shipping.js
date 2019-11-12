/* This file will contain data about a specific version */

let shipping = {};

/*Consistent data between all version of a single project*/

shipping.project = {
    "name": "NJSAPIPROJ",
    "url": "https://github.com/dudeisbrendan03/RESTful-api"
};

/*Version data*/

shipping.version = {
    "version": "v0.3.DEV",
    "release": false
};

//Do not remove this information, it is used to let users check the original version of the software so they can check for security vunerabilities that may expose their data. This allows users to protect themselves and their data. This is also used to credit ourselves (the creators). If you remove this and don't tell the useres you have modified the software on top of not disclosing the original creatores you will be breaking the license included in this project and we may legally pursue you.
shipping.source = {
    "version": "v0.3.DEV",
    "release": false,
    "git": "https://github.com/dudeisbrendan03/RESTful-api.git",
    "url": "https://github.com/dudeisbrendan03/RESTful-api",
    "latest-stable-version": "https://api.thatspretty.cool/instance"
};

module.exports = shipping;