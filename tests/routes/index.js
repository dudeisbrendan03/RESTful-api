var supertest = require('supertest');  
var chai = require('chai');  
var app = require('../../index.js');

global.app = app;
global.expect = chai.expect;  
global.request = supertest(app);  
global.object = [{
            "fName":"demo",
            "lName":"rest",
            "password":"@ASDA3gah45",
            "tos":true,
            "mobile":"+441298751835",
            "email":"asd@asd.nasd"
        }, {
            "email":"asd@asd.nasd",
            "password":"@ASDA3gah45"
        }];

describe('Check API routes', function() {  
    //ping test
    describe(' - /ping - Test if server is up', function() {
        it('(GET /ping)', function(done) {
            request.get('/ping')
                .expect(204)
                .end(function(err, res) {
                    done(err);
                });
        });
    });


    //Creates a user successfully, and fails once
    describe(' - /user - create, get', function() {
        // create user successfuly
        it('(POST /user)', function(done) {
            var task = global.object[0];
            request.post('/user')
                .send(task)
                .expect(204)
                .end(function(err, res) {
                    done(err);
                });
        });

        // fail creating user due to missing data
        //it('(POST /user) [fail]', function(done) {
         //   var task = {"fName":"demo","lName":"rest", "password":"3gah45","tos":false, "mobile":"+441298751835","email":"asd@asd.nasd"};
        //    request.post('/user')
          //      .send(task)
         //       .expect(400)
        //        .end(function (err, res) {
          //          done(err);
         //       });
        //});
        
        // Testing the status 404 for task not found
        it('(GET /user) [info]', function(done) {
            var task = global.object[0];
            request.post(`/user/?email=${task.email}`)
                .expect(200, {
            "fName":"demo",
            "lName":"rest",
            "tos":true,
            "mobile":"+441298751835",
            "email":"asd@asd.nasd"
                })
                .end(function (err, res) {
                    done(err);
                });
        });
    });

    // Test tokens
    describe(' - /auth - create, get, delete', function() {
        it('(POST /auth) [create]', function(done) {
            var task = global.object[1];
            request.put('/auth')
                .send(task)
                .expect(200)
                .end(function(err, res) {
                    expect(function(res){
                    });
                    done(err);
                });
        });

        before(function(done) {
            var task = global.object[1];
            request.post('/auth')
                .send(task)
                .end(function(err, res) {
                    token = res.body.token;
                    done();
                });
        });

        it('(GET /auth) - test token', function(done) {
            request.get('/auth?token='+token)
                .expect(200)
                .end(function(err, res) {
                    expect(function(res){
                        if (!('token' in res.body)) throw new Error("No token");
                        if (!('email' in res.body)) throw new Error("No email");
                        if (!('expires' in res.body)) throw new Error("No expires");
                    });
                    done(err);
                });
        });

        it('(DELETE /token)', function(done) {
            request.delete('/auth/?token=' + token)
                .expect(204)
                .end(function (err, res) {
                    done(err);
                });
        }); 
    });

    //delete user
    describe(' - Delete user', function() {
        it('(DELETE /user)', function(done) {
            var task = global.object[0];
            request.delete('/user/?email=' + task.email)
                .expect(204)
                .end(function (err, res) {
                    done(err);
                });
        });

        
    });
});
