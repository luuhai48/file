var tempT="50px",tempL=(window.innerWidth-900)/2+"px"
var tempList=[]
function $(e,r){return r?r.querySelector(e):document.querySelector(e)}
function $$(e,l){return l?l.querySelectorAll(e):document.querySelectorAll(e)}
function $c(e,t){return t.closest(e)}
function drag(e){var n=0,t=0,o=0,l=0;function c(c){(c=c||window.event).preventDefault(),n=o-c.clientX,t=l-c.clientY,o=c.clientX,l=c.clientY,e.offsetTop-t<=$(".desktop").clientHeight-70&&(e.style.top=e.offsetTop-t+"px"),e.style.left=e.offsetLeft-n+"px",e.classList.contains("fullscreen")&&$(".fa-window-maximize",e).click()}function u(){document.onmouseup=null,document.onmousemove=null}$(".titlebar",e).onmousedown=function(n){(n=n||window.event).preventDefault();o=n.clientX,l=n.clientY,document.onmouseup=u,document.onmousemove=c}}
function startClock(){var e=new Date,t=e.getHours(),n=e.getMinutes(),a=e.toLocaleDateString();n=n<10?"0"+n:n,$("#time").innerHTML=t+":"+n,$("#date").innerHTML=a,setTimeout(startClock,1e4)}
function fullscreen(e){let target=$c(".window",e.target);if(!target.classList.contains("fullscreen")){tempT=target.style.top;tempL=target.style.left;target.style.top="0";target.style.left="0"}else{target.style.top=tempT;target.style.left=tempL}target.classList.toggle("fullscreen");$(".fa-window-maximize",target).classList.toggle("fa-window-restore")}
function sort(){let index=99;tempList.forEach(win=>{win.style.zIndex=index;index--})}
function rmClass(){$$(".shortcut").forEach(i=>{i.classList.remove("active")})}
function toggle(){$(".startmenu").classList.toggle("active")}
document.onmousedown=(e)=>{let win=$c(".window",e.target);if(win){if(tempList.indexOf(win)>0){tempList.splice(tempList.indexOf(win),1);tempList.unshift(win);sort()}}if($c(".shortcut",e.target)){rmClass();$c(".shortcut",e.target).classList.add("active")}else{rmClass()}}
document.onclick=(e)=>{if(e.target!=$(".startmenu")&&!$c(".startbtn",e.target))$(".startmenu").classList.remove("active")}
class windows{
    constructor(name){
        this.el = document.createElement("div")
        this.el.dataset.name = name
        this.el.classList.add("window")
        this.el.style.top=tempT
        this.el.style.left=tempL
        this.el.innerHTML=inner.window
        $(".fa-window-minimize",this.el).onclick=()=>{this.el.classList.add("hide")}
        $(".fa-window-close",this.el).onclick=()=>{this.del()}
        tempList.unshift(this.el)
        drag(this.el)
        $("body").appendChild(this.el)
        sort()
        
        this.task = document.createElement("div")
        this.task.classList.add("task")
        this.task.innerHTML=`<i class="fas fa-folder-open"></i><div class="task-title"></div>`
        this.task.onclick=()=>{this.el.classList.toggle("hide")}
        $(".tasks").appendChild(this.task)
    }
    set title(title){
        $(".title",this.el).textContent="| "+title
        $(".task-title",this.task).textContent=title
    }
    set address(address){
       $(".address",this.el).querySelector("input").value=address
    }
    set content(content){
        $(".content",this.el).innerHTML=content
    }
    del(){
        $("body").removeChild(this.el)
        $(".tasks").removeChild(this.task)
    }
}
function start(){
    if($$('.window[data-name="start"]').length<3){
        let win=new windows("start")
        win.title="Phim Lửa"
        win.address="Phim Lua/Start"
        win.content=inner.start
    }
}