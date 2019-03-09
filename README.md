*Currently pretty inefficient*


# Another RESTful API

## What is this
A Node.JS based API that also functions as content delivery. It's main purpose is to provide authentication/ACL and also to deliver content like websites and application/* data

This is going to be used for an application I'm currently making.

## Usage
The application can be launched in multiple environment modes (this is still a WIP, going to introduce features into each environment like security features etc)

Using an environment:
`NODE_ENV=env-name node.`

The current env-name's in the project are:
- production (123.456.789.012:80/443)
- staging (0.0.0.0:8080/8081)

If there is no environment defined when starting the application then it defaults to staging

## Dependancies
None(ish)!

I have no imports, no need for a package.json or any dependacy management. But this *DOES* require Node 8.*.

## To-do
- Logging
- Change how the console displays requests and content
- Actually build the authentication part of the API, at the minute it may only deliver content (poorly) and make some simple RESTful requests. I haven't actually put mutch into the API yet.

### Credits
- [Igor Retesz](https://github.com/Superigi)