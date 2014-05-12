var oldN="";

String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};

window.onclick = function(e,homepage)
{ 
    var elem = e ? e.target : window.event.srcElement;
    if (elem.className=="delete_louvers_type")
    {
        if (confirm('Вы действительно хотите удалить этот тип?'))
        {
            var id=elem.id.substr(7,elem.id.length-7);
            socket = io.connect(homepage);
            socket.emit('deleteLouverType',{type_id:id});
        }
    }
    if (elem.className=="edit_louvers_type")
    {
        var id=elem.id.substr(5,elem.id.length-5);
        socket = io.connect(homepage);
        socket.emit('getLTypeInfo',{type_id:id});
    }
}
window.onload = function(e,homepage) 
{
    socket = io.connect(homepage);
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
        $('#EditLouver').modal('show');
    })
    document.getElementById('AddLType').onclick = function(e,homepage) 
    {   
        socket.emit('newLouversType',{
            name:document.getElementById('namen').value,
            description:document.getElementById('descriptionn').value
            });
            $('#AddLouver').modal('hide');
    }
    document.getElementById('EditLType').onclick = function(e,homepage) 
    {   
        socket.emit('editLouversType',{
            oldname:oldN,
            name:document.getElementById('name').value,
            description:document.getElementById('description').value
            });
        oldN="";
        $('#EditLouver').modal('hide');
    }
}