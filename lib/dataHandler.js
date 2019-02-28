/*
 * Handle that data hombre
 * 
 * (Used for storing and editing data)
 * 
 */

const fs = require('fs');
const path = require('path');


//Define container for module
var lib = {};
//Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.tdat/');
console.log(lib.baseDir);
//Write data to a file
lib.create = function (dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fDescriptor) {//Open file to write
        if (!err && fDescriptor) {
            var sData = JSON.stringify(data);//Use stringify to make data a string

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
            console.log(err);
        }
    });
};

//Export module
module.exports = lib;