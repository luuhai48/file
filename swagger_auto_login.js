// ==UserScript==
// @name         Swagger Auto Login
// @namespace    https://canteccouriers.com
// @version      3.0
// @description  Remember Swagger Bearer token, auto refresh and signin
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
        var swagger_ui = null,
            keyType = null;

        if (window.ui === undefined) {
            try {
                swagger_ui = ui;
                keyType = "jwtAuth";
            } catch (err) {
                setTimeout(init, 1000);
                return;
            }
        } else {
            swagger_ui = window.ui;
            keyType = "Bearer";
        }

        console.log("%cSwagger-Auto-Login Is Running", "color:white;background:red;font-size:20px;");

        addStyle(
            `.sal--btn{outline:0;border:1px solid #ccc;border-radius:3px;padding:5px;cursor:pointer}.sal--btn.danger{color:#fff;background:red}.sal--btn.success{color:#fff;background:#4caf50}.sal--box{position:fixed;top:20px;right:20px;z-index:99999}.sal--box-content{width:250px;position:absolute;top:calc(100% + 5px);right:0;background:#fff;color:#000;border-radius:3px;padding:10px 15px;border:1px solid #ccc;display:none}.sal--block{display:block!important}.sal--input{width:100%;box-sizing:border-box;padding:4px 6px;margin-bottom:5px;border:1px solid #ccc}.sal--btn-submit{display:block;outline:0;border:none;border-radius:3px;padding:5px;cursor:pointer;color:#fff;background:#000;margin-top:10px}.sal--autorefresh{padding-left:5px}.sal--autorefresh input[type=checkbox]{float:left}.sal--select{width:100%;padding:5px;box-sizing:border-box;margin-bottom:10px;}`
        );

        var key_prefix = localGet("profile") == "admin" ? "admin_" : "";

        const keys = ["login_url", "refresh_url", "email", "password", "autorefresh"],
            originalAuthorize = swagger_ui.authActions.authorize,
            originalLogout = swagger_ui.authActions.logout,
            box = document.createElement("div");

        var data = {};

        box.classList.add("sal--box");
        box.innerHTML = `<button class="sal--btn" id="toggle_btn">SAL</button>
            <div class="sal--box-content">
                <select class="sal--select" id="profile_select">
                    <option value="default">Default profile</option>
                    <option value="admin">Admin profile</option>
                </select><br>
                <form>
                    <input class="sal--input" placeholder="Login URL" title="Login URL" id="login_url_input" required="true">
                    <input class="sal--input" placeholder="Refresh URL" title="Refresh URL" id="refresh_url_input" required="true">
                    <input class="sal--input" type="email" placeholder="Email" title="Email" id="email_input" required="true">
                    <input class="sal--input" type="text" placeholder="Password" title="Password" id="password_input" required="true">
                    <label><input type="checkbox" id="autorefresh_input">Auto Refresh</label>
                    <button class="sal--btn-submit" type="submit">Save & Refresh</button>
                </form>
                <hr>
                <div style="display:flex;">
                    <input type="text" class="sal--input" id="access_token" readonly placeholder="Access token" title="Access token">
                    <button class="sal--btn" id="access_token_btn" title="Copy" style="margin-bottom:5px; margin-left:5px;">Copy</button>
                </div>
                <div style="display:flex;">
                    <input type="text" class="sal--input" id="refresh_token" readonly placeholder="Refresh token" title="Refresh token">
                    <button class="sal--btn" id="refresh_token_btn" title="Copy" style="margin-bottom:5px; margin-left:5px;">Copy</button>
                </div>
            </div>`;

        const refresh_keys = () => {
            data = {};
            for (let key of keys) {
                data[key] = localGet(`${key_prefix}${key}`);
            }

            _$("#login_url_input", box).value = data.login_url || "";
            _$("#refresh_url_input", box).value = data.refresh_url || "";
            _$("#email_input", box).value = data.email || "";
            _$("#password_input", box).value = data.password || "";
            _$("#autorefresh_input", box).checked = data.autorefresh || "false";
        }
        refresh_keys();

        _$("#toggle_btn", box).onclick = () => {
            _$(".sal--box-content", box).classList.toggle("sal--block");
        };

        _$("#access_token_btn", box).onclick = () => {
            _$("#access_token", box).select();
            document.execCommand("copy");
        };
        _$("#refresh_token_btn", box).onclick = () => {
            _$("#refresh_token", box).select();
            document.execCommand("copy");
        };

        function resetMessage() {
            _$("#toggle_btn", box).removeAttribute("title");
            _$("#toggle_btn", box).classList.remove("success", "danger");
            _$("#access_token", box).title = "Access token";
            _$("#refresh_token", box).title = "Refresh token";
        }
        function error(message = null) {
            resetMessage();
            _$("#toggle_btn", box).classList.add("danger");
            if (message) {
                _$("#toggle_btn", box).title = message;
            }
        }
        function success() {
            resetMessage();
            _$("#toggle_btn", box).classList.add("success");

            let access_token = localGet(`${key_prefix}token`);
            if (access_token) {
                _$("#access_token", box).value = access_token;
                let decoded = jwt_decode(access_token);
                let access_token_title = "";
                for (const [key, val] of Object.entries(decoded)) {
                    access_token_title += `${key}: ${val}\n`;
                }
                _$("#access_token", box).title = access_token_title.trim();
            }

            let refresh_token = localGet(`${key_prefix}refresh`);
            if (refresh_token) {
                let decoded = jwt_decode(refresh_token);
                let refresh_token_title = "";
                for (const [key, val] of Object.entries(decoded)) {
                    refresh_token_title += `${key}: ${val}\n`;
                }
                _$("#refresh_token", box).title = refresh_token_title.trim();

                _$("#refresh_token", box).value = localGet(`${key_prefix}refresh`);
            }
        }

        swagger_ui.authActions.authorize = (payload) => {
            let token = null;
            if (payload.Bearer !== undefined) {
                keyType = "Bearer";
                token = payload.Bearer.value.replace("Bearer", "").replace("bearer", "").trim();
                payload.Bearer.value = `Bearer ${token}`;
            } else if (payload.jwtAuth !== undefined) {
                keyType = "jwtAuth";
                token = payload.jwtAuth.value.replace("Bearer", "").replace("bearer", "").trim();
                payload.jwtAuth.value = `Bearer ${token}`;
            }

            if (token !== null) {
                localSet(`${key_prefix}token`, token);
                success();
            }

            return originalAuthorize(payload);
        };

        swagger_ui.authActions.logout = (payload) => {
            localRem(`${key_prefix}token`);
            localRem(`${key_prefix}refresh`);
            _$("#access_token", box).value = "";
            _$("#refresh_token", box).value = "";
            resetMessage();
            return originalLogout(payload);
        };

        const authorize = (token) => {
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
            token = keyType == "Bearer" ? `Bearer ${token}` : token;
            let result = swagger_ui.preauthorizeApiKey(keyType || "Bearer", token);
            if (result === null) {
                setTimeout(() => {
                    authorize(token);
                }, 500);
                return;
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
                    console.error(err);
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

            originalLogout([keyType || "Bearer"]);
            login();

            _$(".sal--box-content", box).classList.remove("sal--block");
        };

        document.body.appendChild(box);

        const authen = () => {
            let token = localGet(`${key_prefix}token`);
            if (token) {
                authorize(token);
            }
        }

        authen();

        _$("#profile_select", box).onchange = (e) => {
            localSet("profile", e.target.value);
            key_prefix = e.target.value == "admin" ? "admin_" : "";
            refresh_keys();
            authen();
        }
    };
    init();
})();
