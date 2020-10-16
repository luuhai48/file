// ==UserScript==
// @name         Swagger Auto Login
// @namespace    https://canteccouriers.com
// @version      2.1
// @description  Remember Swagger Bearer token
// @author       hai.luu
// @match        http://localhost/*
// @match        127.0.0.1/*
// @match        0.0.0.0/*
// @match        https://*.canteccouriers.com/*
// @grant none
// @run-at document-idle
// @require https://cdn.jsdelivr.net/npm/jwt-decode@3.0.0/build/jwt-decode.js
// @require https://cdnjs.cloudflare.com/ajax/libs/axios/0.20.0/axios.min.js
// ==/UserScript==

function _$(selector, parent = null) {
    return parent ? parent.querySelector(selector) : document.querySelector(selector);
}
function addStyle(cssText) {
    _$("head").insertAdjacentHTML("beforeend", `<style>${cssText}</style>`);
}
function localGet(key) {
    return window.localStorage.getItem(key);
}
function localSet(key, val) {
    window.localStorage.setItem(key, val);
}
function localRem(key) {
    window.localStorage.removeItem(key);
}
function findKey(obj, key) {
    let found;
    JSON.stringify(obj, (k, v) => {
        if (k === key) {
            found = v;
        }
        return v;
    });
    return found;
}

