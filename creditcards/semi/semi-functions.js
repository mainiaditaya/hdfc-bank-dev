import { getOTPV1, otpValV1, checkELigibilityHandler } from './smart-emi-functions.js';

import {
  createJourneyId,
  getCurrentContext,
  invokeJourneyDropOff,
  invokeJourneyDropOffByParam,
  invokeJourneyDropOffUpdate,
  journeyResponseHandlerUtil,
} from '../../common/journey-utils.js';

/* load SEMI Styles- for loading semi - styles - temporary fix */
async function loadSEMIStyles() {
  if (document.querySelector('.semi-form-wrapper')) {
    document.body.classList.add('semi-form');
  }
}
window.setTimeout(() => loadSEMIStyles(), 600);

export {
  getOTPV1,
  otpValV1,
  checkELigibilityHandler,
  createJourneyId,
  getCurrentContext,
  invokeJourneyDropOff,
  invokeJourneyDropOffByParam,
  invokeJourneyDropOffUpdate,
  journeyResponseHandlerUtil,
};
