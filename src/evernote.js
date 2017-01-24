"use strict";
const fs = require('fs'),
  OAuth = require('oauth'),
  openurl = require('openurl');

class EvernoteService {
  constructor(config, consumerKey, secretKey) {
    this.config = config;
    this.consumerKey = consumerKey;
    this.secretKey = secretKey;
  }

  // Authentication
  // https://dev.evernote.com/doc/articles/authentication.php
  getOAuth() {
    return new Promise((resolve, reject) => {
      const oauth = this.getOAuthClient(this.config.oauth.callbackUrl);
      oauth.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
        if (!!error) {
          return reject(error);
        }

        return resolve({
          oauthToken: oauthToken,
          oauthTokenSecret: oauthTokenSecret,
          results: results
        });
      });
    });
  }

  getOAuthClient(callbackUrl) {
    return new OAuth.OAuth(
      this.config.oauth.requestTokenUrl,
      this.config.oauth.accessTokenUrl,
      this.consumerKey,
      this.secretKey,
      '1.0A',
      callbackUrl || '',
      'HMAC-SHA1'
    );
  }

  requestUserAuth(token) {
    openurl.open(this.config.oauth.redirectionUrl + token);
  }

  getAccessToken(oauthToken, oauthTokenSecret, oauthVerifier) {
    const oauth = this.getOAuthClient('');
    return new Promise((resolve, reject) => {
      oauth.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier,
        (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
          if (!!error) {
            return reject(error);
          }

          return resolve(results);
        });
    });
  }

  saveSettings(settings) {
    fs.writeFile('settings.json', settings, (err) => {
      if (err) throw err;
      console.log('It\'s saved!');
    });

  }
}

module.exports = EvernoteService;
