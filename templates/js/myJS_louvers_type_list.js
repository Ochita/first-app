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
            //setTimeout(function() {location.reload();},1000);
        }
    }
}
window.onload = function(e,homepage) 
{
    socket = io.connect(homepage);
    socket.on('delLTypeOk', function () 
    {
        location.reload();
    });
    document.getElementById('AddLType').onclick = function(e,homepage) 
    {   
        socket.emit('newLouversType',{
            name:document.getElementById('namen').value,
            adress:document.getElementById('adressn').value,
            description:document.getElementById('descriptionn').value.replaceAll("\n","<br>")
            });
                //document.getElementById('myModal').hide;
            $('#EditLouver').modal('hide');
    }
}