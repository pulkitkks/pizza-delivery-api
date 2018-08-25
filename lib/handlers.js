//Handler File

//Handler Object
var handlers = {};

handlers.userHandler = function(data,callback){
	callback(200,{"data" : data});
};


//Not Found Handler
handlers.notFoundHandler = function(data,callback){
	callback(404,{});
}

//Export
module.exports = handlers;