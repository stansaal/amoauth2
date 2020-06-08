/**
 * amoCRM OAuth 2.0 client module
 * 
 * @module amoauth2
 */

'use strict';

const https = require('https');
const fs = require('fs');
const AuthResult = require('./AuthResult');
const apiUrl = require('./apiUrls');

/**
 * @callback authCallback
 * @param {Object} res
 */

/**
 * Authentication method using authorization code
 * 
 * @async
 * 
 * @param {Object} config A config object of amoCRM client params
 * @param {string} config.subdomain
 * @param {string} config.clientId
 * @param {string} config.clientSecret
 * @param {string} config.authorizationCode
 * @param {string} config.redirectUri Redirect URI from integration settings
 * @param {string} config.tokenFile Token storage *.json file path
 * @param {authCallback} callback The callback that handles the response
 */
exports.authenticate = async (config, callback) => {
    const postData = JSON.stringify({
        "client_id": config.clientId,
        "client_secret": config.clientSecret,
        "grant_type": "authorization_code",
        "code": config.authorizationCode,
        "redirect_uri": config.redirectUri
    });

    const options = {
        hostname: `${config.subdomain}.${apiUrl.HOST}`,
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
            data.subdomain = config.subdomain;
            data.received_at = authTimestamp;
            data.client_id = config.clientId;
            data.client_secret = config.clientSecret;
            data.redirect_uri = config.redirectUri;

            const result = new AuthResult(config.tokenFile, data);
            result.saveAuth();

            callback(result);
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(postData);
    req.end();
};

/**
 * Read authentication data from *.json file
 * 
 * @param {string} path Token storage *.json file path
 * @returns {Object} AuthResult object
 */
exports.readFromFile = (path) => {
    const authData = JSON.parse(fs.readFileSync(path, 'utf-8'));
    const authObj = new AuthResult(path, authData);
    return authObj;
}