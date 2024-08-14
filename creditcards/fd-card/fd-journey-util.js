import { FD_ENDPOINTS, JOURNEY_NAME } from './constant.js';
import { CHANNEL } from '../../common/constants.js';
import createJourneyId from '../../common/journey-utils.js';
import { santizedFormDataWithContext, urlPath } from '../../common/formutils.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';
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

export default invokeJourneyDropOff;
