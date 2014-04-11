var gCanvasElement;
var drawingCanvas;
var oldX = 8*cell;
var oldY = 5*cell;
var cell = 30;
var s1=0
var s2=0;
var me={isCurrent:false};
var opponent;
var context;
var myname;
var game2 = false;
//var io = require('.///socket.io');
var gamer1;
var gamer2;
var matrix;
var listOfLines = [];
var regrez = true;

function DrawCircle(context,x,y)
{
     context.strokeStyle = "#000000";
     context.fillStyle = "#fc0";
     //кружочек в координатах
     context.beginPath();
     context.moveTo(oldX,oldY)
     context.lineTo(x,y)       
     context.closePath();
     context.stroke();
     context.fill();

     context.beginPath();
     context.arc(oldX,oldY,2,0,Math.PI*2,false)    
     context.closePath();
     context.fill();
     context.stroke();

     context.fillStyle = "#f00";
     context.beginPath();
     context.arc(x,y,2,0,Math.PI*2,false) 
     context.closePath();
     context.fill();
     context.stroke();

     oldX = x;
     oldY = y;
}

function DrawStartBall(context)
{
    context.strokeStyle = "#000000";
    context.fillStyle = "#f00";
    context.beginPath();
    context.arc(8*cell,5*cell, 2, 0, Math.PI * 2, false)
    context.closePath();
    context.stroke();
    context.fill();
    oldX = 8*cell;
    oldY = 5*cell;
}

function DrawInformation(context,str)
{
     context.strokeStyle = "#fff";
     context.fillStyle = "#fff";
     context.beginPath();
     context.rect(0,8*cell+5,16*cell,2*cell)
     context.closePath();
     context.stroke();
     context.fill();

     var x = drawingCanvas.width/2;
     context.fillStyle = "#000";
     context.font = 'normal 20pt Garamond';
     context.textAlign = 'center';
     context.fillText(str, x, 270);
}

function DrawWhiteScreen(context)
{
     context.strokeStyle = "#fff";
     context.fillStyle = "#fff";
     context.beginPath();
     context.rect(0*cell,0*cell,16*cell,10*cell)
     context.closePath();
     context.stroke();
     context.fill();
}

function DrawPole(context,n1,n2,str)
{
    // заливка
     context.strokeStyle = "#fff";
     context.fillStyle = "#fff";
     context.beginPath();
     context.rect(0*cell,0*cell,16*cell,10*cell)
     context.closePath();
     context.stroke();
     context.fill();
	 // Рисуем прямоугольник
     context.strokeStyle = "#000";
     context.fillStyle = "#fc0";
     context.beginPath();
     //поле
     context.rect(4*cell,2*cell,8*cell,6*cell)
     context.rect(3*cell,4*cell,1*cell,2*cell)
     context.rect(12*cell,4*cell,1*cell,2*cell)
     context.closePath();
     context.stroke();
     context.fill();
     //линии    
     context.beginPath();
     //вертикальные
     context.moveTo(4*cell,4*cell)
     context.lineTo(4*cell,6*cell)
     for(var x=5*cell;x<=11*cell;x+=cell)
     {
        context.moveTo(x,2*cell)
        context.lineTo(x,8*cell)
     }
     context.moveTo(12*cell,4*cell)
     context.lineTo(12*cell,6*cell)
     //горизонтальные
     for(var y=2*cell;y<=7*cell;y+=cell)
     {
        if (y !== 5*cell)
        {
            context.moveTo(4*cell,y)
            context.lineTo(12*cell,y)
        }
     }
     context.moveTo(3*cell,5*cell)
     context.lineTo(13*cell,5*cell)
     context.closePath();
     context.strokeStyle = 'grey';
     context.stroke();
     context.fill();
     //инициалы
     context.fillStyle = "#000";
     context.font = 'italic 40pt Calibri';
     context.textAlign = 'left';
     context.fillText(n1, 50, 165);
     context.fillText(n2, 395, 165);

     var x = drawingCanvas.width/2;
     context.fillStyle = "#000";
     context.font = 'normal 20pt Garamond';
     context.textAlign = 'center';
     context.fillText(str, x, 30);
}

function matrixArray()
{
  var arr = new Array();
  for(var i=0; i<11; i++){
    arr[i] = new Array();
    for(var j=0; j<7; j++){
      arr[i][j] = new Point();
      if (((j===0 || j===6) && i>=2 && i<=8) || ((i===1||i===9)&&(j===1||j===5)))
        arr[i][j].degree=5;
        if ((i===1||i===9)&&(j===0||j===6))
            arr[i][j].degree=7;
        if ((i===1||i===9)&&(j===2||j===4))
            arr[i][j].degree=3;
    }
  }
  return arr;
}

