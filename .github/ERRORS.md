        
# Errors

## NO-DATA
You have failed to supply all the required data for the request


Will return: 400

## USER-EXISTS
You're trying to create a user when a user already exists.


Will return: 400

## AUTH-MATCHTOKEN
The token you provided couldn't be matched with an email you provided.


Will return: 401

## AUTH-BADTOKEN
The token you provided isn't valid, is expired or just isn't a token.


Will return: 401



## NOT-AUTHENTICATED
You need to be authenticated to use the function


Will return: 403

## NOT-AUTHENTICATED2
There was an attempt to login but it failed.


Will return: 403

## NOT-AUTHENTICATED3
There was an attempt to login but it failed because the user didn't have an operator flag.


Will return: 403

## USER-NOEXIST
The user in the query does not exist because an error occured and no user data was provided when searching for it.


Will return: 404

## NOT-ALLOWED
The method you attempted to use is not allowed on the function you chose. This will return the functions that you are available.


Will return: 405

## AUTH-EXPIREDTOKEN
The token you provided was expired. You can no longer renew this token, you can either remove it or let it automatically be removed.


Will return: 422

##AUTH-OPRENEW
The token you provided belong to an operator. You can not renew this token, you can either remove it or let it automatically be removed.


Will return: 422

## FATAL
If you recieve this error ***DO NOT*** open an issue until instructed by staff. This error could be levereged to create exploits that could be levereged to crash servers, damage networks or even steal data.


Please contact us in the same format you would create an issue [here (hey@thatspretty.cool)](mailto:hey@thatspretty.cool)


Will return: 500

*If you come accross this issue please report it and detailed instructions on how to reproduce*

## HASH-FAIL
Something went wrong while hashing and the server cannot continue.


Will return: 500

*If you come accross this issue please report it and detailed instructions on how to reproduce*

## * - An unknown error has occured
If the server returns 500 with no error code it means something has gone wrong, the server is not able to continue nor does it know what happened.

Will return: 500

*If you come accross this issue please report it and detailed instructions on how to reproduce*