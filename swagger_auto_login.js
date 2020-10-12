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
// @require https://cdn.jsdelivr.net/npm/jwt-decode@3.0.0/build/jwt-decode.js
// ==/UserScript==

const addStyle = (css) => {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
const _$ = (parent, selector) => {
    return parent.querySelector(selector);
}

const requests = async (url = '', data = {}, method = 'POST') => {
  const response = await fetch(url, {
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATH'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET' , // *GET, POST, PUT, DELETE, etc.
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return response.json();
}

const find_key = (obj, key) => {
    for (let k in obj) {
        if (k === key) {
            return obj[k];
        }
        if (typeof obj[k] === "object") {
            return find_key(obj[k], key);
        }
    }
}

(function() {
    'use strict';

    const init = () => {
        if (window.ui === undefined) {
            setTimeout(init, 1000);
            return;
        }

        console.log('%cSwagger Auto Login Is Running', 'color: white;background:red;font-size:22px');

        var urlpath = window.location.pathname,
            key_prefix = "";
        if (urlpath.includes("/admin")) {
            key_prefix = "admin_";
        }

        var originalAuthorize = window.ui.authActions.authorize,
            originalLogout = window.ui.authActions.logout;

        addStyle(`.sal--btn{outline:none;border:1px solid #ccc;border-radius:3px;padding:5px;cursor:pointer;}
.sal--btn.danger{color:white;background:red;}
.sal--btn.success{color:white;background:#4CAF50;}
.sal--box{position:fixed;top:20px;right:20px;z-index:99999;}
.sal--box-content{position:absolute;top:calc(100% + 5px);right:0;background:white;color:black;border-radius:3px;padding:10px 15px;border:1px solid #ccc;display:none;}
.sal--block{display:block !important;}
.sal--input{box-sizing:border-box;padding:4px 6px;margin-bottom:5px;border:1px solid #ccc}
.sal--btn-submit{display:block;outline:none;border:none;border-radius:3px;padding:5px;cursor:pointer;color:white;background:black;margin-top:10px;}
.sal--autorefresh{padding-left:5px;}
.sal--autorefresh input[type="checkbox"]{float:left;}`);

        var login_url_value = window.localStorage.getItem(`${key_prefix}loginurl`),
              refresh_url_value = window.localStorage.getItem(`${key_prefix}refreshurl`),
              email_value = window.localStorage.getItem(`${key_prefix}email`),
              password_value = window.localStorage.getItem(`${key_prefix}password`),
              autorefresh_value = window.localStorage.getItem(`${key_prefix}autorefresh`) === "true";

        var box = document.createElement("div");
        box.classList.add("sal--box");
        box.innerHTML = `<button class="sal--btn" id="toggle_btn">SAL</button>
<div class="sal--box-content">
    <form>
        <input class="sal--input" placeholder="Login URL" value="${login_url_value || ''}" id="login_url_input" required="true">
        <input class="sal--input" placeholder="Refresh URL" value="${refresh_url_value || ''}" id="refresh_url_input" required="true">
        <input class="sal--input" type="email" placeholder="Email" value="${email_value || ''}" id="email_input" required="true">
        <input class="sal--input" type="password" placeholder="Password" value="${password_value || ''}" id="password_input" required="true">
        <label><input type="checkbox" checked="${autorefresh_value || 'false'}" id="autorefresh_input">Auto Refresh</label>
        <button class="sal--btn-submit" type="submit">Save & Refresh</button>
    </form>
</div>`;

        var toggle_button = _$(box, "#toggle_btn"),
            box_content = _$(box, ".sal--box-content"),
            login_url_input = _$(box, "#login_url_input"),
            refresh_url_input = _$(box, "#refresh_url_input"),
            email_input = _$(box, "#email_input"),
            password_input = _$(box, "#password_input"),
            form = _$(box, "form"),
            autorefresh_input = _$(box, "#autorefresh_input");


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
            window.localStorage.removeItem(`${key_prefix}refresh`);
            toggle_button.classList.remove("success", "danger");
            return originalLogout(payload);
        };

        toggle_button.onclick = () => {
            box_content.classList.toggle("sal--block");
            login_url_input.focus();
        }

        const refresh = (refresh) => {
            requests(refresh_url_value, {refresh}, "POST")
            .then(data => {
                let access_token = find_key(data, "access");
                if (!access_token) {
                    throw new Error("Failed to refresh");
                }

                window.localStorage.setItem(`${key_prefix}token`, access_token);
                window.ui.preauthorizeApiKey("Bearer", access_token);

                swagger_authorize(access_token);
            })
            .catch(err => {
                console.error(err);
                toggle_button.classList.remove("success", "danger");
                toggle_button.classList.add("danger");
                toggle_button.title = "Error: Failed to login";
            })
        }

        const check_alive = () => {
            if (window.token_exp <= new Date()) {
                try {
                    refresh(window.localStorage.getItem(`${key_prefix}refresh`))
                } catch(err) {
                    console.error(err);
                    toggle_button.classList.remove("success", "danger");
                    toggle_button.classList.add("danger");
                    toggle_button.title = "Error: Failed to login";

                    login(login_url_value, email_value, password_value);
                }
            }
            if (autorefresh_value === true) {
                setTimeout(check_alive, 5000);
            }
        }

        const swagger_authorize = (token) => {
            if (token) {
                try {
                    token = token.replace("Bearer ", "");
                    var decoded = jwt_decode(token); // eslint-disable-line
                    window.token_exp = new Date(decoded.exp * 1000);
                    check_alive();
                }
                catch (err) {
                    console.error(err);
                    toggle_button.classList.remove("success", "danger");
                    toggle_button.classList.add("danger");
                    toggle_button.title = "Error: Failed to login";
                    return;
                }

                const authorize = () => {
                    token = token.replace("bearer ", "Bearer ");
                    if (!token.includes("Bearer")) {
                        token = `Bearer ${token}`;
                    }
                    let result = window.ui.preauthorizeApiKey("Bearer", token);
                    if (result === null) {
                        return setTimeout(authorize, 300);
                    }
                    toggle_button.classList.add("success");
                };
                authorize();
            }
        }

        const login = (url, email, password) => {
            requests(url, {email, password}, "POST")
            .then(data => {
                try {
                    let refresh_token = find_key(data, "refresh"),
                        access_token = find_key(data, "access");
                    if (!refresh_token && !access_token) {
                        throw new Error("Failed to login");
                    }

                    window.localStorage.setItem(`${key_prefix}token`, access_token);
                    window.localStorage.setItem(`${key_prefix}refresh`, refresh_token);
                    window.ui.preauthorizeApiKey("Bearer", access_token);

                    swagger_authorize(access_token);
                } catch (err) {
                    console.error(err);
                    toggle_button.classList.remove("success", "danger");
                    toggle_button.classList.add("danger");
                    toggle_button.title = "Error: Failed to login";
                    return;
                }
            })
                .catch(err => {
                console.error(err);
            })
        }

        form.onsubmit = (event) => {
            event.preventDefault();
            login_url_value = login_url_input.value;
            refresh_url_value = refresh_url_input.value;
            email_value = email_input.value;
            password_value = password_input.value;
            autorefresh_value = autorefresh_input.checked;

            window.localStorage.removeItem(`${key_prefix}token`);
            window.localStorage.removeItem(`${key_prefix}refresh`);
            window.localStorage.setItem(`${key_prefix}loginurl`, login_url_value);
            window.localStorage.setItem(`${key_prefix}refreshurl`, refresh_url_value);
            window.localStorage.setItem(`${key_prefix}email`, email_value);
            window.localStorage.setItem(`${key_prefix}password`, password_value);
            window.localStorage.setItem(`${key_prefix}autorefresh`, autorefresh_value);

            box_content.classList.remove("sal--block");
            login(login_url_value, email_value, password_value);
        }

        box.append(toggle_button, box_content);
        document.body.appendChild(box);

        var token = window.localStorage.getItem(`${key_prefix}token`);
        if (!token && login_url_value && email_value && password_value) {
            login(login_url_value, email_value, password_value);
        } else if(token) {
            swagger_authorize(token);
        }
    };
    init();
})();