function find(array, point1,point2) 
{
  for(var i=0; i<array.length; i++) {
    if ((array[i].begin === point1 && array[i].end === point2) || (array[i].begin === point2 && array[i].end === point1)) return true;
  }
  return false;
}

function addToLog(text)
{
    document.querySelector('#log').innerHTML += text+'<br>';
    document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;
}

function Point()
{
    this.degree = 0;
}

function Line(begin,end)
{
    this.begin = begin;
    this.end = end;
}

function Player(name)
{
    this.name = name;
    this.isCurrent = false;
}

function makeAMove(context,oldx,oldy,newx,newy)
{
    matrix[oldx][oldy].degree++;
    var nowLine = new Line(matrix[oldx][oldy],matrix[newx][newy]);
    listOfLines.push(nowLine);
    newX=newx*cell+3*cell;
    newY=newy*cell+2*cell;
    DrawCircle(context,newX,newY)
    matrix[newx][newy].degree++;
    if (newx==0)    
    {
        addToLog("Гол забивает "+gamer2.name+"!");
        s2++;
        game2 = true;
        //context= document.getElementById('smile').getContext('2d');
        DrawWhiteScreen(context);
        DrawPole(context,gamer1.name.charAt(0),gamer2.name.charAt(0),gamer1.name+" "+s1+":"+s2+" "+gamer2.name)
        DrawStartBall(context)
        DrawInformation(context,"Сейчас ходит: "+gamer1.name) 
        matrix = new matrixArray();
        gamer1.isCurrent = true;
        gamer2.isCurrent = false;
    }
    else 
        if (newx==10) 
        {
            addToLog("Гол забивает "+gamer1.name+"!");
            s1++
            game2 = true;
            //context= document.getElementById('smile').getContext('2d');
            DrawWhiteScreen(context);
            DrawPole(context,gamer1.name.charAt(0),gamer2.name.charAt(0),gamer1.name+" "+s1+":"+s2+" "+gamer2.name)
            DrawStartBall(context)
            DrawInformation(context,"Сейчас ходит: "+gamer1.name) 
            matrix = new matrixArray();
            gamer1.isCurrent = true;
            gamer2.isCurrent = false;
        }
    else if (matrix[newx][newy].degree===1)
    {
        gamer1.isCurrent = !gamer1.isCurrent;
        gamer2.isCurrent = !gamer2.isCurrent;
        var nowname
        if (gamer1.isCurrent) nowname = gamer1.name;
        else nowname = gamer2.name;
        nowname = "Сейчас ходит: "+nowname;
        context = drawingCanvas.getContext('2d');
        DrawInformation(context,nowname)           
    }

}

