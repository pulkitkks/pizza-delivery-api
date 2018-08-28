//Main Index JS File

//Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require("./lib/handlers");
var _data = require("./lib/data");
var helpers = require("./lib/helpers");



//Create a server
var server = http.createServer(function(req,res){

	//Get Request Parameters
	var parsedUrl = url.parse(req.url,true);
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');
	var queryObject = parsedUrl.query;
	var headers = req.headers;
	var method = req.method;

	//Get Payload Data

	//Buffer to store data
	var buffer = "";
	//Decoder Object
	var decoder = new StringDecoder('utf-8');
	req.on('data',function(data){
		buffer += decoder.write(data);
	});

	req.on("end",function(){
		//Form Payload Object
		var data = {
			"path" : trimmedPath,
			"query" : queryObject,
			"payload" : helpers.parseIntoJSON(buffer),
			"headers" : headers,
			"method" : method.toLowerCase()
		};

		//Handle Different Requests
		var chosenHandler = typeof(router[trimmedPath]) != "undefined" ? router[trimmedPath] : handlers.notFoundHandler;
		chosenHandler(data,function(statusCode,responseData){
			var output = typeof(responseData) == "object" ? responseData : {};
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(JSON.stringify(output));
		});
	});
	
});

//Router Object
var router = {
	"users" : handlers.userHandler,
	"tokens" : handlers.tokenHandler,
	"items" : handlers.itemsHandler,
	"cart" : handlers.cartHandler,
	"orders" : handlers.ordersHandler
};


//Listen to port
server.listen(3000,function(){
	console.log("Server started on port 3000");
})
