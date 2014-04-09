window.onclick = function(e,homepage)
{ 
    var elem = e ? e.target : window.event.srcElement;
    if (elem.className=="delete_order")
    {
        if (confirm('Вы действительно хотите удалить эту заявку?'))
        {
            var id=elem.id.substr(7,elem.id.length-7);
            socket = io.connect(homepage);
            socket.emit('deleteOrder',{order_id:id});
            //setTimeout(function() {location.reload();},1000);
        }
    }
}
window.onload = function(e,homepage) 
{
    socket = io.connect(homepage);
    socket.on('delOrderOk', function () 
    {
        location.reload();
    });
}