/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const BaseMongoDBHelper = require('./base.js');
const ObjectID = require('bson').ObjectID;
const validate = require('cta-common').validate;

/**
 * Database Interface MongoDB Helper FindById class
 *
 * @augments BaseMongoDBHelper
 * @property {CementHelper} cementHelper - cementHelper instance
 * @property {Logger} logger - logger instance
 */
class FindById extends BaseMongoDBHelper {

  /**
   * Validates Context properties specific to this Helper
   * Validates abstract query fields
   * @param {Context} context - a Context
   * @abstract
   * @returns {Promise}
   */
  _validate(context) { // eslint-disable-line no-unused-vars
    const job = context.data;
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
      if (!validate(job.payload.type, { type: 'string' }).isValid) {
        reject(new Error('missing/incorrect \'type\' String in job payload'));
      }

      if (!validate(job.payload.id, { type: 'identifier' }).isValid) {
        reject(new Error('missing/incorrect \'id\' String value of ObjectID in job payload'));
      }
      resolve({ ok: 1 });
    });
  }

  /**
   * Process the context
   * @param {Context} context - a Context
   */
  _process(context) {
    const that = this;
    const mongoDbCollection = context.data.payload.type;

    const data = {
      nature: {
        type: 'database',
        quality: 'query',
      },
      payload: {
        collection: mongoDbCollection,
        action: 'find',
        args: [
          {
            _id: new ObjectID(context.data.payload.id),
          },
        ],
      },
    };
    const output = this.cementHelper.createContext(data);
    output.on('done', function(brickname, response) {
      if (Array.isArray(response) && response.length > 0) {
        const result = that.schemas[mongoDbCollection].toCTAData(response[0]);
        context.emit('done', that.cementHelper.brickName, result);
      } else {
        context.emit('done', that.cementHelper.brickName, null);
      }
    });
    output.on('reject', function(brickname, error) {
      context.emit('reject', brickname, error);
    });
    output.on('error', function(brickname, error) {
      context.emit('error', brickname, error);
    });
    output.publish();
  }
}

module.exports = FindById;
