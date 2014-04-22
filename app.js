var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var config = require('config');
var routes = require('./routes');
var hash = require('./pass').hash; 
var formidable = require('formidable');
var util = require('util');

//MONGODB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/data');

var homepage="http://localhost:3001";

var app = express();
app.set('views',__dirname+'/templates');
app.set('view engine','jade');	//!!!!!JADE

app.use(express.urlencoded());// то, что стало вместо bodyParser
//app.use(express.bodyParser({uploadDir:'./templates/img'}));
app.use(express.cookieParser('shhhh, very secret')); 
app.use(express.session());
//app.use(app.router);

//авторизация
app.use(function(req, res, next)
{
  var err = req.session.error
    , msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});     

var users = {Thor:{name:'Thor'}};
hash('111', function(err, salt, hash)
{
  if (err) throw err;
  // store the salt & hash in the "db"
  users.Thor.salt = salt;
  users.Thor.hash = hash.toString();
});

function authenticate(name, pass, fn) 
{
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying the hash against the pass / salt, if there is a match we found the user
  hash(pass, user.salt, function(err, hash)
  {
    if (err) return fn(err);
    if (hash.toString() == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  })
};

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.post('/login', function(req, res)
{
  authenticate(req.body.username, req.body.password, function(err, user)
  {
    if (user) 
    {
      // Regenerate session when signing in to prevent fixation
      req.session.regenerate(function()
      {
        // Store the user's primary key in the session store to be retrieved, or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name + ' click to <a href="/logout">logout</a>. You may now access <a href="/admin">/admin</a>.';
        res.redirect('/admin');
      });
    } 
    else 
    {
      req.session.error = 'Authentication failed, please check your  username and password.';
      res.redirect('login');
    }
  });
});     
//end!

app.use("/styles", express.static(__dirname + '/templates/stylesheets'));
app.use("/images",express.static(__dirname+'/templates/img'));
app.use("/js",express.static(__dirname+'/templates/js'));
app.use("/modules",express.static(__dirname+'/node_modules/'));

app.get('/', routes.tohome(db,homepage));
app.get('/zhaluzi/:lname', routes.itemslist(db,homepage,"louverslist","louvers"));
app.get('/rolstavni/:lname', routes.itemslist(db,homepage,"rollerslist","rollers"));
app.get('/aboutCompany',routes.aboutCMP(db,homepage));
app.get('/contacts',routes.contacts(db,homepage));

app.get('/admin', restrict, routes.adminka(db,homepage));
app.get('/admin/zhaluzi-types', restrict,routes.admin_zhaluzi(db,homepage));
app.get('/admin/zhaluzi-positions', restrict,routes.admin_louvers(db,homepage));
app.get('/admin/rollers-types', restrict,routes.admin_rollers(db,homepage));
app.get('/admin/rollers-positions', restrict,routes.admin_rollers0(db,homepage));
app.get('/admin/orders', restrict,routes.admin_orders(db,homepage));
app.get('/admin/images', restrict,routes.admin_images(db,homepage));
app.get('/login',routes.toCMS(db,homepage));

//app.get('/admin/load_:image',restrict,routes.load_image(db,homepage));
app.post('/admin/upload_:image',restrict, function(req, res)
{
	var name = req.params.image+'.jpg';
	console.log(name);
	var form = new formidable.IncomingForm({ uploadDir:__dirname+'/templates/img/catalog'});
	form.on('end', function() {
            console.log('-> upload done');
        });
	form.on('file', function(field, file) {
		fs.rename(file.path, form.uploadDir + "/" + name);
        })
	form.parse(req, function(err, fields, files) 
	{
    	//res.redirect(homepage+'/admin/images');
    	res.redirect('back');
    });
});

app.use(express.static(path.join(__dirname,'../public')));	//я не знаю, что это и зачем, надо будет погуглить

server = http.createServer(app).listen(config.get('port'), function(homepage)
{
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
	socket.on('newLouversType',function(msg)
	{
		routes.addType(db,'louvers_type',msg.name,msg.adress,msg.description,socket);
	});
	socket.on('newRollersType',function(msg)
	{
		routes.addType(db,'rollers_type',msg.name,msg.adress,msg.description,socket);
	});
	socket.on('newRollers',function(msg)
	{
		routes.addRoller(db,msg,socket);
	});
	socket.on('newLouvers',function(msg)
	{
		routes.addLouver(db,msg,socket);
	});
	socket.on('deleteOrder', function (msg,error) 
	{
		routes.delOrder(db,msg.order_id,error);
		if(!error) socket.emit('delOrderOk');
	});
	socket.on('deleteLouverType', function (msg,error) 
	{
		routes.delType(db,'louvers_type',msg.type_id,error);
		if(!error) socket.emit('delTypeOk');		//пока что без проверок на правильность удаления
	});
	socket.on('deleteRollerType', function (msg,error) 
	{
		routes.delType(db,'rollers_type',msg.type_id,error);
		if(!error) socket.emit('delTypeOk');		//пока что без проверок на правильность удаления
	});
	socket.on('deleteRollers', function (msg,error) 
	{
		routes.delType(db,'rollers',msg.type_id,error);
		if(!error) socket.emit('delSortOk');		//пока что без проверок на правильность удаления
	});
	socket.on('deleteLouvers', function (msg,error) 
	{
		routes.delType(db,'louvers',msg.type_id,error);
		if(!error) socket.emit('delSortOk');		//пока что без проверок на правильность удаления
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
		socket.emit('editTypeOk');	
	});
	socket.on('getRInfo',function (msg)
	{
		routes.sendRInfo(db,'rollers',msg.item_id,socket);
	})
	socket.on('editRollers',function (msg)
	{
		routes.editRollers(db,'rollers',msg,socket);
		socket.emit('editSortOk');
	});
	socket.on('getLInfo',function (msg)
	{
		routes.sendLInfo(db,'louvers',msg.item_id,socket);
	})
	socket.on('editLouvers',function (msg)
	{
		routes.editLouvers(db,'louvers',msg,socket);
		socket.emit('editSortOk');
	});
	socket.on('newCompanyInfo',function(msg)
	{
		routes.editCompanyInfo(db,'information',msg,socket);
	});
	socket.on('newContacts',function(msg)
	{
		routes.editContacts(db,'information',msg,socket);
	});
});

//http.createServer(app).listen(3001,'128.73.218.95/');
