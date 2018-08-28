//Handler File

//Dependencies
var helpers = require('./helpers');
var _data = require("./data");
var querystring = require('querystring');
var https = require('https');

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

//Items Handler
handlers.itemsHandler = function(data,callback){
	//Allowed Methods : GET
	var allowedMethods = ["get"];
	if(allowedMethods.indexOf(data.method) > -1){
		//Call Specific Method
		handlers._items[data.method](data,callback);
	}else{
		callback(404);
	}
};

//Cart Handler
handlers.cartHandler = function(data,callback){
	//Allowed Methods : GET,POST,PUT,DELETE
	var allowedMethods = ["get","post","put","delete"];
	if(allowedMethods.indexOf(data.method) > -1){
		//Call Specific Method
		handlers._cart[data.method](data,callback);
	}else{
		callback(404);
	}
};


//Orders Handler
handlers.ordersHandler = function(data,callback){
	//Allowed Methods : GET,POST
	var allowedMethods = ["get","post"];
	if(allowedMethods.indexOf(data.method) > -1){
		//Call Specific Method
		handlers._orders[data.method](data,callback);
	}else{
		callback(404);
	}
};

//Not Found Handler
handlers.notFoundHandler = function(data,callback){
	callback(404);
};


//Users Container
handlers._users = {};
//Token Container
handlers._tokens = {};
//Items Container
handlers._items = {};
//Cart Container
handlers._cart = {};
//Orders Container
handlers._orders = {};


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
						_data.read("users",email,function(err,userData){
							if(!err && userData){
								var cart_id = typeof(userData.cart_id) == "string" && userData.cart_id.length > 0 ? userData.cart_id : false;
								_data.delete("users",email,function(err){
									if(!err){
										//Delete Cart if associated
										if(cart_id){
											_data.delete("carts",cart_id,function(err){
												if(!err){
													callback(200);
												}else{
													callback(400,{"Error" : "Couldn't delete cart associated"});
												}
											});
										}else{
											callback(200);
										}
									}else{
										callback(400,{"Error" : "Couldn't delete user, it may not even exist"});
									}
								});
							}else{
								callback(400,{"Error" : "Couldn't find user"});
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

//Global Items
var items = [
		{"item_code" : 1,"item_name" : "Margherita","item_description" : "Features tomatoes, sliced mozzarella, basil, and extra virgin olive oil.","small_price" : 300,"medium_price" : 400,"large_price" : 500},
		{"item_code" : 2,"item_name" : "Tikka Chicken pizza","item_description" : "Chicken tikka flavour pizza from India","small_price" : 320,"medium_price" : 430,"large_price" : 540},
		{"item_code" : 3,"item_name" : "Mexicana","item_description" : "tomato sauce, mozzarella, various recipes with minced beef, jalapeños, sweet corn, onion, spicy sauce and other hot ingredients","small_price" : 250,"medium_price" : 360,"large_price" : 420},
		{"item_code" : 4,"item_name" : "Peperoni","item_description" : "tomato sauce, mozzarella, peperoni","small_price" : 330,"medium_price" : 460,"large_price" : 510},
		{"item_code" : 5,"item_name" : "Vegetariana","item_description" : "tomato sauce, mozzarella, mushrooms, onion, (artichoke), sweet corn, green peppers,","small_price" : 370,"medium_price" : 420,"large_price" : 490}
	];


//GET /items method
handlers._items.get = function(data,callback){
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Verify that given token is associated with a user
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify that token has not expired
				if(tokenData.expiration > Date.now()){
					callback(200,items);
				}else{
					callback(400,{"Error" : "Expired Token"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(403,{"Error" : "Login First"});
	}
};


//GET /cart method
handlers._cart.get = function(data,callback){
	//Get Token
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Verify that given token id is associated with a user
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify that token has not expired
				if(tokenData.expiration > Date.now()){
					var email = tokenData.email;
					//Read user data
					_data.read("users",email,function(err,userData){
						if(!err && userData){
							var cart_id = typeof(userData.cart_id) == "string" ? userData.cart_id : false;
							if(cart_id){
								//Fetch Cart Items
								_data.read("carts",cart_id,function(err,cartData){
									if(!err && cartData){
										callback(200,cartData);
									}else{
										callback(500);
									}
								});
							}else{
								callback(200,[]);
							}
						}else{
							callback(500,{"Error" : "Internal Server Error Signup Again"});
						}
					});
				}else{
					callback(400,{"Error" : "Expired Token"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Login First"});
	}
};

//POST /cart method
handlers._cart.post = function(data,callback){
	//Mandatory Parameters : item_code,quantity,size
	//Optional Parameters : NONE

	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Check if token id is valid
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Check Expiration of token
				if(tokenData.expiration > Date.now()){
					var email = tokenData.email;

					//Get all item codes
					var item_codes = [];
					items.forEach(function(item){
						item_codes.push(item.item_code);
					});
					var item_code = typeof(data.payload.item_code) == "number" && item_codes.indexOf(data.payload.item_code) > -1 ? data.payload.item_code : false;
					var quantity = typeof(data.payload.quantity) == "number" && data.payload.quantity % 1 == 0 && data.payload.quantity > 0 && data.payload.quantity <= 5 ? data.payload.quantity : false;
					var size = typeof(data.payload["size"]) == "string" && ["small","medium","large"].indexOf(data.payload["size"]) > -1 ? data.payload["size"] : false;
					if(item_code && quantity && size){
						//Calculate Item Total
						var item = items[item_codes.indexOf(item_code)];
						var item_total = 0;
						if(size == "small"){
							item_total = item.small_price * quantity;
						}else if(size == "medium"){
							item_total = item.medium_price * quantity;
						}else{
							item_total = item.large_price * quantity;
						}

						//Check if user has a cart
						_data.read("users",email,function(err,userData){
							if(!err && userData){
								var cart_id = typeof(userData.cart_id) == "string" && userData.cart_id.length > 0 ? userData.cart_id : false;
								if(cart_id){
									//Add item to cart
									var cart_item = {
										"item_code" : item.item_code,
										"item_name" : item.item_name,
										"size" : size,
										"quantity" : quantity,
										"item_total" : item_total
									};

									//Fetch Cart
									_data.read("carts",cart_id,function(err,cartData){
										if(!err && cartData){
											//Push Item to Cart
											cartData.items.push(cart_item);
											//Save new cart
											_data.update("carts",cart_id,cartData,function(err){
												if(!err){
													callback(200,cartData);
												}else{
													callback(500,{"Error" : "Couldn't save updated cart"});
												}
											});
										}else{
											callback(500,{"Error" : "Cart could not be located"});
										}
									});

								}else{
									//Create a new cart for user
									cart_id = helpers.generateRandom(20);
									var cartObject = {
										"email" : email,
										"items" : []
									};
									var cart_item = {
										"item_code" : item.item_code,
										"item_name" : item.item_name,
										"size" : size,
										"quantity" : quantity,
										"item_total" : item_total
									};
									cartObject.items.push(cart_item);
									_data.create("carts",cart_id,cartObject,function(err){
										if(!err){
											//Associate cart with user
											userData.cart_id = cart_id;
											_data.update("users",email,userData,function(err){
												if(!err){
													callback(200,cart_item);
												}else{
													callback(500,{"Error" : "Couldn't update user"});
												}
											});
										}else{
											callback(400,{"Error" : "Couldn't create new cart try again"});
										}
									});
								}
							}else{
								callback(500);
							}
						});

					}else{
						callback(400,{"Error" : "Missing Mandatory Parameters"});
					}
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(403,{"Error" : "Login First"});
	} 
};


//PUT /cart method
handlers._cart.put = function(data,callback){
	//Mandatory Parameters : token_id,item_code
	//Optional Paramaters : size,quantity
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Verify that given token ID is associated with a user
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify that the token has not expired
				if(tokenData.expiration > Date.now()){
					var email = tokenData.email;
					//Get CartID
					_data.read("users",email,function(err,userData){
						if(!err && userData){
							var cart_id = typeof(userData.cart_id) == "string" && userData.cart_id.length > 0 ? userData.cart_id : false;
							if(cart_id){
								//Get item_code
								var item_code = typeof(data.payload.item_code) == "number" ? data.payload.item_code : false;
								var size = typeof(data.payload["size"]) == "string" && ["small","medium","large"].indexOf(data.payload["size"]) > -1 ? data.payload["size"] : false;
								var quantity = typeof(data.payload.quantity) == "number" && data.payload.quantity % 1 == 0 && data.payload.quantity > 0 && data.payload.quantity <= 5 ? data.payload.quantity : false;
								if(item_code && (size || quantity)){
									//Fetch cart
									_data.read("carts",cart_id,function(err,cartData){
										if(!err && cartData){
											var items_array = typeof(cartData.items) == "object" && cartData.items instanceof Array ? cartData.items : false;
											if(items_array){
												var found = false;
												//Get Item with provided item_code
												items_array.forEach(function(item){
													if(item.item_code == item_code && found == false){
														found = true;
														if(size){
															item["size"] = size;
														}
														if(quantity){
															item.quantity = quantity;
														}
														var item_codes = [];
														items.forEach(function(i){
															item_codes.push(i.item_code);
														});
														item.item_total = items[item_codes.indexOf(item_code)][size + "_price"] * quantity;
													}
												});
												if(found == true){
													cartData.items = items_array;
													_data.update("carts",cart_id,cartData,function(err){
														if(!err){
															callback(200,cartData);
														}else{
															callback(400,{"Error" : "Couldn't save updated cart"});
														}
													});
												}else{
													callback(400,{"Error" : "Couldn't find item in the cart"});
												}
											}else{
												callback(400,{"Error" : "Empty Cart"});
											}
										}else{
											callback(500,{"Error" : "Couldn't get cart data"});
										}
									});
								}else{
									callback(400,{"Error" : "Missing Mandatory Parameters"});
								}
							}else{
								callback(400,{"Error" : "Empty Cart"});
							}
						}else{
							callback(500,{"Error" : "User not found"});
						}
					});
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(403,{"Error" : "Login First"});
	}
};

//DELETE /cart method
handlers._cart.delete = function(data,callback){
	//Mandatory Parameters : token_id,item_code
	//Optional Paramaters : NONE
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Verify that a user is associated with given token
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify that is token has not expired
				if(tokenData.expiration > Date.now()){
					//Check if user has a cart
					var email = tokenData.email;
					_data.read("users",email,function(err,userData){
						if(!err && userData){
							if(userData.cart_id){
								//Read Contents of cart
								var cart_id = userData.cart_id;
								_data.read("carts",cart_id,function(err,cartData){
									if(!err && cartData){
										if(cartData.items.length > 0){
											var item_code = typeof(data.query.item_code) == "string" ? data.query.item_code : false;
											item_code = parseInt(item_code);
											if(item_code){
												var item_codes = [];
												cartData.items.forEach(function(i){
													item_codes.push(i.item_code);
												});
												//Check if given item_code is in cart
												if(item_codes.indexOf(item_code) > -1){
													//Remove item from cart
													var indexToBeRemoved = item_codes.indexOf(item_code);
													cartData.items.splice(indexToBeRemoved,1);
													//Save to Database
													_data.update("carts",cart_id,cartData,function(err){
														if(!err){
															callback(200,cartData);
														}else{
															callback(400,{"Error" : "Couldn't save updated cart"});
														}
													});
												}else{
													callback(400,{"Error" : "Invalid item_code"});
												}
											}else{
												callback(400,{"Error" : "Missing Mandatory Parameters"});
											}
										}else{
											callback(400,{"Error" : "Empty Cart"});
										}
									}else{
										callback(400,{"Error" : "Cart not found"});
									}
								});
							}else{
								callback(400,{"Error" : "Empty Cart"});
							}
						}else{
							callback(400,{"Error" : "Invalid Token, Login Again"});
						}
					});
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(403,{"Error" : "Login First"});
	}
};


//GET /orders method
handlers._orders.get = function(data,callback){
	//Mandatory Parameters : token_id
	//Optional Parameters : NONE
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Verify that given token is associated with a user
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Check that token has not expired
				if(tokenData.expiration > Date.now()){
					//Get all orders associated with user
					var email = tokenData.email;
					_data.read("users",email,function(err,userData){
						if(!err && userData){
							var orders = typeof(userData.orders) == "object" && userData.orders instanceof Array ? userData.orders : false;
							if(orders){
								//Ouput object
								var output = [];
								var count = 0;
								orders.forEach(function(order_id){
									count ++;
									_data.read("orders",order_id,function(err,orderData){
										if(!err && orderData){
											console.log(orderData);
											output.push(orderData);
											if(count == orders.length){
												callback(200,output);
											}
										}else{
											console.log("Error Reading one of the order's data");
										}
									});
								});
							}else{
								callback(200,[]);
							}
						}else{
							callback(500,{"Error" : "Couldn't read user data"});
						}
					});
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Login First"});
	}
};


//POST /orders method
handlers._orders.post = function(data,callback){
	//Mandatory Parameters : token_id
	//Optional Parameters : NONE
	var token_id = typeof(data.headers.token_id) == "string" ? data.headers.token_id : false;
	if(token_id){
		//Verify that given token is associated with a user
		_data.read("tokens",token_id,function(err,tokenData){
			if(!err && tokenData){
				//Verify that token has not expired
				if(tokenData.expiration > Date.now()){
					//Check user cart
					var email = tokenData.email;
					_data.read("users",email,function(err,userData){
						if(!err && userData){
							var cart_id = typeof(userData.cart_id) == "string" && userData.cart_id.length > 0 ? userData.cart_id : false;
							if(cart_id){
								_data.read("carts",cart_id,function(err,cartData){
									if(!err && cartData){
										var items = typeof(cartData.items) == "object" && cartData.items instanceof Array && cartData.items.length > 0 ? cartData.items : false;
										if(items){
											var order_id = helpers.generateRandom(20);
											
											//Calculate Order Total
											var order_total = 0;
											items.forEach(function(i){
												order_total += i.item_total; 
											});

											var orderObject = {
												"order_id" : order_id,
												"email" : email,
												"name" : userData.name,
												"streetAddress" : userData.streetAddress,
												"items" : items,
												"order_total" : order_total
											};
											//Initiate a payment
											var reqPayload = {
												"amount" : order_total*100,
												"currency" : "inr",
												"source" : "tok_mastercard",
												"description" : "Order_ID : " + order_id + " By : " + email
											};
											var stringPayload = querystring.stringify(reqPayload);
											var requestParams = {
												'protocol' : 'https:',
												'hostname' : 'api.stripe.com',
												'path' : '/v1/charges',
												'method' : 'POST',
												'headers' : {
													'Content-Type' : 'application/x-www-form-urlencoded',
													'Authorization' : 'Bearer  sk_test_JaerAizcmzHzEoIdtC2FC0mF'
												}
											};
											//Req object
											var req = https.request(requestParams,function(res){
												var statusCode = res.statusCode;
												if(statusCode == 200){
													//Save order
													_data.create("orders",order_id,orderObject,function(err){
														if(!err){
															//Empty user cart
															delete userData["cart_id"];
															//Asociate orders with user
															if(typeof(userData.orders) == "object" && userData.orders instanceof Array){
																userData.orders.push(order_id);
															}else{
																userData.orders = [order_id];
															}
															_data.update("users",email,userData,function(err){
																if(!err){
																	_data.delete("carts",cart_id,function(err){
																		if(!err){
																			callback(200,orderObject);
																		}else{
																			callback(500,{"Error" : "Couldn't remove cart from database"});
																		}
																	});
																}else{
																	callback(500,{"Error" : "Couldn't empty user cart"});
																}
															});
														}else{
															callback(400,{"Error" : "Couldn't save order"});
														}
													});
												}else{
													callback(200,{"Error" : "Payment Unsucessful"});
												}
											});
											req.on('error',function(e){
												callback(400,{"Error" : e});
											});
											req.write(stringPayload);
											req.end();
										}else{
											callback(400,{"Error" : "Empty Cart"});
										}
									}else{
										callback(500,{"Error" : "Couldn't read cart data"});
									}
								});
							}else{
								callback(400,{"Error" : "Empty Cart"});
							}
						}else{
							callback(500,{"Error" : "Couldn't read user data"});
						}
					});
				}else{
					callback(400,{"Error" : "Token Expired"});
				}
			}else{
				callback(400,{"Error" : "Invalid Token"});
			}
		});
	}else{
		callback(400,{"Error" : "Login First"});
	}
};

//Export
module.exports = handlers;