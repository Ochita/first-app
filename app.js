var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var config = require('config');
//var ejs = require('ejs');
var routes = require('./routes');
var dl = require('delivery');
//var multipart = require('multipart');
//var sys = require('sys');
//var SocketIOFileUploadServer = require("socketio-file-upload");

//MONGODB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/data');

var homepage="http://localhost:3001";

var app = express();
app.set('views',__dirname+'/templates');
app.set('view engine','jade');	//!!!!!JADE

//app.use(express.urlencoded());// то, что стало вместо bodyParser
app.use(express.bodyParser({uploadDir:'./templates/img'}));
app.use(express.cookieParser());
//app.use(express.session());
app.use(app.router);

app.use("/styles", express.static(__dirname + '/templates/stylesheets'));
app.use("/images",express.static(__dirname+'/templates/img'));
app.use("/js",express.static(__dirname+'/templates/js'));
app.use("/modules",express.static(__dirname+'/node_modules/'));

app.get('/', routes.tohome(db,homepage));
app.get('/admin',routes.adminka(db,homepage));
app.get('/admin/zhaluzi-types',routes.admin_zhaluzi(db,homepage));
app.get('/admin/zhaluzi-positions',routes.admin_louvers(db,homepage));
app.get('/admin/rollers-types',routes.admin_rollers(db,homepage));
app.get('/admin/rollers-positions',routes.admin_rollers0(db,homepage));
app.get('/admin/orders',routes.admin_orders(db,homepage));

app.use(express.static(path.join(__dirname,'../public')));	//я не знаю, что это и зачем, надо будет погуглить

server = http.createServer(app).listen(config.get('port'), function(homepage)
{
	console.log('Express server listening on port ' + config.get('port'));
	homepage = "http://"+this.address().address+":"+this.address().port;
	console.log("homepage = "+homepage);
});
//SocketIOFileUploadServer.listen(server);

var io = require('socket.io').listen(server);
io.set('log level', 1);

io.sockets.on('connection', function (socket) 
{
	var delivery = dl.listen(socket);
	  delivery.on('receive.success',function(file){

	    fs.writeFile(file.name,file.buffer, function(err){
	      if(err){
	        console.log('File could not be saved.');
	      }else{
	        console.log('File saved.');
	      };
	    });
	  });
	socket.on('newOrder', function (msg) 
	{
		routes.addOrder(db,msg.contact_name,msg.contact_mail,msg.contact_phone,
			msg.contact_address,msg.contact_data,msg.contact_message);
	});
	socket.on('newLouversType',function(msg)
	{
		routes.addLType(db,msg.name,msg.adress,msg.description,socket);
	});
	socket.on('newRollersType',function(msg)
	{
		routes.addRType(db,msg.name,msg.adress,msg.description,socket);
	});
	socket.on('deleteOrder', function (msg,error) 
	{
		routes.delOrder(db,msg.order_id,error);
		if(!error) socket.emit('delOrderOk');
	});
	socket.on('deleteLouverType', function (msg,error) 
	{
		routes.delType(db,'louvers_type',msg.type_id,error);
		if(!error) socket.emit('delLTypeOk');		//пока что без проверок на правильность удаления
	});
	socket.on('deleteRollerType', function (msg,error) 
	{
		routes.delType(db,'rollers_type',msg.type_id,error);
		if(!error) socket.emit('delRTypeOk');		//пока что без проверок на правильность удаления
	});
	socket.on('getLTypeInfo',function (msg)
	{
		routes.sendInfo(db,'louvers_type',msg.type_id,socket);
	})
	socket.on('editLouversType',function(msg)
	{
		routes.editType(db,'louvers_type',msg.oldname,msg.name,msg.adress,msg.description,socket);
	});
	socket.on('getRTypeInfo',function (msg)
	{
		routes.sendInfo(db,'rollers_type',msg.type_id,socket);
	})
	socket.on('editRollersType',function (msg)
	{
		routes.editType(db,'rollers_type',msg.oldname,msg.name,msg.adress,msg.description,socket);
	});
});

//http.createServer(app).listen(3001,'128.73.218.95/');
