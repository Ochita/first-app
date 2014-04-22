String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};
window.onload = function(e,homepage) 
{
    socket = io.connect(homepage);
    socket.on('editInfoOk', function () 
    {
        location.reload();
    });
    socket.on('editContactsOk', function () 
    {
        location.reload();
    });
    socket.on('Error', function () 
    {
        alert("Что-то пошло не так...");
    });
    document.getElementById('EditInfo').onclick = function(e,homepage) 
    {         
        socket.emit('newCompanyInfo',{
            info_text:document.getElementById('promoarea').value});
    }
    document.getElementById('EditContacts').onclick = function(e,homepage) 
    {         
        socket.emit('newContacts',{
            address:document.getElementById('address').value,
            phone:document.getElementById('phone').value,
            email:document.getElementById('email').value,
            graph:document.getElementById('graph').value
        });
    }
}