'use strict';

const Hapi = require('hapi');
const config = require('./config'),
  EvernoteService = require('./evernote'),
  evernoteService = new EvernoteService(config, config.keys.consumer, config.keys.secret);

// Create a server with a host and port
const server = new Hapi.Server();
let tokens;

server.connection({
  host: 'localhost',
  port: 8000
});

// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    console.info('Get AccessToken');
    
    evernoteService.getAccessToken(tokens.oauthToken, tokens.oauthTokenSecret, request.query.oauth_verifier)
      .then((response) => {
        console.info('Get AccessToken: success');
        console.info(JSON.stringify(response));
        evernoteService.saveSettings(JSON.stringify(response));
        return reply('Done :)');
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        return reply(error.data);
      });

  }
});

console.info('Get OAuth');
evernoteService
  .getOAuth()
  .then((response) => {
    tokens = {
      oauthToken: response.oauthToken,
      oauthTokenSecret: response.oauthTokenSecret
    };

    console.info('Get OAuth: success');
    return response.oauthToken;
  })
  .then((token) => {
    console.info('Get RequestUserAuth');
    return evernoteService.requestUserAuth(token);
  })
  .then(() => {
    console.info('Get RequestUserAuth: success');
    server.start((err) => {
      if (err) {
        throw err;
      }
      console.log('Server running at:', server.info.uri);
    });
  });