// ==UserScript==
// @name         123doc.org downloader
// @namespace    https://viethai.cf
// @version      0.1
// @description  try to take over the world!
// @author       LuuVietHai
// @match        *.123doc.org/document/*
// @grant        none
// ==/UserScript==

var saveData = (function() {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function(data, fileName) {
    var blob = new Blob([data], { type: "octet/stream" }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

(function() {
  "use strict";
  document.body.insertAdjacentHTML(
    "beforeend",
    `<a id="custom-download-btn" style="display:block;position:fixed;top:10px;right:10px;padding:5px 10px;border:none;outline:none;background:#eb4034;color:#fff;cursor:pointer;z-index:999999">Download</a>`
  );
  var host = window.location.host;
  document.querySelector("#custom-download-btn").onclick = () => {
    if (!host.includes("text.")) {
      window.location.href =
        "https://text.123doc.org" + window.location.pathname;
    } else {
      var content = "",
        title = document.querySelector(".title_document h1").textContent;
      if (document.querySelector(".show_content_pc")) {
        content = document.querySelector(".show_content_pc").innerText;
      } else if (document.querySelector(".show_content_mobile")) {
        content = document.querySelector(".show_content_mobile").innerText;
      }
      saveData(content, title + ".txt");
    }
  };
})();
