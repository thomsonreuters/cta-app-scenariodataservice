/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const appRootPath = require('cta-common').root('cta-app-scenariodataservice');
const nodepath = require('path');
const validate = require('cta-common').validate;

/**
 * Business Logic Helper Base class
 *
 * @property {CementHelper} cementHelper - cementHelper instance
 * @property {Logger} logger - logger instance
 */
class BaseHelper {
  /**
   * constructor - Create a new Business Logic Helper Base instance
   *
   * @param {CementHelper} cementHelper - cementHelper instance
   * @param {Logger} logger - logger instance
   */
  constructor(cementHelper, logger, dataType, apiURLs) {
    if (!validate(cementHelper, { type: 'object' }).isValid) {
      throw (new Error('missing/incorrect \'cementHelper\' CementHelper argument'));
    }
    this.cementHelper = cementHelper;

    if (!validate(logger, { type: 'object' }).isValid) {
      throw (new Error('missing/incorrect \'logger\' Logger argument'));
    }
    this.logger = logger;

    if (!validate(dataType, { type: 'string' }).isValid) {
      throw (new Error('missing/incorrect \'dataType\' String argument'));
    }
    this.dataType = dataType;

    const dataModelPath = nodepath.join(appRootPath,
      '/lib/utils/datamodels/', `${dataType}.js`);
    this.DataModel = require(dataModelPath);

    if (!validate(apiURLs.schedulerApiUrl, { type: 'string' }).isValid) {
      throw (new Error(
        'missing/incorrect \'schedulerApiUrl\' string in application global properties'));
    }
    this.schedulerApiUrl = apiURLs.schedulerApiUrl;

    if (!validate(apiURLs.scenarioApiUrl, { type: 'string' }).isValid) {
      throw (new Error(
        'missing/incorrect \'scenarioApiUrl\' string in application global properties'));
    }
    this.scenarioApiUrl = apiURLs.scenarioApiUrl;
  }

  /**
   * Validates Context properties specific to this Helper
   * @param {Context} context - a Context
   * @abstract
   * @returns {Promise}
   */
  _validate(context) { // eslint-disable-line no-unused-vars
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
      resolve({ ok: 1 });
    });
  }

  /**
   * Process the context
   * @abstract
   * @param {Context} context - a Context
   * @returns {Context}
   */
  _process(context) {
    context.emit('done', this.cementHelper.brickName, context.data);
  }

  /**
   * Acknowledge a Context
   * @param {Context} context - the Context to acknowledge
   */
  _ack(context) {
    const ackJob = {
      nature: {
        type: 'messages',
        quality: 'acknowledge',
      },
      payload: {
        id: context.data.id,
      },
    };
    const output = this.cementHelper.createContext(ackJob);
    output.publish();
  }
}

module.exports = BaseHelper;
