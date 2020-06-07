'use strict';

const fs = require('fs');

module.exports = class AuthResult {
    /**
     * Creates a new AuthResult object
     * 
     * @param {string} tokenFile Token storage *.json file path
     * @param {Object} authRes Authentication result data
     * @param {string} authRes.token_type
     * @param {number} authRes.expires_in
     * @param {string} authRes.access_token
     * @param {string} authRes.refresh_token
     * @param {string} authRes.subdomain
     * @param {number} authRes.received_at
     */
    constructor(tokenFile, authRes) {
        this._subdomain = authRes.subdomain;
        this._tokenType = authRes.token_type;
        this._expiresIn = authRes.expires_in;
        this._receivedAt = authRes.received_at;
        this._accessToken = authRes.access_token;
        this._refreshToken = authRes.refresh_token;
        this._tokenFile = tokenFile;
    }

    get subdomain() {
        return this._subdomain;
    }

    get tokenType() {
        return this._tokenType;
    }

    get expiresIn() {
        return this._expiresIn;
    }

    get receivedAt() {
        return this._receivedAt;
    }

    get expiresAt() {
        return this._receivedAt + this._expiresIn * 1000;
    }

    get accessToken() {
        return this._accessToken;
    }

    get refreshToken() {
        return this._refreshToken;
    }

    /**
     * Refresh token
     */
    refresh() {

    }

    /**
     * Check if token expired
     */
    isExpired() {
        return (Date.now() > (this._receivedAt + this._expiresIn * 1000)) ? true : false;
    }

    /**
     * Save authentication result to *.json file
     * 
     * @param {string} [path] Path to output token storage *.json file
     */
    async saveAuth(path = this._tokenFile) {
        const tokenJSON = {
            subdomain: this._subdomain,
            token_type: this._tokenType,
            expires_in: this._expiresIn,
            received_at: this._receivedAt,
            access_token: this._accessToken,
            refresh_token: this._refreshToken
        }

        await fs.writeFile(path, JSON.stringify(tokenJSON), () => {console.log('Auth data saved to ', path)});
    }
}