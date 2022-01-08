"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class Rest {
    constructor(base_url) {
        this._headers = {};
        this._instance = axios_1.default.create({
            baseURL: base_url,
            timeout: 60000
        });
    }
    setHeaders(headers) {
        this._headers = headers;
        return this;
    }
    post(endpoint, params) {
        return this._request(endpoint, 'POST', params);
    }
    get(endpoint, params) {
        return this._request(endpoint, 'GET', params);
    }
    put(endpoint, params) {
        return this._request(endpoint, 'PUT', params);
    }
    del(endpoint) {
        return this._request(endpoint, 'DELETE');
    }
    _request(endpoint, method, params) {
        const config = {
            url: endpoint,
            headers: this._headers || null,
            method: method.toLowerCase()
        };
        if (config.method === 'get') {
            config.params = params;
        }
        if (config.method !== 'get' && config.method !== 'del') {
            config.data = params;
        }
        return this._instance.request(config);
    }
}
exports.default = Rest;
//# sourceMappingURL=Rest.js.map