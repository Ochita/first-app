var oldN="";

String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};

window.onclick = function(e,homepage)
{ 
    var elem = e ? e.target : window.event.srcElement;
    if (elem.className=="delete_louvers")
    {
        if (confirm('Вы действительно хотите удалить этот вид?'))
        {
            var id=elem.id.substr(7,elem.id.length-7);
            socket = io.connect(homepage);
            socket.emit('deleteLouvers',{type_id:id});
            //setTimeout(function() {location.reload();},1000);
        }
    }
    if (elem.className=="edit_louvers")
    {
        var id=elem.id.substr(5,elem.id.length-5);
        socket = io.connect(homepage);
        socket.emit('getLInfo',{item_id:id});
    }
}
window.onload = function(e,homepage) 
{
    socket = io.connect(homepage);
    socket.on('delSortOk', function () 
    {
        location.reload();
    });
    socket.on('addSortOk', function () 
    {
        location.reload();
    });
    socket.on('editSortOk', function () 
    {
        location.reload();
    });
    socket.on('Error', function () 
    {
        alert("Что-то пошло не так...");
    });
    socket.on('helloInfo',function(msg)
    {
        document.getElementById('name').value = msg.name;
        //type_roller:sel1,     //как-то надо заполнить селекты присланными значениями
        //type_global:sel2,
        document.getElementById('cprice').value=msg.calc_price.toString();
        document.getElementById('pprice').value = msg.promo_price;
        document.getElementById('description').value = msg.description;
        oldN=msg.name;
        $('#EditLouver').modal('show');
    })
    document.getElementById('AddL').onclick = function(e,homepage) 
    {   
        var sel1 = document.getElementById('typen');
        sel1 = sel1.options[sel1.selectedIndex].innerHTML;        
        socket.emit('newLouvers',{
            name:document.getElementById('namen').value,
            type:sel1,
            calc_price:parseInt(document.getElementById('cpricen').value,10),
            promo_price:document.getElementById('ppricen').value,
            description:document.getElementById('descriptionn').value
        });
        $('#AddLouver').modal('hide');
    }
    document.getElementById('EditL').onclick = function(e,homepage) 
    {   
        var sel1 = document.getElementById('type');
        sel1 = sel1.options[sel1.selectedIndex].innerHTML;        
        socket.emit('editLouvers',{
            oldname:oldN,
            name:document.getElementById('name').value,
            type:sel1,
            calc_price:parseInt(document.getElementById('cprice').value,10),
            promo_price:document.getElementById('pprice').value,
            description:document.getElementById('description').value
            });
        oldN="";
        $('#EditLouver').modal('hide');
    }
}