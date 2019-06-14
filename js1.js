function _get(e){for(var o=window.location.search.substr(1).split("&"),t={},n=0;n<o.length;n++){let e=o[n].split("=");t[decodeURIComponent(e[0])]=decodeURIComponent(e[1])}return t[e]}
function setCookie(e,t,n){var i=new Date;i.setTime(i.getTime()+24*n*60*60*1e3);var o="expires="+i.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}
function getCookie(e){for(var t=e+"=",n=document.cookie.split(";"),i=0;i<n.length;i++){for(var o=n[i];" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function getCookies(){return decodeURIComponent(document.cookie).split("; ").map(function(x){return {"key": x.split("=")[0], "value": x.split("=")[1]}});}
function _(el){return document.querySelector(el)}
