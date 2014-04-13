var oldN="";

String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
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

window.onclick = function(e,homepage)
{ 
    var elem = e ? e.target : window.event.srcElement;
    if (elem.className=="delete_rollers_type")
    {
        if (confirm('Вы действительно хотите удалить этот тип?'))
        {
            var id=elem.id.substr(7,elem.id.length-7);
            socket = io.connect(homepage);
            socket.emit('deleteRollerType',{type_id:id});
            //setTimeout(function() {location.reload();},1000);
        }
    }
    if (elem.className=="edit_rollers_type")
    {
        var id=elem.id.substr(5,elem.id.length-5);
        socket = io.connect(homepage);
        socket.emit('getRTypeInfo',{type_id:id});
    }
}
window.onload = function(e,homepage) 
{
    socket = io.connect(homepage);
    //instance.listenOnSubmit(document.getElementById("AddRType"), document.getElementById("imagen"));
    /*  socket.on('connect', function(){
    var delivery = new Delivery(socket);

    delivery.on('delivery.connect',function(delivery){
      $("input[type=submit]").click(function(evt){
        var file = $("input[type=file]")[0].files[0];
        delivery.send(file);
        evt.preventDefault();
      });
    });

    delivery.on('send.success',function(fileUID){
      console.log("file was successfully sent.");
    });
  });*/
    socket.on('delTypeOk', function () 
    {
        location.reload();
    });
    socket.on('addTypeOk', function () 
    {
        location.reload();
    });
    socket.on('editTypeOk', function () 
    {
        location.reload();
    });
    socket.on('ExistingAdress', function () 
    {
        alert("Ошибка добавления в базу данных. Возможно, данный адрес уже используется.");
    });
    socket.on('helloInfo',function(msg)
    {
        document.getElementById('name').value=msg.name;
        document.getElementById('description').value=msg.description
        oldN=msg.name;
        $('#EditRoller').modal('show');
    });
    document.getElementById('AddRType').onclick = function(e,homepage) 
    {   
        //var instance = new SocketIOFileUpload(socket);
        socket.emit('newRollersType',{
            name:document.getElementById('namen').value,
            adress:MakeAddress(document.getElementById('namen').value),
            description:document.getElementById('descriptionn').value
            });
        //var instance = new SocketIOFileUpload(socket);
        //instance.load(document.getElementById("imagen"));
        $('#AddRoller').modal('hide');
    };
    document.getElementById('EditRType').onclick = function(e,homepage) 
    {   
        socket.emit('editRollersType',{
            oldname:oldN,
            name:document.getElementById('name').value,
            adress:MakeAddress(document.getElementById('name').value),
            description:document.getElementById('description').value
            });
        oldN="";
        $('#EditRoller').modal('hide');
    }
}