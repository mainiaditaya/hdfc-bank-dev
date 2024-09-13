import { FD_ENDPOINTS, JOURNEY_NAME } from './constant.js';
import { CHANNEL, CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { createJourneyId } from '../../common/journey-utils.js';
import { santizedFormDataWithContext, urlPath } from '../../common/formutils.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';
import { moveWizardView } from '../domutils/domutils.js';
import { journeyResponseHandlerUtil } from './common-journeyutil.js';
/**
   * @name invokeJourneyDropOff to log on success and error call backs of api calls
   * @param {state} state
   * @param {string} mobileNumber
   * @param {Object} globals - globals variables object containing form configurations.
   * @return {PROMISE}
   */
const invokeJourneyDropOff = async (state, mobileNumber, globals) => {
  const DEFAULT_MOBILENO = '9999999999';
  const journeyJSONObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : 'onLoad',
      leadProfile: {
        mobileNumber: mobileNumber || DEFAULT_MOBILENO,
      },
      formData: {
        channel: CHANNEL,
        journeyName: JOURNEY_NAME,
        journeyID: globals.form.runtime.journeyId.$value || createJourneyId('online', JOURNEY_NAME, CHANNEL, globals),
        journeyStateInfo: [
          {
            state,
            stateInfo: JSON.stringify(santizedFormDataWithContext(globals)),
            timeinfo: new Date().toISOString(),
          },
        ],
      },
    },
  };
  const url = urlPath(FD_ENDPOINTS.journeyDropOff);
  const method = 'POST';

  // return globals.functions.exportData().queryParams.leadId ? fetchJsonResponse(url, journeyJSONObj, method) : null;
  return journeyJSONObj.RequestPayload.formData.journeyID ? fetchJsonResponse(url, journeyJSONObj, method) : null;
};

/**
   * @name fdWizardSwitch to switch panel visibility
   * @param {string} currentPanel
   * @param {string} nextPanel
   * @returns {void}
   */
const fdWizardSwitch = (currentPanel, nextPanel) => {
  moveWizardView(currentPanel, nextPanel);
};

const errorScreenHandler = () => {
  console.log('hide loader');
};

/**
 * @name journeyResponseHandler
 * @param {object} payload.
 */
const journeyResponseHandler = (payload, globals) => {
  CURRENT_FORM_CONTEXT.leadProfile = journeyResponseHandlerUtil(String(payload.leadProfileId), CURRENT_FORM_CONTEXT)?.leadProfile;
  globals.functions.setProperty(globals.form.runtime.leadid, { value: payload.leadProfileId });
  console.log(payload.leadProfileId);
};

export {
  invokeJourneyDropOff,
  fdWizardSwitch,
  errorScreenHandler,
  journeyResponseHandler,
};
