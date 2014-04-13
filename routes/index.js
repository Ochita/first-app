
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.tohome = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs){
            docsl = docs;
            collection = db.get('rollers_type');
            collection.find({},{},function(e,docs){
            res.render('index', {
                "louverslist" : docsl, "rollerslist":docs, title: 'Жалюзи и рольставни', "homepage": homepage
            });
        });
    });
    };
};

exports.adminka = function(db,homepage)
{
    return function(reg,res)
    {
        //console.log(homepage);
        res.render('adminka',{
            "homepage": homepage
        });
    }
}

exports.admin_zhaluzi = function(db,homepage)
{
    return function(reg,res)
    {
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs){
            res.render('zhaluzi-admin', {
                "louverslist" : docs, title: 'Жалюзи', "homepage": homepage
            });
            //console.log(docs);
    });
};
};

exports.admin_rollers = function(db,homepage)
{
    return function(reg,res)
    {
        var collection = db.get('rollers_type');
        collection.find({},{},function(e,docs){
            res.render('rollers_type-admin', {
                "rollerslist" : docs, title: 'Рольставни', "homepage": homepage
            });
            //console.log(docs);
    });
};
};

exports.admin_louvers = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs){
            docsl = docs;
            collection = db.get('louvers');
            collection.find({},{},function(e,docs){
            res.render('louvers-admin', {
                "louverslist" : docsl, "llist":docs, title: 'Жалюзи', "homepage": homepage
            });
        });
    });
    };
};

exports.admin_rollers0 = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('rollers_type');
        collection.find({},{},function(e,docs){
            docsl = docs;
            collection = db.get('rollers');
            collection.find({},{},function(e,docs){
            res.render('rollers-admin', {
                "rollerslist" : docsl, "rlist":docs, title: 'Рольставни', "homepage": homepage
            });
        });
    });
    };
};

exports.admin_orders = function(db,homepage)
{
    return function(reg,res)
    {
        var collection = db.get('orders');
        collection.find({},{},function(e,docs){
            res.render('orders-admin', {
                "orderlist" : docs, title: 'Поступившие заявки', "homepage": homepage
            });
        });
    };
};

exports.addOrder = function(db,name,mail,phone,address,data,comment,error)   //пока без комментария, ибо хз, что с большим текстом делать.
{
    var collection = db.get('orders');
    collection.insert({name:name,mail:mail,phone:phone,address:address,order_data:data,comment:comment});
    /*collection.find({},{},function(e,docs)
    {
        console.log(docs);
    });*/
}

//editLouvers(db,'louvers',msg,socket);sendLInfo

exports.addRoller = function(db,msg,socket)
{
    var collection = db.get('rollers');
    var documents = {name:msg.name,type_roller:msg.type_roller,type_global:msg.type_global,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.insert(documents,{},function(e,docs)
    {   
        if (e) socket.emit('ExistingAdress');
        if (!e) socket.emit('addSortOk');
    });
}

exports.addLouver = function(db,msg,socket)
{
    var collection = db.get('louvers');
    var documents = {name:msg.name,type:msg.type,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.insert(documents,{},function(e,docs)
    {   
        if (e) socket.emit('ExistingAdress');
        if (!e) socket.emit('addSortOk');
    });
}

exports.addType = function(db,cl_name,name,adress,description,socket)   
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:name,adress:adress,description:description};
    collection.find({adress:adress},{},function(e,docs)
    {
        if (docs.length!=0) error = true;
        //console.log("finding docs:");console.log(docs);console.log("after find: "+error);
        if (error!=true)
        {   
            collection.insert(documents,{},function(e,docs)
            {   
                error = e;
            });
        }
        if(error==false) socket.emit('addTypeOk');
        if(error==true) socket.emit('ExistingAdress');
    });
}

exports.editType = function(db,cl_name,oldname,name,adress,description,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:name,adress:adress,description:description};
    collection.update({name:oldname},{$set:documents},function(e,docs)
    {   
        error = e;
        if(error==false) socket.emit('editTypeOk');
        if(error==true) socket.emit('Error');
    });
}

exports.editRollers = function(db,cl_name,msg,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:msg.name,type_roller:msg.type_roller,type_global:msg.type_global,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.update({name:msg.oldname},{$set:documents},function(e,docs)
    {   
        error = e;
        if(error==false) socket.emit('editSortOk');
        if(error==true) socket.emit('Error');
    });
}

exports.editLouvers = function(db,cl_name,msg,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:msg.name,type:msg.type,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.update({name:msg.oldname},{$set:documents},function(e,docs)
    {   
        error = e;
        if(error==false) socket.emit('editSortOk');
        if(error==true) socket.emit('Error');
    });
}

exports.delOrder = function(db,id,error) 
{
    var collection = db.get('orders');
    collection.remove({"_id":id});
    console.log("Order is delete: "+id);
}

exports.delType= function(db,cl_name,id,error)   
{
    var collection = db.get(cl_name);
    collection.remove({"_id":id});
    console.log(cl_name+": delete id "+id);
}

exports.sendInfo=function(db,cl_name,id,socket)
{
    var collection = db.get(cl_name);
    collection.find({_id:id},{},function(e,docs)
    {
        socket.emit('helloInfo',{name:docs[0].name,description:docs[0].description});
    });
}

exports.sendRInfo=function(db,cl_name,id,socket)
{
    var collection = db.get(cl_name);
    collection.find({_id:id},{},function(e,docs)
    {
        socket.emit('helloInfo',{name:docs[0].name,type_roller:docs[0].type_roller,type_global:docs[0].type_global,calc_price:docs[0].calc_price,promo_price:docs[0].promo_price,description:docs[0].description});
    });
}

exports.sendLInfo=function(db,cl_name,id,socket)
{
    var collection = db.get(cl_name);
    collection.find({_id:id},{},function(e,docs)
    {
        socket.emit('helloInfo',{name:docs[0].name,type:docs[0].type,calc_price:docs[0].calc_price,promo_price:docs[0].promo_price,description:docs[0].description});
    });
}