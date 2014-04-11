function Player(ID,name)
{
	this.ID = ID;
	this.name = name;
}

function Vs(ID1,ID2)
{
	this.P1 = ID1;
	this.P2 = ID2;
	this.now = 0;	//текущий игрок
}

function GetOpponent(ID)
{
	for (var i=0;i<pairs.length;i++)
	{
		if (pairs[i]!=undefined)
		{
			if (pairs[i].P1.ID===ID) return sockets0[pairs[i].P2.ID];
			if (pairs[i].P2.ID===ID) return sockets0[pairs[i].P1.ID];
		}
	}
	return null;
}

function GetName(ID)
{
	for (var i=0;i<pairs.length;i++)
	{
		if (pairs[i]!=undefined)
		{
			if (pairs[i].P1.ID===ID) return pairs[i].P1.name;
			if (pairs[i].P2.ID===ID) return pairs[i].P2.name;
		}
	}
	return null;
}

// Подключаем модуль и ставим на прослушивание 8080-порта - 80й обычно занят под http-сервер
var io = require('socket.io').listen(2222); 
var pairs = [];
var waiting = null;
var sockets0 = {};
// Отключаем вывод полного лога - пригодится в production'е
 io.set('log level', 1);
// Навешиваем обработчик на подключение нового клиента
io.sockets.on('connection', function (socket) 
{
	var ID = socket.id;
	var time = (new Date).toLocaleTimeString();
	console.log(""+time+": "+ID+"is connected")
	// обработчики на входящее сообщение
	socket.on('name', function (msg) 
	{
		var MongoClient = require('mongodb').MongoClient, format = require('util').format;
		var result = false;
		MongoClient.connect('mongodb://127.0.0.1:27017/football',function (err,db)
		{
			if (err) throw err;
			var collection = db.collection('userlist');
			collection.find({login:msg.text,password:msg.passwd,online:false}).toArray(function(err,results)
			{
				console.dir(results);
				var time = (new Date).toLocaleTimeString();
				console.log(""+time+": authorization.")
				console.log(results.length)
				if (results.length!=0) result=true;
				//db.close();
				if (result)
				{
					socket.emit('hello',{text: "Привет, "+msg.text+"!"});
					collection.update({login:msg.text}, {$set: {online:true}}, function(err) 
					{
					   	if (err) console.warn(err.message);
					   	else console.log('successfully updated');
					   	db.close();
					 });
					var pl1 = new Player(ID,msg.text);
					sockets0[ID]=socket;		//добавляем подключившийся сокет в ассоциативный массив
					if (waiting===null) 
						{
							waiting = pl1;
							console.log(""+time+": waiting - "+waiting.ID+"("+waiting.name+")");
						}
					else
					{
						var newVs = new Vs(waiting,pl1);
						pairs.push(newVs);
						var time = (new Date).toLocaleTimeString();
						console.log(""+time+": "+waiting.name+" vs. "+pl1.name)
		           		var tmp = sockets0[pl1.ID];
						tmp.emit('opponent',{text:"Ваш противник - "+waiting.name,name:waiting.name,isgamer1:false});
						tmp = sockets0[waiting.ID];
						tmp.emit('opponent',{text:"Ваш противник - "+pl1.name,name:pl1.name,isgamer1:true});
						waiting = null;
					}
				}
				else
				{
					socket.emit('auto_error',{text:"Ошибка авторизации."})
				}
			})
		})
		
	});
	socket.on('for_all', function (msg) 
	{		
		var time = (new Date).toLocaleTimeString();
		socket.broadcast.emit('for_all',{text:msg.text});
		console.log(""+time+": abc")
	});
	socket.on('move',function (msg)
	{
		var time = (new Date).toLocaleTimeString();
		console.log(""+time+": "+socket.id+" - click")
		var tmp = GetOpponent(socket.id);
		if (tmp!=null) tmp.emit('move',{oldx:msg.oldx, oldy:msg.oldy, newx:msg.newx, newy:msg.newy});
	});
	socket.on('register',function (msg)
	{
		isuserok=true;
		if (msg.login.length>8)
		{
			socket.emit("regresult",{result:false,text:"Ошибка регистрации: Логин может максимально содержать 8 символов."});
			isuserok=false;
		}
		if (msg.password.length<4)
		{
			socket.emit("regresult",{result:false,text:"Ошибка регистрации: Слишком короткий пароль. Пожалуйста, придумайте пароль, содержащий хотя бы 4 символа."});
			isuserok=false;
		}
		if (isuserok)
		{

			var MongoClient = require('mongodb').MongoClient, format = require('util').format;
			MongoClient.connect('mongodb://127.0.0.1:27017/football',function (err,db)
			{
				if (err) throw err;
				var collection = db.collection('userlist');
				var result = false;
				collection.find({login:msg.login}).toArray(function(err,results)
				{
					var time = (new Date).toLocaleTimeString();
					console.log(""+time+": registration")
					console.dir(results);
					console.log(results.length)
					if (results.length!=0) 
						{
							result=true;
							console.log("found")
						}
					if (!result)
					{
						collection.insert({login:msg.login, email:msg.email, password:msg.password,online:false},function(err,docs)
						{
							collection.count(function(err,count)
							{
								console.log(format("count = %s",count));
							})
							collection.find().toArray(function(err,results)
							{
								console.dir(results);
								
							})
						})
						socket.emit("regresult",{result:true,text:"Аккаунт зарегистрирован."})
						console.log("okay!")
					}
					else
					{
						socket.emit("regresult",{result:false,text:"Ошибка регистрации: К сожалению, этот логин уже занят. Придумайте другой."});
						console.log("sorry, fuck off");
					}
					db.close();
				});
			})
		}
	});		
	// При отключении клиента - уведомляем остальных
	socket.on('disconnect', function() 
	{
		var time = (new Date).toLocaleTimeString();
		var dis_name = null;
		if (waiting!=null && waiting.ID===ID)
		{
			dis_name = waiting.name;
			waiting = null;
		}
		else dis_name = GetName(ID);
		console.log(""+time+": "+dis_name+"("+ID+") is disconnect")
		var MongoClient = require('mongodb').MongoClient, format = require('util').format;
		MongoClient.connect('mongodb://127.0.0.1:27017/football',function (err,db)
		{
			if (err) throw err;
			var collection = db.collection('userlist');
			collection.update({login:dis_name}, {$set: {online:false}}, function(err) 
			{
		    	if (err) console.warn(err.message);
		    	else console.log('successfully updated');
		    });
		});
		//
		var getOppt =  GetOpponent(socket.id);
		if (getOppt!=null) getOppt.emit('exit_opponent',{text:"Ваш соперник отключился"});
		for (var i=0;i<pairs.length;i++)
		{
			if (pairs[i]!=undefined && (pairs[i].P1.ID===ID || pairs[i].P2.ID===ID))

			{
				if (pairs[i].P1.ID===ID) 
				{
					getOppt=pairs[i].P2;
					delete pairs[i];
				}
				else if (pairs[i].P2.ID===ID) 
				{
					getOppt=pairs[i].P1;
					delete pairs[i];
				}
				if (waiting==null) 
				{
					waiting = getOppt;
					console.log(""+time+": waiting - "+waiting.ID+"("+waiting.name+")");
				}
				else
				{
					var newVs = new Vs(waiting,getOppt);
					pairs.push(newVs);
					var time = (new Date).toLocaleTimeString();
					console.log(""+time+": "+waiting.name+" vs. "+getOppt.name)
		           	var tmp = sockets0[getOppt.ID];
					tmp.emit('opponent',{text:"Ваш противник - "+waiting.name,name:waiting.name,isgamer1:false});
					tmp = sockets0[waiting.ID];
					tmp.emit('opponent',{text:"Ваш противник - "+getOppt.name,name:getOppt.name,isgamer1:true});
					waiting = null;
					getOppt = null;
				}
				if (waiting!=null) console.log ("wait:" + waiting.ID);
			}
		}
		/*if (waiting!=null)
		{
			if (waiting.ID===ID) waiting = null;
		}*/
		delete sockets0[ID];
	});
});