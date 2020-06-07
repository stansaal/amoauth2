/**
 * amoCRM OAuth 2.0 client module
 * 
 * @module amoauth2
 */

'use strict';

const https = require('https');

const HOST = 'amocrm.ru';
const ACCESS_TOKEN_PATH = '/oauth2/access_token';

/**
 * @callback authCallback
 * @param {Object} err 
 * @param {Object} res
 */

/**
 * Authentication method using authorization code
 * 
 * @async
 * 
 * @param {Object} config - A config object of amoCRM client params
 * @param {string} config.subdomain
 * @param {string} config.clientId
 * @param {string} config.clientSecret
 * @param {string} config.authorizationCode
 * @param {string} config.redirectUri - Redirect URI from integration settings
 * @param {authCallback} callback - The callback that handles the response
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
        hostname: `${config.subdomain}.${HOST}`,
        port: 443,
        path: ACCESS_TOKEN_PATH,
        method: 'POST',
        headers: {
            "User-Agent": "amoCRM-oAuth-client/1.0",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Content-Length": postData.length
        }
    }

    const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
      
        res.on('data', (d) => {
          console.log(`data: ${d}`);
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(postData);
    req.end();
};