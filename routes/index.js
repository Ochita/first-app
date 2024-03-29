String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};
String.prototype.stripTags = function() {
  return this.replace(/<\/?[^>]+>/g, '');
};

transliterate = (function() 
{
        var rus = "щ   ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g),
            eng = "shh sh ch cz yu ya yo zh `` y e a b v g d e z i j k l m n o p r s t u f x `".split(/ +/g);
        return function(text, engToRus) 
        {
            var x;
            for(x = 0; x < rus.length; x++) 
            {
                text = text.split(engToRus ? eng[x] : rus[x]).join(engToRus ? rus[x] : eng[x]);
                text = text.split(engToRus ? eng[x].toUpperCase() : rus[x].toUpperCase()).join(engToRus ? rus[x].toUpperCase() : eng[x].toUpperCase()); 
            }
            return text;
        }
    }
)();

function MakeAddress(str)
{
    var newstr = transliterate(str);
    newstr = newstr.replaceAll("`","");
    newstr = newstr.replaceAll(" ","-")
    return newstr;
}

exports.add_img_with_name = function(db,homepage)
{
    return function(req, res) {
    res.render('load_image', {    
        title: 'Загрузка изображения', "homepage": homepage
        });
    };
}

function generate404(req,res,db,homepage)
{
    var collection = db.get('louvers_type');
    collection.find({},{},function(e,docs)
    {
        docsl = docs;
        collection = db.get('rollers_type');
        collection.find({},{},function(e,docs)
        {
            res.render('notfound', {
            "louverslist" : docsl, "rollerslist":docs, title: '404', "homepage": homepage,
            text:"<h1>404 Not Found</h1>"
            });
        });
    });
}

exports.static_page = function(db,homepage)
{
    return function(req, res) {
    var lname = req.params.static_page;
    var collection = db.get('static_pages');
    collection.find({},{fields:{_id: 0,name:1,text:1,title:1}},function(e,docs){
        var result = false; var number=-1;
        for (var i in docs) 
        if (docs[i].name==lname) 
            {
                result = true;
                number = i;
            }
        if (!result) 
        {
            generate404(req,res,db,homepage);
        }
        else
        {
            docsS = docs;
            collection = db.get('louvers_type');
            collection.find({},{},function(e,docs)
            {
                docsl = docs;
                collection = db.get('rollers_type');
                collection.find({},{},function(e,docs)
                {
                res.render('notfound', {
                "louverslist" : docsl, "rollerslist":docs, title: docsS[number].title, "homepage": homepage,
                text:docsS[number].text
                });
                });
        });
        }
    });
    }
}

exports.tohome = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs){
            docsl = docs;
            collection = db.get('rollers_type');
            collection.find({},{},function(e,docs){
                collection = db.get('louvers');
                docsl2 = docs;
                var options = {"sort": "type"};
                collection.find({},options,function(e,docs){
                    docsl3 = docs;
                    collection = db.get('rollers');
                    collection.find({type_global:"Рольставни"},options,function(e,docs){
                        docsl4 = docs;
                        collection.find({type_global:"Автоматика"},options,function(e,docs){
                            docsl5 = docs;
                            collection.find({type_global:"Тип управления"},options,function(e,docs){
                            docsl6 = docs;
                            collection.find({type_global:"Монтаж"},options,function(e,docs){
                            docsl7 = docs;
                    res.render('index', {
                    "louverslist" : docsl, "rollerslist":docsl2, "lcalclist":docsl3, 
                    rcalclist:docsl4,controllist:docsl5,autolist:docsl6,
                    montagelist:docsl7,
                    title: 'Жалюзи и рольставни', "homepage": homepage
                    });
                });
                        });
                        });
                    });
        });
});
    });
    };
};

exports.aboutCMP = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs){
            docsl = docs;
            collection = db.get('rollers_type');
            collection.find({},{},function(e,docs){
                docsl2=docs;
                collection = db.get('information');
                collection.find({name:"companyInfo"},{},function(e,docs){
                    if (docs.length!=0)
                    res.render('aboutCompany', {    //теги не удаляю. мало ли.
                        "louverslist" : docsl, "rollerslist":docsl2, title: 'Жалюзи и рольставни', 
                        "homepage": homepage, "text":(docs[0].text).replaceAll("\n","<br>")});
        });
            });
    });
    };
};

exports.contacts = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs){
            docsl = docs;
            collection = db.get('rollers_type');
            collection.find({},{},function(e,docs){
                docsl2=docs;
                collection = db.get('information');
                collection.find({name:"contacts"},{},function(e,docs){
                    if (docs.length!=0)
                    res.render('contacts', {    //теги не удаляю. мало ли.
                        "louverslist" : docsl, "rollerslist":docsl2, title: 'Жалюзи и рольставни', 
                        "homepage": homepage, contacts:docs[0]});
        });
            });
    });
    };
};

