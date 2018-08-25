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

//Exports
module.exports = helpers;