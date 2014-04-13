var oldN="";

String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};

window.onclick = function(e,homepage)
{ 
    var elem = e ? e.target : window.event.srcElement;
    if (elem.className=="delete_rollers")
    {
        if (confirm('Вы действительно хотите удалить этот вид?'))
        {
            var id=elem.id.substr(7,elem.id.length-7);
            socket = io.connect(homepage);
            socket.emit('deleteRollers',{type_id:id});
            //setTimeout(function() {location.reload();},1000);
        }
    }
    if (elem.className=="edit_rollers")
    {
        var id=elem.id.substr(5,elem.id.length-5);
        socket = io.connect(homepage);
        socket.emit('getRInfo',{item_id:id});
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
        document.getElementById('cprice').value=msg.calc_price;
        document.getElementById('pprice').value = msg.promo_price;
        document.getElementById('description').value = msg.description;
        oldN=msg.name;
        $('#EditRoller').modal('show');
    })
    document.getElementById('AddR').onclick = function(e,homepage) 
    {   
        var sel1 = document.getElementById('typen');
        sel1 = sel1.options[sel1.selectedIndex].innerHTML;        
        var sel2 = document.getElementById('typeng');
        sel2 = sel2.options[sel2.selectedIndex].innerHTML;
        socket.emit('newRollers',{
            name:document.getElementById('namen').value,
            type_roller:sel1,
            type_global:sel2,
            calc_price:document.getElementById('cpricen').value,
            promo_price:document.getElementById('ppricen').value,
            description:document.getElementById('descriptionn').value
        });
        $('#AddRoller').modal('hide');
    }
    document.getElementById('EditR').onclick = function(e,homepage) 
    {   
        var sel1 = document.getElementById('type');
        sel1 = sel1.options[sel1.selectedIndex].innerHTML;        
        var sel2 = document.getElementById('typeg');
        sel2 = sel2.options[sel2.selectedIndex].innerHTML;
        socket.emit('editRollers',{
            oldname:oldN,
            name:document.getElementById('name').value,
            type_roller:sel1,
            type_global:sel2,
            calc_price:document.getElementById('cprice').value,
            promo_price:document.getElementById('pprice').value,
            description:document.getElementById('description').value
            });
        oldN="";
        $('#EditRoller').modal('hide');
    }
}