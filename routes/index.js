
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
            res.render('index', {
                "louverslist" : docs, title: 'Жалюзи и рольставни', "homepage": homepage
            });
         console.log(docs);
         //console.log(this.address().port);
        });
    };
};

exports.adminka = function(db,homepage)
{
    return function(reg,res)
    {
        console.log(homepage);
        res.render('adminka',{
            "homepage": homepage
        });
    }
}

exports.admin_zhaluzi = function(db,homepage)
{
    return function(reg,res)
    {
        res.render('zhaluzi-admin',{
            "homepage": homepage
        });
    }
}

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

exports.addOrder = function(db,name,mail,phone,address,data,comment)   //пока без комментария, ибо хз, что с большим текстом делать.
{
    var collection = db.get('orders');
    collection.insert({name:name,mail:mail,phone:phone,address:address,order_data:data,comment:comment});
    collection.find({},{},function(e,docs)
    {
        console.log(docs);
    });
}