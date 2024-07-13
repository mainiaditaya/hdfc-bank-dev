/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import {
  getOTP,
  otpValidation,
  customSetFocus,
  journeyResponseHandler,
  corpCreditCardContext,
  createJourneyId,
  sendAnalytics,
  resendOTP,
  hideLoaderGif,
} from '../../common/functions.js';

import {
  moveWizardView,
  createLabelInElement,
  decorateStepper,
} from '../../common/formutils.js';
import {
  sendSubmitClickEvent,
  sendGenericClickEvent,
} from '../../common/analytics.js';
import { invokeJourneyDropOff, invokeJourneyDropOffByParam, invokeJourneyDropOffUpdate } from '../../common/journey-utils.js';

const { currentFormContext } = corpCreditCardContext;

/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */

function getFullName(firstname, lastname) {
  // eslint-disable-next-line no-param-reassign
  firstname = firstname == null ? '' : firstname;
  // eslint-disable-next-line no-param-reassign
  lastname = lastname == null ? '' : lastname;
  return firstname.concat(' ').concat(lastname);
}

/**
 * On Wizard Init.
 * @name onWizardInit Runs on initialization of wizard
 */
function onWizardInit() {
  createLabelInElement('.field-permanentaddresstoggle', 'permanent-address-toggle__label');
  decorateStepper();
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * getFormContext - returns form context.
 * @returns {Promise} currentFormContext
 */
function getFormContext() {
  return currentFormContext;
}

/**
 * getWrappedFormContext - returns form context.
 * @returns {Promise} currentFormContext
 */
function getWrappedFormContext() {
  const formContext = {
    formContext: currentFormContext,
  };
  return formContext;
}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName,
  onWizardInit,
  getOTP,
  otpValidation,
  days,
  journeyResponseHandler,
  moveWizardView,
  customSetFocus,
  getFormContext,
  sendGenericClickEvent,
  sendSubmitClickEvent,
  getWrappedFormContext,
  hideLoaderGif,
  createJourneyId,
  invokeJourneyDropOff,
  invokeJourneyDropOffByParam,
  invokeJourneyDropOffUpdate,
  sendAnalytics,
  resendOTP,
};
