'use strict';

// Scrip para cargar el usuario internalUser en la base de datos de mongo
//
//      mongo loadInitialData.js
//
load('./config.js');

var strDBConn=module.exports.database;
var user, passwd, url;


var re = /mongodb:\/\/(\w+)\:(\w+)@(.+)/i
var arrMatch=strDBConn.match(re);
if (arrMatch.length == 4) {
    user = arrMatch[1];
    passwd = arrMatch[2];
    url = arrMatch[3];
}

var db = connect(url, user, passwd);

// Add internal User
var result = db.users.insert(
{
    "mail": "internalUser@localhost",
    "password": "",
    "active": false,
    "username": "internalUser",
});
print (result);
