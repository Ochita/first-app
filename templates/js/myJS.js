String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};

window.onload = function()
{ 
    document.getElementById('newOrder').onclick = function(e,homepage) 
    {
        regexp = /[a-z0-9!$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/
        str = document.getElementById('contact_mail').value.toString().toLowerCase();
        //alert(str+"^"+str.match(regexp));
        if ((document.getElementById('contact_name').value!="")
            && ((document.getElementById('contact_mail').value!="" 
                && (str==str.match(regexp)))        ||
                document.getElementById('contact_phone').value!=""))
            {
                var now = new Date();
                socket = io.connect(homepage);     
                socket.emit('newOrder',{
                contact_name:document.getElementById('contact_name').value,
                contact_mail:document.getElementById('contact_mail').value,
                contact_phone:document.getElementById('contact_phone').value,
                contact_address:str,
                contact_data:now,
                contact_message:document.getElementById('contact_message').value
                });
                //document.getElementById('myModal').hide;
                $('#myModal').modal('hide');
            }
            else
            {
                if (document.getElementById('contact_name').value=="")
                    alert("Пожалуйста, введите ФИО.");
                else
                if (document.getElementById('contact_mail').value==""  &&
                    document.getElementById('contact_phone').value=="")
                    alert("Пожалуйста, укажите телефон или e-mail.");
                else
                if (str!=str.match(regexp) && document.getElementById('contact_phone').value=="")
                    alert("Пожалуйста, проверьте правильность ввода электронной почты.");
            }
    }
}