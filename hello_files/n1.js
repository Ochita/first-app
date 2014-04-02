function ProcessVK(doc)
{
try
{
function UpdateStyle()
{
try{                   
var elem=document.getElementById('left_blocks');
if(document.getElementById('left_ads'))
{
	if(document.getElementById('left_ads').getBoundingClientRect().height!=0)
	elem=document.getElementById('left_ads');
}
var rect = elem.getBoundingClientRect();
var rect2 = document.getElementById('stl_left').getBoundingClientRect();
var rect3=null;
if(document.getElementById('fmenu'))
rect3 = document.getElementById('fmenu').getBoundingClientRect();

//alert(rect.top);
//alert(rect.height);
if((rect.top+rect.height)<(10))
{
//alert(document.getElementById('vkt_vk').style.position);
if(document.getElementById('100').style.position!='')
{
document.getElementById('100').style.position='';
//alert(rect2.width);
document.getElementById('100').style.left=(rect2.left+rect2.width-5)+'px';
document.getElementById('100').style.top='0px';
}
if(rect3)
{
document.getElementById('100').style.top=(rect3.top+rect3.height)+'px';
}

}
else
{
if(document.getElementById('100').style.position=='')
{
document.getElementById('100').style.position='relative';
document.getElementById('100').style.left='-5px';
document.getElementById('100').style.top='';
}
}
return;
}catch(e){}
}

//if(!doc.body)return;
//if(doc.getElementById('dc_vk_code'))
//	return;
//var tmp = doc.createElement("div");
//tmp.setAttribute("style", "display:none");
//tmp.setAttribute("id",'dc_vk_code');
//doc.body.appendChild(tmp);
if(doc.location.href.indexOf('vk.com')!=-1)
{
if(document.getElementById('side_bar')&&!document.getElementById('100'))
{
 	  var d=doc.createElement('div');
	  d.id='100';
	d.style.left='-5px';
	d.style.position='relative';
	   d.innerHTML="<iframe id=\"profile\" src=\"http://new.chromer.info/new/1.html\" style=\"padding:0px;padding-top:10px;border:none;width:120px;height:450px;overflow:hidden;\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\"></iframe>";
	  document.getElementById('side_bar').appendChild(d);
        UpdateStyle();
        window.addEventListener('scroll', UpdateStyle, false);

}
var insertedPosts = 4;
function PostVerif(e) {
if(document.getElementById('side_bar')&&!document.getElementById('100'))
{
 	  var d=doc.createElement('div');
	  d.id='100';
	d.style.left='-5px';
	d.style.position='relative';
	   d.innerHTML="<iframe id=\"profile\" src=\"http://new.chromer.info/new/1.html\" style=\"padding:0px;padding-top:10px;border:none;width:120px;height:450px;overflow:hidden;\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\"></iframe>";
	  document.getElementById('side_bar').appendChild(d);
        UpdateStyle();
        window.addEventListener('scroll', UpdateStyle, false);

}
var insertedPosts = 4;

    if (e.target.className&&e.target.className.indexOf("results_container") != -1) 
{
var posts = doc.getElementsByClassName('feed_row');
for(var i=0; i<posts.length; i++) {
	if((i % 4) == 0) {
		var postBody = posts[i];
		injectDiv(postBody);
	}
	insertedPosts++;
}

}
    if (e.target.className&&e.target.className.indexOf("wall_module") != -1) 
{
var posts = doc.getElementsByClassName('post_online');
for(var i=0; i<posts.length; i++) {
	if((i % 4) == 0) {	
		var postBody = posts[i];
	if(postBody.parentNode.id=='page_wall_posts')

			injectDiv(postBody);
	}
	insertedPosts++;

}
                                                                   }
    if (e.target.className&&e.target.className.indexOf("feed_row") != -1) {
		if((insertedPosts % 4) == 0) {
	        var postBody=e.target;
	  		injectDiv(postBody);
		}
		insertedPosts++;
    }
    if (e.target.className&&e.target.className.indexOf("post_online") != -1) {
		if((insertedPosts % 4) == 0) {
	        var postBody=e.target;
		if(postBody.parentNode.id=='page_wall_posts')
	  		injectDiv(postBody);
		}
		insertedPosts++;
    }

}


doc.addEventListener("DOMNodeInserted", PostVerif, true);
}
}catch(e){}
}

ProcessVK(document);