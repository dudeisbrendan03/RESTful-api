const supertest = require('supertest'), 
 chai = require('chai'), 
 uuid = require('uuid'),
 app = require('../index.js');

global.app = app;  
global.uuid = uuid;  
global.expect = chai.expect;  
global.request = supertest(app);  
