/*
 * Object based data handling
 * 
 * 
 * Handle that data hombre
 * (Used for storing and editing data)
 * 
 */

const fs = require('fs'),
    path = require('path'),
    aesCryp = require('./cipher'),
    config = require('../config');

//Can't import from etclib or we get circular dependancy (can't use any functions from either modules)
function safePJS(obj) {
    try {
        var parsed = JSON.parse(obj);
    } catch (e) {
        parsed = {};
    }
    return parsed;
}

//Define container for module
const lib = {};
//Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.tdat/');

//Write data to a file
lib.create = function (dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fDescriptor) {//Open file to write
        if (!err && fDescriptor) {
            const sData = JSON.stringify(data);//Use stringify to make object a string

            //Should data be encrypted?
            if (config.aesEnabled) {
                var fData = aesCryp.encrypt(config.cryptoSecret, sData);
            } else {
                var fData = sData;
            }
            fs.writeFile(fDescriptor, fData, function (err) {
                if (!err) {
                    fs.close(fDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('IOP fail: Could not close file');
                        }
                    });
                } else {
                    callback('IOP fail: Error writing to file');
                }
            });
        } else {
            callback('IOP fail: Failed to create file.');
            //console.log(err);
        }
    });
};

//Read data from a file
lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        if (!err && data) {
            //Should data be encrypted?
            if (config.aesEnabled) {
                var fData = aesCryp.decrypt(config.cryptoSecret, data);
            } else {
                var fData = data;
            }
            const pData = safePJS(fData);
            callback(false,pData);//if no error then format and return data
        } else {
            callback(err, data);//if error then return raw and error
        }
    });
};


//Update data from an encrypted file synchronously (this is a shitty idea)
lib.syncUpdate = function (dir, file, data, callback) {
};

//Update data in a file
lib.update = function (dir, file, data, callback) {
    if (config.aesEnabled) {
        fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', function (err, encryptedData) {
            //const decryptedData = aesCryp.decrypt(config.cryptoSecret, String(encryptedData));

            fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fDesc) {
                if (!err && fDesc) {
                    const fData = aesCryp.encrypt(config.cryptoSecret, JSON.stringify(data));
                    fs.truncate(fDesc, function (err) {
                        fs.writeFile(fDesc, fData, function (err) {
                            if (!err) {
                                fs.close(fDesc, function (err) {
                                    if (!err) {
                                        callback(false);
                                    } else {
                                        callback('IOP fail: Could not close file');
                                    }
                                });
                            } else {
                                callback('IOP: Error updating');
                            }
                        });
                    });
                }
            });
        });
    } else {
        fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fDesc) {
            if (!err && fDesc) {
                const sData = JSON.stringify(data);//Use stringify to make object a string
                //Use truncate to make sure we don't overwrite existing content.
                fs.truncate(fDesc, function (err) {
                    //write and close file
                    fs.writeFile(fDesc, sData, function (err) {
                        if (!err) {
                            fs.close(fDesc, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('IOP fail: Could not close file');
                                }
                            });
                        } else {
                            callback('IOP: Error updating');
                        }
                    });
                });
            } else {
                callback('IOP fail: Can not open file to write');
            }
        });
    }
};

//Delete a file
lib.delete = function (dir, file, callback) {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
        if (!err) {
            callback(false);
        } else {
            callback('IOP fail: Could not delete file');
        }
    });
};
//Export module
module.exports = lib;