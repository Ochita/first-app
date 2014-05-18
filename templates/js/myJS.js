String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};

window.onload = function(e,homepage)
{ 
    socket = io.connect(homepage);
    socket.on('Error', function () 
    {
        alert("Ошибка. Сервер не может обработать данные.");
    });
    socket.on('newResult', function (msg) 
    {
        alert(msg.str);
    });
    document.getElementById('newOrder').onclick = function(e,homepage) 
    {
        regexp = /[a-z0-9!$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/
        str = document.getElementById('contact_mail').value.toString().toLowerCase();
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
                contact_address:document.getElementById('contact_address').value,
                contact_data:now.toString(),
                contact_message:document.getElementById('contact_message').value
                });
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
    document.getElementById('calcLouvers').onclick = function(e,homepage) 
    {
        var width = parseInt(document.getElementById('width_lt').value, 10);
        var height = parseInt(document.getElementById('height_lt').value, 10);
        var kol = parseInt(document.getElementById('kol_lt').value, 10);
        var sel1 = document.getElementById('select_lt');
        sel1 = sel1.options[sel1.selectedIndex].innerHTML; 
        if (width==NaN || height==NaN || kol==NaN)
            alert("Ошибка. Введено не целое число.")
        else
        {
            socket = io.connect(homepage);     
            socket.emit('newLCalc',{
                    width:width,
                    height:height,
                    kol:kol,
                    type:sel1});
        }
    }
    document.getElementById('calcRollers').onclick = function(e,homepage) 
    {
        var width = parseInt(document.getElementById('width_rt').value, 10);
        var height = parseInt(document.getElementById('height_rt').value, 10);
        var kol = parseInt(document.getElementById('kol_rt').value, 10);
        var sel1 = document.getElementById('select_rt'); 
        sel1 = sel1.options[sel1.selectedIndex].value; 
        var sel2 = document.getElementById('select_contr');
        sel2 = sel2.options[sel2.selectedIndex].value; 
        var sel3 = document.getElementById('select_auto');
        sel3 = sel3.options[sel3.selectedIndex].value; 
        var sel4 = document.getElementById('select_mont');
        sel4 = sel4.options[sel4.selectedIndex].value; 
        var sel5 = document.getElementById('select_auto');
        sel5 = sel5.options[sel5.selectedIndex].innerHTML; 
        var sel6 = document.getElementById('select_contr');
        sel6 = sel6.options[sel6.selectedIndex].innerHTML; 
        var sel7 = document.getElementById('select_mont');
        sel7 = sel7.options[sel7.selectedIndex].innerHTML; 
        if (width==NaN || height==NaN || kol==NaN)
            alert("Ошибка. Введено не целое число.")
        else
        {
            if (sel6!="Электропривод") 
                {
                    sel3="0";
                    sel5 = "Без автоматики"
                };
            socket = io.connect(homepage);     
            message = {
                    width:width,
                    height:height,
                    kol:kol,control:parseInt(sel2,10),auto:parseInt(sel3,10),
                    montage:parseInt(sel4,10),
                    ncontrol:sel5,nauto:sel6,nmontage:sel7,
                    type:sel1};
            socket.emit('newRCalc',message);
        }
    }
}