function initGame(canvasElement)
{
	if(!canvasElement)
	{
		window.onload = function() 
   		{
            var ID;
            socket = io.connect('http://46.42.51.81:2222');
            socket.on('connect', function () 
            {
                socket.on('for_all', function (data) 
                {
                    addToLog(data.text);
                });
                socket.on('regresult', function (data) 
                {
                    addToLog(data.text);
                });
                socket.on('hello', function (data) 
                {
                    addToLog(data.text);
                });
                socket.on('exit_opponent',function(data)
                {
                    addToLog(data.text);
                    DrawWhiteScreen(context)
                })
                socket.on('auto_error',function(data)
                {
                    addToLog(data.text);
                    //regrez = false;
                    document.getElementById('reg_now').style.display = '';
                    document.getElementById('enter_now').style.display = '';
                    document.getElementById('exit_now').style.display = 'none';
                })
                socket.on('move',function (data)
                {
                    makeAMove(context,data.oldx,data.oldy,data.newx,data.newy);
                });
                socket.on('opponent', function (data)
                {
                    addToLog(data.text);
                    if (data.isgamer1)
                    {
                        gamer1 = new Player(myname)    
                        gamer2 = new Player(data.name)
                        me = gamer1;
                        opponent = gamer2;

                    }
                    else
                    {
                        gamer2 = new Player(myname)    
                        gamer1 = new Player(data.name)
                        me = gamer2;
                        opponent = gamer1;
                    }
                    gamer1.isCurrent = true;
                    context = drawingCanvas.getContext('2d');          
                    if(drawingCanvas && drawingCanvas.getContext) 
                    {
                        context= drawingCanvas.getContext('2d');
                        DrawPole(context,gamer1.name.charAt(0),gamer2.name.charAt(0),gamer1.name+" "+s1+":"+s2+" "+gamer2.name)
                        DrawStartBall(context)
                        DrawInformation(context,"Сейчас ходит: "+gamer1.name) 
                        matrix = new matrixArray();
                    }
                });
            });

            //канва
    		drawingCanvas = document.getElementById('smile');
            var newX,newY,numX,ex,ey,numY,oldnumX,oldnumY
            drawingCanvas.onclick = function(e)
            {
               e = e || event;
              if (isStepAvailable(numX,numY,oldnumX,oldnumY,ex,ey))
              {
                context = drawingCanvas.getContext('2d');
                makeAMove(context,oldnumX,oldnumY,numX,numY);
                socket.emit('move',{oldx:oldnumX, oldy:oldnumY, newx:numX, newy:numY})
              }
            }
            drawingCanvas.onmousemove = function(e)
            {
              e = e || event;
              newX = e.pageX-drawingCanvas.offsetLeft;
              newY = e.pageY-drawingCanvas.offsetTop;
              numX = Math.round((newX-3*cell)/cell);
              ex = newX;
              ey = newY;
              newX=numX*cell+3*cell;
              ex = Math.abs(ex-newX)
              numY = Math.round((newY-2*cell)/cell);
              newY=numY*cell+2*cell;
              ey = Math.abs(ey-newY);
              oldnumX = Math.round((oldX-3*cell)/cell);
              oldnumY = Math.round((oldY-2*cell)/cell);
              if (isStepAvailable(numX,numY,oldnumX,oldnumY,ex,ey))
                drawingCanvas.style.cursor="pointer";
                else
               drawingCanvas.style.cursor="default";
            }
            function isStepAvailable(numX,numY,oldnumX,oldnumY,ex,ey)
            {
                if(me.isCurrent
                && matrix[numX][numY].degree!==7 && Math.abs(oldnumX-numX)<2 && Math.abs(oldnumY-numY)<2 
                && !find(listOfLines,matrix[oldnumX][oldnumY],matrix[numX][numY])
                && matrix[oldnumX][oldnumY]!==matrix[numX][numY]
                && !((numX==0 || numX==10) && (numY<2 || numY>4))
                && !((numX==1 && oldnumX==1 && !(numY>1 && numY<5)) || (numX==9 && oldnumX==9 && !(numY>1 && numY<5)) || (numY==0 && oldnumY==0) || (numY==6 && oldnumY==6))
                && !((numX==0 || numX==10)&&(numY==2 || numY==4))
                && (ex<=cell/3 && ey<=cell/3))
                return true;
                return false;
            }
			document.getElementById('reg_now').onclick = function()
			{
				var div = document.getElementById('register');
				var foot = document.getElementById('football');
                div.style.display = '';
                foot.style.display = 'none';
				//document.getElementById('login1').value='';
				//document.getElementById('email1').value='';
				document.getElementById('password1').value='';				
				return false;
			};
			document.getElementById('enter_now').onclick = function()
			{
				var div = document.getElementById('enter');
				var foot = document.getElementById('football');
				div.style.display = '';
				foot.style.display = 'none';
				return false;
			};
			document.getElementById('exit_now').onclick = function()
			{
				location.reload();
                return false;
			};
			document.getElementById('submit1').onclick = function()
			{
				if (document.getElementById('login1').value!='' && document.getElementById('email1').value!='' && document.getElementById('password1').value!='')
				{
                    socket.emit("register",{login:document.getElementById('login1').value,email:document.getElementById('email1').value,password:document.getElementById('password1').value})
                    //if (regrez)
                    //{
    					var div = document.getElementById('register');
    					var foot = document.getElementById('football');
    					div.style.display = 'none';
    					foot.style.display = ''; 
                   // } 
				}
				//document.getElementById('reg_now').style.display = 'none';
				return false;
			};
			document.getElementById('submit2').onclick = function()
			{
				if (document.getElementById('login2').value!='' && document.getElementById('password2').value!='')
				{
					var div = document.getElementById('enter');
					var foot = document.getElementById('football');
					div.style.display = 'none';
					foot.style.display = '';
					myname = document.getElementById('login2').value;
					socket.emit('name',{text:myname,passwd:document.getElementById('password2').value});
					
					document.querySelector('#log').innerHTML = '';
					document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;
					document.getElementById('reg_now').style.display = 'none';
					document.getElementById('enter_now').style.display = 'none';
					document.getElementById('exit_now').style.display = '';
					
					context = drawingCanvas.getContext('2d');
					DrawWhiteScreen(context);
				}
				return false;
			};
   		}	
	}
}