exports.itemslist=function(db,homepage,jadefile,itemcl)
{
    return function(req,res)
    {
        var lname = req.params.lname;
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs)
        {
            docsl = docs;
            collection = db.get('rollers_type');
            collection.find({},{},function(e,docs)
            {
                docsl2 = docs;
                collection = db.get(itemcl+'_type');
                collection.find({adress:lname},{},function(e,docs)
                {
                    if (docs.length!=0)
                    {
                        typename=docs[0].name;
                        text=docs[0].description;
                        text = text.stripTags();
                        text = text.replaceAll("\n","<br>");
                        id=docs[0].adress;
                        collection = db.get(itemcl);
                        if (itemcl=="rollers") 
                        collection.find({type_roller:typename},{},function(e,docs)
                        {
                            res.render(jadefile, {
                            "louverslist" : docsl, 
                            "rollerslist":docsl2, title: 'Жалюзи и рольставни', 
                            "homepage": homepage,
                            "typename":typename.toUpperCase(), "id":id, "text":text, 
                            "itemslist":docs});
                        });
                        else
                        collection.find({type:typename},{},function(e,docs)
                        {
                            res.render(jadefile, {
                            "louverslist" : docsl, 
                            "rollerslist":docsl2, title: 'Жалюзи и рольставни', 
                            "homepage": homepage,
                            "typename":typename.toUpperCase(), "id":id, "text":text, 
                            "itemslist":docs});
                        });
                    }
                });
            });
    });
    }
}

exports.toCMS = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('louvers_type');
        collection.find({},{},function(e,docs){
            docsl = docs;
            collection = db.get('rollers_type');
            collection.find({},{},function(e,docs){
            res.render('login', {
                "louverslist" : docsl, "rollerslist":docs, title: 'Вход в CMS', "homepage": homepage
            });
        });
    });
    };
};

exports.adminlist = function(db,homepage)
{
    return function(req,res)
    {
        var collection = db.get('Admins');
        collection.find({},{login:1},function(e,docs)
        {
            res.render('adminlist',{namelist:docs,title: 'Список администраторов', "homepage": homepage});
        });
    }
}

exports.Statistika = function(db,homepage)
{
    return function(req,res)
    {
        var options = {"sort": "datetime"};
        var collection = db.get('calc_statistic');
        collection.find({type:"louvers"},options,function(e,docs)
        {
            docsl = docs;
            collection.find({type:"rollers"},options,function(e,docs)
            {
            res.render('statistic',{llist:docsl,rlist:docs,title: 'Статистика', "homepage": homepage});
        });
        });
    }
}

exports.admin_images = function(db,homepage) 
{
    return function(req, res) {
        var collection = db.get('louvers');
        collection.find({},{},function(e,docs)
        {
            docsl = docs;
            collection = db.get('rollers');
            collection.find({},{},function(e,docs)
            {
                docsl2 = docs;
                collection = db.get('rollers_type');
                collection.find({},{},function(e,docs)
                {
                    docsl3 = docs;
                    collection=db.get('louvers_type');
                    collection.find({},{},function(e,docs)
                    {
                        res.render('imagelist', {"louverslist" : docsl, 
                            "rollerslist":docsl2, "ltlist":docs, 
                            "rtlist":docsl3, 
                            title: 'Картинки,отображаемые в каталоге', 
                            "homepage": homepage});
                    });
                });
            });
        });
    };
};

