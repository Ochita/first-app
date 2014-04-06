var express = require('express');
var http = require('http');
var path = require('path');
var config = require('config');
var ejs = require('ejs');
var routes = require('./routes');

//MONGODB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/data');

var homepage="";

var app = express();
app.set('views',__dirname+'/templates');
app.set('view engine','jade');	//!!!!!JADE

app.use(express.urlencoded());// то, что стало вместо bodyParser
app.use(express.cookieParser());
app.use(app.router);

app.use("/styles", express.static(__dirname + '/templates/stylesheets'));
app.use("/images",express.static(__dirname+'/templates/img'));
app.use("/js",express.static(__dirname+'/templates/js'));
app.use("/modules",express.static(__dirname+'/node_modules/'));

app.get('/', routes.tohome(db,homepage));
app.get('/admin',routes.adminka(db,homepage));
app.get('/admin/zhaluzi',routes.admin_zhaluzi(db,homepage));
app.get('/admin/orders',routes.admin_orders(db,homepage));

app.use(express.static(path.join(__dirname,'../public')));	//я не знаю, что это и зачем, надо будет погуглить

server = http.createServer(app).listen(config.get('port'), function(){
  console.log('Express server listening on port ' + config.get('port'));
homepage = "http://"+this.address().address+":"+this.address().port;
console.log("homepage = "+homepage);
});

var io = require('socket.io').listen(server);
io.set('log level', 1);

io.sockets.on('connection', function (socket) 
{
	socket.on('newOrder', function (msg) 
	{
		routes.addOrder(db,msg.contact_name,msg.contact_mail,msg.contact_phone,
			msg.contact_address,msg.contact_data,msg.contact_message);
	});
});

//http.createServer(app).listen(3001,'128.73.218.95/');
