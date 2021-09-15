'use strict';

/**
 * Jwt.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require('lodash');
const jwt = require('jsonwebtoken');

module.exports = ({ strapi }) => ({
  getToken(ctx) {
    const params = _.assign({}, ctx.request.body, ctx.request.query);

    let token = '';

    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const parts = ctx.request.header.authorization.split(' ');

      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        throw new Error(
          'Invalid authorization header format. Format is Authorization: Bearer [token]'
        );
      }
    } else if (params.token) {
      token = params.token;
    } else {
      throw new Error('No authorization header was found');
    }

    return this.verify(token);
  },

  issue(payload, jwtOptions = {}) {
    _.defaults(jwtOptions, strapi.config.get('plugin.users-permissions.jwt'));
    return jwt.sign(
      _.clone(payload.toJSON ? payload.toJSON() : payload),
      strapi.config.get('plugin.users-permissions.jwtSecret'),
      jwtOptions
    );
  },

  verify(token) {
    return new Promise(function(resolve, reject) {
      jwt.verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'), {}, function(
        err,
        tokenPayload = {}
      ) {
        if (err) {
          return reject(new Error('Invalid token.'));
        }
        resolve(tokenPayload);
      });
    });
  },
});