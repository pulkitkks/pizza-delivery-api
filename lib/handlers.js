//Handler File

//Dependencies
var helpers = require('./helpers');
var _data = require("./data");

//Handler Object
var handlers = {};

handlers.userHandler = function(data,callback){
	//Allowed Methods : GET,POST,PUT,DELETE
	var allowedMethods = ["get","post","put","delete"];
	if(allowedMethods.indexOf(data.method) > -1){
		//Call Specific Method
		handlers._users[data.method](data,callback);
	}else{
		callback(404);
	}
};


//Not Found Handler
handlers.notFoundHandler = function(data,callback){
	callback(404);
}


//Users Container
handlers._users = {};

//GET users method
handlers._users.get = function(data,callback){
	//Mandatory Parameters : Email
	//Optional Parameters : NONE
	var email = typeof(data.query.email) == "string" ? data.query.email : false;
	if(email){
		_data.read("users",email,function(err,userData){
			if(!err && userData){
				delete userData.hashedPassword;
				callback(200,userData);
			}else{
				callback(400,{"Error" : "Can't find user associated with given email"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Mandatory Parameters"});
	}
};	


//POST users method
handlers._users.post = function(data,callback){
	//Mandatory Parameters : Name,Email,Street Address
	//Optional Parameters : NONE
	var re = /\S+@\S+\.\S+/;
	var name = typeof(data.payload.name) == "string" ? data.payload.name.trim() : false;
	var email = typeof(data.payload.email) == "string" && re.test(data.payload.email) ? data.payload.email : false;
	var password = typeof(data.payload.password) == "string" && data.payload.password.length >= 5 ? data.payload.password : false;
	var streetAddress = typeof(data.payload.streetAddress) == "string" ? data.payload.streetAddress : false;
	if(name && email && streetAddress && password){
		//Create a user

		//Hash The Password before storing
		var hashedPassword = helpers.hash(password);

		var userObject = {
			"name" : name,
			"email" : email,
			"hashedPassword" : hashedPassword,
			"streetAddress" : streetAddress
		};

		//Store in database
		_data.create("users",userObject.email,userObject,function(err){
			if(!err){
				callback(200);
			}else{
				callback(400,{"Error" : "User can't be created, it may already exist"});
			}
		})
	} else{
		callback(400,{"Error" : "Missing Required Parameters"});
	}
};


//PUT users method
handlers._users.put = function(data,callback){
	//Mandatory Parameters : Email
	//Optional Parameters : Password,Name,Street Address
	var re = /\S+@\S+\.\S+/;
	var email = typeof(data.payload.email) == "string" && re.test(data.payload.email) ? data.payload.email : false;
	var name = typeof(data.payload.name) == "string" ? data.payload.name : false;
	var password = typeof(data.payload.password) == "string" && data.payload.password.length >= 5 ? data.payload.password : false;
	var streetAddress = typeof(data.payload.streetAddress) == "string" ? data.payload.streetAddress : false;
	if(email && (name || password || streetAddress)){
		//Fetch User associated with email provided
		_data.read("users",email,function(err,userData){
			if(!err && userData){
				//Update user data
				if(name){
					userData.name = name;
				}
				if(password){
					userData.hashedPassword = helpers.hash(password);
				}
				if(streetAddress){
					userData.streetAddress = streetAddress;
				}
				//Store updated data
				_data.update("users",email,userData,function(err){
					if(!err){
						callback(200);
					}else{
						callback(500,{"Error" : "Couldn't update user data"});
					}
				});
			}else{
				callback(400,{"Error" : "Couldn't read user data, it may not even exist"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Mandatory Parameters"});
	}
};


//DELETE user method
handlers._users.delete = function(data,callback){
	//Mandatory Parameters : Email
	//Optional Parameters : NONE
	var re = /\S+@\S+\.\S+/;
	var email = typeof(data.query.email) == "string" && re.test(data.query.email) ? data.query.email : false;
	if(email){
		//Delete User
		_data.delete("users",email,function(err){
			if(!err){
				callback(200);
			}else{
				callback(400,{"Error" : "Couldn't delete user, it may not even exist"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Mandatory Parameters"});
	}
};

//Export
module.exports = handlers;