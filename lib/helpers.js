//Helpers File

//Dependencies
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');


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


//Function to send mail via mailgun
helpers.sendMailGun = function(to,subject,body,callback){
	var payloadData = {
		"to" : to,
		"from" : "admin@sandboxe77cc017ef554872847f981c800824a2.mailgun.org",
		"subject" : subject,
		"text" : body
	}
	//Stringify payload
	var stringPayload = querystring.stringify(payloadData);

	//Configure Request Params
	var reqParams = {
		'protocol' : 'https:',
		"hostname" : "api.mailgun.net",
		"path" : "/v3/sandboxe77cc017ef554872847f981c800824a2.mailgun.org/messages",
		"method" : "POST",
		"headers" : {
			"Content-Type" : "application/x-www-form-urlencoded",
			"Authorization" : "Basic " + Buffer.from("api:39fa6758e8800adf11dbf2fa08cc6d9c-c1fe131e-ca573b56").toString("base64")
		}
	};

	//Request Object
	var req = https.request(reqParams,function(res){
		var statusCode = res.statusCode;
		if(statusCode == 200){
			callback(false);
		}else{
			callback('Status Code Returned Was ' + statusCode);
		}
	});
	req.on("error",function(e){
		callback("Error : " + e);
	});
	req.write(stringPayload);
	req.end();
};

//Exports
module.exports = helpers;