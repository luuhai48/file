// ==UserScript==
// @name         Swagger Auto Login
// @namespace    https://canteccouriers.com
// @version      0.1
// @description  Auto authentication using Bearer token on startup
// @author       hai.luu
// @match        http://localhost/*
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
        var urlpath = window.location.pathname,
            api_key = "token";
        if (urlpath.includes("/admin")) {
            api_key = "token_admin";
        }

        var originalAuthorize = window.ui.authActions.authorize,
            originalLogout = window.ui.authActions.logout;

        window.ui.authActions.authorize = function (payload) {
            window.localStorage.setItem(api_key, payload.Bearer.value);
            return originalAuthorize(payload);
        };

        window.ui.authActions.logout = function (payload) {
            window.localStorage.removeItem(api_key);
            return originalLogout(payload);
        };

        const api_value = window.localStorage.getItem(api_key);
        if (api_value) {
            const authorize = () => {
                let result = window.ui.preauthorizeApiKey('Bearer', api_value);
                if (result === null) {
                    setTimeout(authorize, 500);
                }
            };
            authorize();
        }
    };
    init();
})();