exports.adminka = function(db,homepage)
{
    return function(reg,res)
    {
        var collection = db.get('information');
        collection.find({name:'companyInfo'},{},function(e,docs)
        {
            var inf="",adr="",ph="",ml="",gr="";
            if (docs.length!=0) inf=docs[0].text;
            collection.find({name:'contacts'},{},function(e,docs)
            {
                if (docs.length!=0) 
                    {
                        adr=docs[0].address;
                        ph=docs[0].phone;
                        ml=docs[0].email;
                        gr=docs[0].graph;
                    }
                res.render('adminka',{
                "homepage": homepage, "infa":inf,
                address:adr,phone:ph,email:ml,graph:gr,
                title: 'Информация о компании'
                });
        });
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
    comment = comment.stripTags();
    comment = comment.stripTags();
    comment = comment.replaceAll("\n","<br>");
    collection.insert({name:name,mail:mail,phone:phone,address:address,order_data:data,comment:comment});
}

exports.addRoller = function(db,msg,socket)
{
    var collection = db.get('rollers');
    var documents = {name:msg.name,adress:MakeAddress(msg.name),type_roller:msg.type_roller,type_global:msg.type_global,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.insert(documents,{},function(e,docs)
    {   
        if (e) socket.emit('ExistingAdress');
        if (!e) socket.emit('addSortOk');
    });
}

exports.addLouver = function(db,msg,socket)
{
    var collection = db.get('louvers');
    var documents = {name:msg.name,adress:MakeAddress(msg.name),type:msg.type,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.insert(documents,{},function(e,docs)
    {   
        if (e) socket.emit('ExistingAdress');
        if (!e) socket.emit('addSortOk');
    });
}

exports.addType = function(db,cl_name,name,description,socket)   
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:name,adress:MakeAddress(name),description:description};
    collection.find({adress:MakeAddress(name)},{},function(e,docs)
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

exports.editType = function(db,cl_name,oldname,name,description,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:name,adress:MakeAddress(name),description:description};
    collection.update({name:oldname},{$set:documents},function(e,docs)
    {   
        error = e;
        if(error==false || error==null) socket.emit('editTypeOk');
        if(error==true) socket.emit('Error');
    });
}

exports.editRollers = function(db,cl_name,msg,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:msg.name,adress:MakeAddress(msg.name),type_roller:msg.type_roller,type_global:msg.type_global,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.update({name:msg.oldname},{$set:documents},function(e,docs)
    {   
        error = e;
        if(error==false || error==null) socket.emit('editSortOk');
        if(error==true) socket.emit('Error');
    });
}

exports.editLouvers = function(db,cl_name,msg,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents = {name:msg.name,adress:MakeAddress(msg.name),type:msg.type,calc_price:msg.calc_price,promo_price:msg.promo_price,description:msg.description};
    collection.update({name:msg.oldname},{$set:documents},function(e,docs)
    {   
        error = e;
        if(error==false || error==null) socket.emit('editSortOk');
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

exports.editCompanyInfo=function(db,cl_name,msg,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents={name:'companyInfo',text:msg.info_text};
    collection.find({name:'companyInfo'},{},function(e,docs)
    {
        if (docs.length==0) 
        {
            collection.insert({name:'companyInfo'},{},function(e,docs)
            {   
                error = e;
            });
            if (error!=true)
            {   
                collection.update({name:'companyInfo'},{$set:documents},function(e,docs){});
            }
        }
        else
        {
            collection.update({name:'companyInfo'},{$set:documents},function(e,docs){});
        }
        if(error==false) socket.emit('editInfoOk');
        if(error==true) socket.emit('Error');
    });
}

exports.editContacts=function(db,cl_name,msg,socket)
{
    var error = false;
    var collection = db.get(cl_name);
    var documents={name:'contacts',address:msg.address,phone:msg.phone,email:msg.email,graph:msg.graph};
    collection.find({name:'contacts'},{},function(e,docs)
    {
        if (docs.length==0) 
        {
            collection.insert({name:'contacts'},{},function(e,docs)
            {   
                error = e;
            });
            if (error!=true)
            {   
                collection.update({name:'contacts'},{$set:documents},function(e,docs){});
            }
        }
        else
        {
            collection.update({name:'contacts'},{$set:documents},function(e,docs){});
        }
        if(error==false) socket.emit('editContactsOk');
        if(error==true) socket.emit('Error');
    });
}

exports.calcPrice=function(db,cl_name,msg,socket)
{
    console.log(msg);
    var error = false;
    var query = msg.type;
    var collection = db.get(cl_name);
    var result = (1/10000)*msg.width*msg.height;
    if (result<1) result = 1;
    result = Math.ceil(result);
    collection.find({"name":msg.type},{},function(e,docs)
    {
        if (docs.length<=0) error = true;
        else
            {
                result = result*(docs[0].calc_price);
                console.log("res after find "+result)
                if (result==NaN || result==0)
                    error = true;
                if (cl_name=="rollers")
                {
                    result = result+msg.control+msg.auto+msg.montage;
                    query+= "; "+msg.ncontrol+"; "+msg.nauto+"; "+msg.nmontage;
                    console.log("query"+query);
                }
                result = result*msg.kol;
            }
        if(error==false) {
            socket.emit('newResult',
            {
                result:result,
                str:"Примерная сумма: "+result+" руб."
            });
            collection = db.get("calc_statistic");
            var now = new Date();
            documents = {type:cl_name,datetime:now.toString(),name:query,width:msg.width,height:msg.height,kol:msg.kol,result:result}
            collection.insert(documents);
        }
        if(error==true) socket.emit('Error');
    });
}