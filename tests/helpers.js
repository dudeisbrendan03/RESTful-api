var supertest = require('supertest');  
var chai = require('chai');  
var uuid = require('uuid');  
var app = require('../index.js');

global.app = app;  
global.uuid = uuid;  
global.expect = chai.expect;  
global.request = supertest(app);  
