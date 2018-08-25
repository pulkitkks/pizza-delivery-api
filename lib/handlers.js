//Handler File

//Dependencies
var helpers = require('./helpers');
var _data = require("./data");

//Handler Object
var handlers = {};

//User Handler
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

//Token Handler
handlers.tokenHandler = function(data,callback){
	//Allowed Methods : GET,POST,PUT,DELETE
	var allowedMethods = ["get","post","put","delete"];
	if(allowedMethods.indexOf(data.method) > -1){
		//Call Specific Method
		handlers._tokens[data.method](data,callback);
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
//Token Container
handlers._tokens = {};


//GET users method
handlers._users.get = function(data,callback){
	//Login Mandatory
	//Get token_id
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Read Token Data
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify Expiration Time
				if(tokenData.expiration > Date.now()){
					var email = tokenData.email;
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
				}else{
					callback(401,{"Error" : "Token Expired, Login Again"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(401,{"Error" : "Login First"});
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
	//Login Mandatory
	//Get token_id
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Read Token Data
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify Expiration Time
				if(tokenData.expiration > Date.now()){
					var email = tokenData.email;
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
				}else{
					callback(401,{"Error" : "Token Expired, Login Again"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(401,{"Error" : "Login First"});
	}	
};


//DELETE user method
handlers._users.delete = function(data,callback){
	//Login Mandatory
	//Get token_id
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Read Token Data
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify Expiration Time
				if(tokenData.expiration > Date.now()){
					var email = tokenData.email;
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
				}else{
					callback(401,{"Error" : "Token Expired, Login Again"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(401,{"Error" : "Login First"});
	}
};



//GET /tokens method
handlers._tokens.get = function(data,callback){
	//Mandatory Parameters : token_id
	//Optional Paraneters : NONE
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Get Token Info
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				callback(200,tokenData);
			}else{
				callback(400,{"Error" : "Invalid Token"})
			}
		});
	}else{
		callback(400,{"Error" : "Missing Mandatory Parameters"});
	}
};


//POST /tokens method
handlers._tokens.post = function(data,callback){
	//Mandatory Parameters : Email,Password
	//Optional Parameters : NONE
	var email = typeof(data.payload.email) == "string" ? data.payload.email : false;
	var password = typeof(data.payload.password) == "string" ? data.payload.password : false;
	if(email && password){
		//Read Data associated with given user email
		_data.read("users",email,function(err,userData){
			if(!err && userData){
				//Verify provided password with hashed version
				if(helpers.hash(password) == userData.hashedPassword){
					//Generate Random token_id
					var token_id = helpers.generateRandom(20);
					var expiration = Date.now() + (10*60*1000);
					var tokenData = {
						"token_id" : token_id,
						"email" : email,
						"expiration" : expiration
					};
					//Save Token
					_data.create("tokens",token_id,tokenData,function(err){
						if(!err){
							callback(200,tokenData);
						}else{
							callback(500,{"Error" : "Couldn't Save Token Data"});
						}
					});
				}else{
					callback(400,{"Error" : "Invalid Credentials"});
				}
			}else{
				callback(400,{"Error" : "Invalid Email"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Mandatory Parameters"});
	}
};


//PUT /tokens method
handlers._tokens.put = function(data,callback){
	//Mandatory Parameters : token_id
	//Optional Parameters : NONE
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Read Token Data
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				var newExpiration = Date.now() + (10*60*1000);
				tokenData.expiration = newExpiration;
				//Save New Token Data
				_data.update("tokens",token_id,tokenData,function(err){
					if(!err){
						callback(200,tokenData);
					}else{
						callback(500,{"Error" : "Couldn't update token data"});
					}
				});
			}else{
				callback(400,{"Error" : "Invalid Token ID"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Mandatory Parameters"});
	}
};


//DELETE /tokens method
handlers._tokens.delete = function(data,callback){
	//Mandatory Parameters : token_id
	//Optional Parameters : NONE
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Read token
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Delete Token
				_data.delete("tokens",token_id,function(err){
					if(!err){
						callback(200);
					}else{
						callback(500,{"Error" : "Couldn't delete token"});
					}
				})
			}else{
				callback(400,{"Error" : "Invalid Token ID"});
			}
		});
	}else{
		callback(400,{"Error" : "Missing Mandatory Parameters"});
	}
};

//Export
module.exports = handlers;