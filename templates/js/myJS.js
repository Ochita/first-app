window.onload = function()
{ 
    document.getElementById('newOrder').onclick = function(e,homepage) 
    {
    var now = new Date();
    alert(now);
    socket = io.connect("http://0.0.0.0:3001");
    socket.emit('newOrder',{
        contact_name:document.getElementById('contact_name').value,
        contact_mail:document.getElementById('contact_mail').value,
        contact_phone:document.getElementById('contact_phone').value,
        contact_address:document.getElementById('contact_address').value,
        contact_data:now,
        contact_message:document.getElementById('contact_message').value
        });
    }
}