
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
                "louverslist" : docs, title: 'Express', "homepage": homepage
            });
         console.log(docs);
        });
    };
};

exports.adminka = function(db,homepage)
{
    return function(reg,res)
    {
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