(function () {
    "use strict";

    const init = () => {
        if (window.ui === undefined) {
            setTimeout(init, 1000);
            return;
        }

        console.log("%cSwagger-Auto-Login Is Running", "color:white;background:red;font-size:20px;");

        addStyle(
            `.sal--btn{outline:0;border:1px solid #ccc;border-radius:3px;padding:5px;cursor:pointer}.sal--btn.danger{color:#fff;background:red}.sal--btn.success{color:#fff;background:#4caf50}.sal--box{position:fixed;top:20px;right:20px;z-index:99999}.sal--box-content{position:absolute;top:calc(100% + 5px);right:0;background:#fff;color:#000;border-radius:3px;padding:10px 15px;border:1px solid #ccc;display:none}.sal--block{display:block!important}.sal--input{box-sizing:border-box;padding:4px 6px;margin-bottom:5px;border:1px solid #ccc}.sal--btn-submit{display:block;outline:0;border:none;border-radius:3px;padding:5px;cursor:pointer;color:#fff;background:#000;margin-top:10px}.sal--autorefresh{padding-left:5px}.sal--autorefresh input[type=checkbox]{float:left}`
        );

        const key_prefix = window.location.pathname.includes("/admin") ? "admin_" : "",
            keys = ["login_url", "refresh_url", "email", "password", "autorefresh"],
            originalAuthorize = window.ui.authActions.authorize,
            originalLogout = window.ui.authActions.logout,
            box = document.createElement("div");

        var data = {};
        for (let key of keys) {
            data[key] = localGet(`${key_prefix}${key}`);
        }

        box.classList.add("sal--box");
        box.innerHTML = `<button class="sal--btn" id="toggle_btn">SAL</button>
            <div class="sal--box-content">
                <form>
                    <input class="sal--input" placeholder="Login URL" value="${
                        data.login_url || ""
                    }" id="login_url_input" required="true">
                    <input class="sal--input" placeholder="Refresh URL" value="${
                        data.refresh_url || ""
                    }" id="refresh_url_input" required="true">
                    <input class="sal--input" type="email" placeholder="Email" value="${
                        data.email || ""
                    }" id="email_input" required="true">
                    <input class="sal--input" type="password" placeholder="Password" value="${
                        data.password || ""
                    }" id="password_input" required="true">
                    <label><input type="checkbox" checked="${
                        data.autorefresh || "false"
                    }" id="autorefresh_input">Auto Refresh</label>
                    <button class="sal--btn-submit" type="submit">Save & Refresh</button>
                </form>
                <hr>
                <input type="text" class="sal--input" id="access_token" readonly placeholder="Access token" title="Access token">
                <input type="text" class="sal--input" id="refresh_token" readonly placeholder="Refresh token" title="Refresh token">
            </div>`;

        _$("#toggle_btn", box).onclick = () => {
            _$(".sal--box-content", box).classList.toggle("sal--block");
        };

        function resetMessage() {
            _$("#toggle_btn", box).removeAttribute("title");
            _$("#toggle_btn", box).classList.remove("success", "danger");
        }
        function error(message=null) {
            resetMessage();
            _$("#toggle_btn", box).classList.add("danger");
            if (message) {
                _$("#toggle_btn", box).title = message;
            }
        }
        function success() {
            resetMessage();
            _$("#toggle_btn", box).classList.add("success");

            _$("#access_token", box).value = localGet(`${key_prefix}token`);
            _$("#refresh_token", box).value = localGet(`${key_prefix}refresh`);
        }

        window.ui.authActions.authorize = function (payload) {
            let token = payload.Bearer.value.replace("Bearer", "").replace("bearer", "").trim();
            payload.Bearer.value = `Bearer ${token}`;
            localSet(`${key_prefix}token`, token);
            success();
            return originalAuthorize(payload);
        };

        window.ui.authActions.logout = function (payload) {
            localRem(`${key_prefix}token`);
            localRem(`${key_prefix}refresh`);
            resetMessage();
            return originalLogout(payload);
        };

        function authorize(token) {
            clearInterval(window.sal_check_lively);
            token = token.replace("bearer", "").replace("Bearer", "").trim();

            try {
                var decoded = jwt_decode(token);
                window.token_exp = new Date(decoded.exp * 1000);
            }
            catch (err) {
                console.error(err);
                return login();
            }

            let result = window.ui.preauthorizeApiKey("Bearer", `Bearer ${token}`);
            if (result === null) {
                return setTimeout(authorize(token), 300);
            }

            success();

            if (data.autorefresh === "true") {
                console.log("Checking for token lively...");
                window.sal_check_lively = setInterval(check_lively, 5000);
            }
        }

        function refresh() {
            if (!data.refresh_url) {
                _$(".sal--box-content", box).classList.add("sal--block");
                throw new Error("Failed to refresh.");
            }
            console.log("refreshing...");
            axios.post(data.refresh_url, {
                refresh: localGet(`${key_prefix}refresh`)
            })
            .then((res) => {
                let access = findKey(res.data, "access");

                localSet(`${key_prefix}token`, access);

                authorize(access);
                success();
            })
            .catch((err) => {
                console.error(err.response.data);
                error(err.response.data.message);
                return login();
            });
        }

        function login() {
            if (!data.login_url || !data.email || !data.password) {
                _$(".sal--box-content", box).classList.add("sal--block");
                throw new Error("Failed to login.");
            }
            axios
                .post(data.login_url, {
                    email: data.email,
                    password: data.password,
                })
                .then((res) => {
                    let access = findKey(res.data, "access"),
                        refresh = findKey(res.data, "refresh");

                    localSet(`${key_prefix}token`, access);
                    localSet(`${key_prefix}refresh`, refresh);

                    authorize(access);
                    success();
                })
                .catch((err) => {
                    console.error(err.response.data);
                    error(err.response.data.message);
                });
        }

        function check_lively() {
            if (window.token_exp && window.token_exp < new Date()) {
                refresh();
            }
        }

        _$("form", box).onsubmit = (e) => {
            e.preventDefault();

            localRem(`${key_prefix}token`);
            localRem(`${key_prefix}refresh`);

            for (let key of keys) {
                let el = _$(`#${key}_input`, box);
                data[key] = el.type === "checkbox" ? el.checked : el.value;
                localSet(`${key_prefix}${key}`, data[key]);
            }

            originalLogout(["Bearer"]);
            login();

            _$(".sal--box-content", box).classList.remove("sal--block");
        };

        document.body.appendChild(box);

        let token = localGet(`${key_prefix}token`);
        if (token) {
            authorize(token);
        }
    };
    init();
})();
