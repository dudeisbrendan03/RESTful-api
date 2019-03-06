/*
 * Handle that data hombre
 * 
 * (Used for storing and editing data)
 * 
 */

const fs = require('fs'),
    path = require('path'),
    etc = require('./etc');


//Define container for module
const lib = {};
//Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.tdat/');
console.log(lib.baseDir);
//Write data to a file
lib.create = function (dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fDescriptor) {//Open file to write
        if (!err && fDescriptor) {
            const sData = JSON.stringify(data);//Use stringify to make object a string

            fs.writeFile(fDescriptor, sData, function (err) {
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
            const pData = etc.safePJS(data);
            callback(false,pData);//if no error then format and return data
        } else {
            callback(err, data);//if error then return raw and error
        }
    });
};

//Update data in a file
lib.update = function (dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fDesc) {
        if (!err && fDesc) {
            const sData = JSON.stringify(data);//Use stringify to make object a string
            //Use truncate to make sure we don't overwrite existing content.
            fs.truncate(fDesc, function (err) {
                //write and close file
                fs.writeFile(fDesc, sData, function (err) {
                    if (!err) {
                        fs.callback(fDesc, function (err) {
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
};

//Delete a file
lib.delete = function (lib, file, bacllback) {
    fs.unlink(ib.baseDir + dir + '/' + file + '.json', function (err) {
        if (!err) {
            callback(false);
        } else {
            callback('IOP fail: Could not delete file');
        }
    });
};
//Export module
module.exports = lib;