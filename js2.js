var content=_("#content"),title=_("#title");if(_get("url"))title.innerHTML="Đang tải....",axios({method:"get",url:"https://lh-webtester.000webhostapp.com/api.php?url="+encodeURIComponent(_get("url")),timeout:3e4}).then(e=>{title.innerHTML=e.data.title,content.innerHTML=e.data.content,_("title").textContent=e.data.title;let t=document.createElement("a");t.classList.add("btn"),t.href="?url="+e.data.next,document.body.appendChild(t)}).catch(e=>{content.innerHTML=e});else if(_get("del"))setCookie(_get("del"),"",-1),window.location.href="?read";else if(_get("read")){title.innerHTML="Các truyện đã đọc";let e=document.createElement("ul");e.classList.add("read"),getCookies().forEach(t=>{if(t.key.includes("rsave")){let n=document.createElement("li");n.innerHTML=`<a href="?url=${t.value}">${t.key.replace("rsave-","").replace(/-/g," ")}</a><a href="?del=${t.key}">Xóa</a>`,e.appendChild(n)}}),content.appendChild(e)}else{function autocomplete(e,t){var n;function i(e){if(!e)return!1;!function(e){for(var t=0;t<e.length;t++)e[t].classList.remove("autocomplete-active")}(e),n>=e.length&&(n=0),n<0&&(n=e.length-1),e[n].classList.add("autocomplete-active")}function l(t){for(var n=document.getElementsByClassName("autocomplete-items"),i=0;i<n.length;i++)t!=n[i]&&t!=e&&n[i].parentNode.removeChild(n[i])}e.addEventListener("input",function(i){var o,a,c,r=this.value;if(l(),!r)return!1;for(n=-1,(o=document.createElement("DIV")).setAttribute("id",this.id+"autocomplete-list"),o.setAttribute("class","autocomplete-items"),this.parentNode.appendChild(o),c=0;c<t.length;c++)t[c].substr(0,r.length).toUpperCase()==r.toUpperCase()&&((a=document.createElement("DIV")).innerHTML="<b>"+t[c].substr(0,r.length)+"</b>",a.innerHTML+=t[c].substr(r.length),a.innerHTML+="<input type='hidden' value='"+t[c]+"'>",a.addEventListener("click",function(t){e.value=this.getElementsByTagName("input")[0].value,l()}),o.appendChild(a))}),e.addEventListener("keydown",function(e){var t=document.getElementById(this.id+"autocomplete-list");t&&(t=t.getElementsByTagName("div")),40==e.keyCode?(n++,i(t)):38==e.keyCode?(n--,i(t)):13==e.keyCode&&(e.preventDefault(),n>-1&&t&&t[n].click())}),document.addEventListener("click",function(e){l(e.target)})}content.innerHTML='<form>\n                <label><b>Địa chỉ chương truyện:</b></label>\n                <div class="autocomplete">\n                    <input required type="text" name="url" id="url" placeholder="ví dụ: http://truyencv.com/de-ba/chuong-1/" autocapitalize="none" spellcheck=false />\n                </div>\n                <center><input type="submit" value="Xem" class="button"/></center>\n            </form>';var items=["http://","https://","http://truyencv.com/","truyencv.com/","http://truyenfull.vn/","truyenfull.vn/","http://wikidich.com/","wikidich.com/","https://truyenyy.com/","truyenyy.com/"];autocomplete(document.querySelector('input[type="text"]'),items),document.querySelector('[name="url"]').addEventListener("keydown",function(e){"13"==(e=e||window.event).keyCode&&-1!==document.querySelector("input").value.indexOf("chuong")&&document.querySelector('[type="submit"]').click()})}