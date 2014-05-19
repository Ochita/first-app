String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};

window.onclick = function(e,homepage)
{ 
    var elem = e ? e.target : window.event.srcElement;
    if (elem.className=="delete_login")
    {
        if (confirm('Вы действительно хотите удалить эту учетную запись?'))
        {
            var name=elem.id.substr(7,elem.id.length-7);
            socket = io.connect(homepage);
            socket.emit('deladmin',{login:name});
        }
    }
    if (elem.className=="edit_login")
    {
        var id=elem.id.substr(5,elem.id.length-5);
        socket = io.connect(homepage);
        $('#EditAdmin').modal('show');
        document.getElementById('EditAdmLabel').innerHTML = "Изменение учетной записи " + id;
        document.getElementById('newpassword1').value = "";
        document.getElementById('newpassword2').value = "";
        document.getElementById('oldpas').value = "";
    }
}
window.onload = function(e,homepage) 
{
    socket = io.connect(homepage);
    socket.on('delSucsess', function () 
    {
        location.reload();
    });
    socket.on('addSucsess', function () 
    {
        location.reload();
    });
    socket.on('LastAdmin', function () 
    {
        alert("Нельзя удалить единственного оставшегося администратора");
    });
    socket.on('NameInUse', function () 
    {
        alert("Логин уже используется");
    });
    document.getElementById('AddAd').onclick = function(e,homepage) 
    {   
        socket.emit('newAdmin',{
            login:document.getElementById('input_username').value,
            passwd:document.getElementById('input_password').value
            });
            $('#AddAdmin').modal('hide');
    }
     document.getElementById('EdAd').onclick = function(e,homepage) 
    {   
        if(document.getElementById('newpassword1').value == document.getElementById('newpassword2').value)
        socket.emit('editAdmin',{
            login:document.getElementById('EditAdmLabel').innerHTML.substr(25,document.getElementById('EditAdmLabel').innerHTML.length-25),
            newpasswd:document.getElementById('newpassword1').value,
            oldpasswd:document.getElementById('oldpas').value
            });
        else
            alert("Пароли не совпадают")
    }
    socket.on('wrongPass', function () 
    {
        alert("Неверный пароль учетной записи");
    });
    socket.on('editSucsess', function () 
    {
        $('#EditAdmin').modal('hide');
        location.reload();
    });
}