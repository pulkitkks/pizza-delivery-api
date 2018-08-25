//File to Handle Data Functions

//Data JS

//Dependencies
var fs = require('fs');
var path = require('path');
var helpers = require("./helpers");


//Data Object
var data = {};

//Base Directory
var base_dir = path.join(__dirname,'../.data');

//Function to create new files
data.create = function(libname,filename,data,callback){
	//Open a file if it does not exist
	fs.open(base_dir + "/" + libname + "/" + filename + ".json","wx",function(err,fileDescryptor){
		if(!err && fileDescryptor){
			fs.writeFile(fileDescryptor,JSON.stringify(data),function(err){
				if(!err){
					callback(false);
				}else{
					callback("Couldn't write to newly created file");
				}
			});
		}else{
			callback("Error Opening new File either lib does not exist or file already exists");
		}
	});
};


//Function to update a already existing file
data.update = function(libname,filename,data,callback){
	//Open file for updating
	fs.open(base_dir + "/" + libname + "/" + filename + ".json","r+",function(err,fileDescryptor){
		if(!err && fileDescryptor){
			fs.truncate(fileDescryptor,function(err){
				if(err){
					callback("Error truncating file");
				}else{
					fs.writeFile(fileDescryptor,JSON.stringify(data),function(err){
						if(err){
							callback("Error writing to file in updation");
						}else{
							callback(false);
						}
					});
				}
			});
		}else{
			callback("Error opening file for updation file may not even exist");
		}
	});
};

//Function to read the contents of a file
data.read = function(libname,filename,callback){
	//Open a file for reading
	fs.open(base_dir + "/" + libname + "/" + filename + ".json","r",function(err,fileDescryptor){
		if(!err && fileDescryptor){
			fs.readFile(fileDescryptor,function(err,content){
				if(!err && content){
					callback(false,helpers.parseIntoJSON(content));
				}else{
					callback("Error Reading content of file");
				}
			});
		}else{
			callback("Couldn't open file for reading it may not exist");
		}
	});
};


//Function to delete a file
data.delete = function(libname,filename,callback){
	//Unlink the file from file system
	fs.unlink(base_dir + "/" + libname + "/" + filename + ".json",function(err){
		if(!err){
			callback(false);
		}else{
			callback("Error deleting file");
		}
	});
};

//Exports
module.exports = data;