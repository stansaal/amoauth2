'use strict';

const https = require('https');
const fs = require('fs');
const apiUrl = require('./apiUrls');

module.exports = class AuthResult {
    /**
     * Creates a new AuthResult object
     * 
     * @param {string} tokenFile Token storage *.json file path
     * @param {Object} authRes Authentication result data
     * @param {string} authRes.client_id
     * @param {string} authRes.client_secret
     * @param {string} authRes.token_type
     * @param {number} authRes.expires_in
     * @param {string} authRes.access_token
     * @param {string} authRes.refresh_token
     * @param {string} authRes.subdomain
     * @param {number} authRes.received_at
     * @param {string} authRes.redirect_uri
     */
    constructor(tokenFile, authRes) {
        this._subdomain = authRes.subdomain;
        this._clientId = authRes.client_id;
        this._clientSecret = authRes.client_secret;
        this._tokenType = authRes.token_type;
        this._expiresIn = authRes.expires_in;
        this._receivedAt = authRes.received_at;
        this._accessToken = authRes.access_token;
        this._refreshToken = authRes.refresh_token;
        this._tokenFile = tokenFile;
        this._redirectUri = authRes.redirect_uri;
    }

    get subdomain() {
        return this._subdomain;
    }

    get tokenType() {
        if (this.isExpired()) this.refresh();
        return this._tokenType;
    }

    get expiresIn() {
        if (this.isExpired()) this.refresh();
        return this._expiresIn;
    }

    get receivedAt() {
        if (this.isExpired()) this.refresh();
        return this._receivedAt;
    }

    get expiresAt() {
        if (this.isExpired()) this.refresh();
        return this._receivedAt + this._expiresIn * 1000;
    }

    get accessToken() {
        if (this.isExpired()) this.refresh();
        return this._accessToken;
    }

    get refreshToken() {
        if (this.isExpired()) this.refresh();
        return this._refreshToken;
    }

    /**
     * Refresh token
     */
    refresh() {
        const postData = JSON.stringify({
            "client_id": this._clientId,
            "client_secret": this._clientSecret,
            "grant_type": "refresh_token",
            "refresh_token": this._refreshToken,
            "redirect_uri": this._redirectUri
        });

        const options = {
            hostname: `${this._subdomain}.${apiUrl.HOST}`,
            port: 443,
            path: apiUrl.ACCESS_TOKEN_PATH,
            method: 'POST',
            headers: {
                "User-Agent": "amoCRM-oAuth-client/1.0",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Content-Length": postData.length
            }
        };

        const authTimestamp = Date.now();

        const req = https.request(options, (res) => {
            res.on('data', (data) => {
                data = JSON.parse(data);
                
                this._accessToken = data.access_token;
                this._refreshToken = data.refresh_token;
                this._expiresIn = data.expires_in;
                this._receivedAt = authTimestamp;
                this._tokenType = data.token_type;
    
                this.saveAuth();
            });
        });
    
        req.on('error', (error) => {
            console.error(error);
        });
    
        req.write(postData);
        req.end();
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
            "subdomain": this._subdomain,
            "client_id": this._clientId,
            "client_secret": this._clientSecret,
            "token_type": this._tokenType,
            "expires_in": this._expiresIn,
            "received_at": this._receivedAt,
            "access_token": this._accessToken,
            "refresh_token": this._refreshToken,
            "redirect_uri": this._redirectUri
        }

        await fs.writeFile(path, JSON.stringify(tokenJSON), () => {console.log('Auth data saved to ', path)});
    }
}