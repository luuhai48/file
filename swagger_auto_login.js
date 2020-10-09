// ==UserScript==
// @name         Swagger Auto Login
// @namespace    https://canteccouriers.com
// @version      0.3
// @description  Remember Swagger Bearer token
// @author       hai.luu
// @match        http://localhost/*
// @match        127.0.0.1/*
// @match        0.0.0.0/*
// @match        https://*.canteccouriers.com/*
// @grant none
// @run-at document-idle
// ==/UserScript==

(function() {
    'use strict';

    const init = () => {
        if (window.ui === undefined) {
            setTimeout(init, 1000);
            return;
        }

        console.log('%cSwagger Auto Login Is Running', 'color: white;background:red;font-size:22px');

        const addStyle = (css) => {
            var head, style;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            head.appendChild(style);
        }

        var urlpath = window.location.pathname,
            key_prefix = "";
        if (urlpath.includes("/admin")) {
            key_prefix = "admin_";
        }

        var originalAuthorize = window.ui.authActions.authorize,
            originalLogout = window.ui.authActions.logout;

        window.ui.authActions.authorize = function (payload) {
            payload.Bearer.value = payload.Bearer.value.replace("bearer ", "Bearer ");
            if (!payload.Bearer.value.includes("Bearer")) {
                payload.Bearer.value = `Bearer ${payload.Bearer.value}`;
            }
            window.localStorage.setItem(`${key_prefix}token`, payload.Bearer.value);
            return originalAuthorize(payload);
        };

        window.ui.authActions.logout = function (payload) {
            window.localStorage.removeItem(`${key_prefix}token`);
            return originalLogout(payload);
        };

        addStyle(`.sal--btn{color:white;background:red;outline:none;border:none;border-radius:3px;padding:5px;cursor:pointer;}
.sal--box{position:fixed;top:20px;right:20px;z-index:99999;}
.sal--box-content{position:absolute;top:calc(100% + 5px);right:0;background:white;color:black;border-radius:3px;padding:10px 15px;border:1px solid #ccc;display:none;}
.sal--block{display:block !important;}
.sal--input{box-sizing:border-box;padding:4px 6px;margin-bottom:5px;border:1px solid #ccc}
.sal--btn-submit{display:block;outline:none;border:none;border-radius:3px;padding:5px;cursor:pointer;color:white;background:black;margin-top:10px;}
.sal--autorefresh{padding-left:5px;}
.sal--autorefresh input[type="checkbox"]{float:left;}`);

        var toggle_button = document.createElement("button"),
            box = document.createElement("div"),
            box_content = document.createElement("div"),
            url_input = document.createElement("input"),
            email_input = document.createElement("input"),
            password_input = document.createElement("input"),
            submit_button = document.createElement("button"),
            auto_refresh = document.createElement("input"),
            label = document.createElement("label");

        const url_value = window.localStorage.getItem(`${key_prefix}url`),
              email_value = window.localStorage.getItem(`${key_prefix}email`),
              password_value = window.localStorage.getItem(`${key_prefix}password`),
              autorefresh_value = window.localStorage.getItem(`${key_prefix}autorefresh`);

        box.classList.add("sal--box");
        toggle_button.classList.add("sal--btn");
        toggle_button.textContent = "Auto Login";
        box_content.classList.add("sal--box-content");

        url_input.placeholder = "URL";
        url_input.classList.add("sal--input");
        email_input.type = "email";
        email_input.placeholder = "Email";
        email_input.classList.add("sal--input");
        password_input.type = "password";
        password_input.placeholder = "Password";
        password_input.classList.add("sal--input");
        submit_button.classList.add("sal--btn-submit");
        submit_button.textContent = "Save & Refresh";
        auto_refresh.type = "checkbox";
        label.textContent = "Auto Refresh";
        label.classList.add("sal--autorefresh");
        label.appendChild(auto_refresh);
        box_content.append(url_input, email_input, password_input, label, submit_button);

        if (url_value) {
            url_input.value = url_value;
        }
        if (email_value) {
            email_input.value = email_value;
        }
        if (password_value) {
            password_input.value = password_value;
        }
        if (autorefresh_value) {
            auto_refresh.checked = autorefresh_value === "true";
        }

        toggle_button.onclick = () => {
            box_content.classList.toggle("sal--block");
            url_input.focus();
        }
        submit_button.onclick = () => {
            window.localStorage.setItem(`${key_prefix}url`, url_input.value);
            window.localStorage.setItem(`${key_prefix}email`, email_input.value);
            window.localStorage.setItem(`${key_prefix}password`, password_input.value);
            window.localStorage.setItem(`${key_prefix}autorefresh`, auto_refresh.checked);
        }

        box.append(toggle_button, box_content);

        document.body.appendChild(box);

        const token = window.localStorage.getItem(`${key_prefix}token`);
        if (token) {
            const authorize = () => {
                let result = window.ui.preauthorizeApiKey('Bearer', token);
                if (result === null) {
                    setTimeout(authorize, 300);
                }
            };
            authorize();
        }
    };
    init();
})();
