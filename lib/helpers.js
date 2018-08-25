//Helpers File

//Dependencies
var crypto = require('crypto');


//Helper Object
var helpers = {};

//ParseIntoJSON Method
helpers.parseIntoJSON = function(string){
	var output = {};
	try{
		output = JSON.parse(string);
	}
	catch(e){
		output = {};
	}
	return output;
};

//Function to hash a string
helpers.hash = function(string){
	var secret = "Pizza Secret Key";
	var hashed = crypto.createHmac('sha256',secret).update(string).digest('hex');
	return hashed;
};


//Function to generate random string
helpers.generateRandom = function(length){
	var allowedCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
	var randomString = "";
	for(var i=0;i<length;++i){
		var randomNumber = Math.floor(Math.random()*allowedCharacters.length);
		randomString += allowedCharacters.charAt(randomNumber);
	}
	return randomString;
};

//Exports
module.exports = helpers;