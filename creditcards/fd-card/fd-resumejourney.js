import { CURRENT_FORM_CONTEXT, ENDPOINTS } from '../../common/constants.js';
import { restAPICall } from '../../common/makeRestAPI.js';
import { JOURNEY_NAME } from './constant.js';
import { formUtil, urlPath } from '../../common/formutils.js';

let RESUME_JOURNEY_JSON_OBJECT = {};

/**
 *
 * @name validateAndDisableFDSelection
 * @param {Object} resumeJourneyResponse
 * @param {Object} globals
 */

const validateAndDisableFDSelection = (resumeJourneyResponse, globals) => {
  const resumeJourneySelectedFDNumbers = [];
  const selectedResumeJourneyFdCheckBox = [];
  const selectedResumeJourneyFDs = resumeJourneyResponse?.FDlienCard?.fdNumberSelection;
  selectedResumeJourneyFDs.forEach((item) => {
    resumeJourneySelectedFDNumbers.push(Number(item?.fdNumber));
    selectedResumeJourneyFdCheckBox.push(item?.fdAccSelect);
  });
  const { fdNumberSelection } = globals.form.fdBasedCreditCardWizard.selectFD.fdSelectionInfo;
  fdNumberSelection.forEach((selectedFDItem) => {
    resumeJourneySelectedFDNumbers.forEach((item, index) => {
      if (selectedFDItem.fdNumber.$value === item && selectedResumeJourneyFdCheckBox[index] === 'on') {
        globals.functions.setProperty(selectedFDItem.fdAccSelect, { value: 'on' });
        globals.functions.setProperty(globals.form.fdBasedCreditCardWizard.selectFD.fdSelectionInfo.selectedFDPanel.selectAllFDButton, { enabled: false });
        globals.functions.setProperty(globals.form.fdBasedCreditCardWizard.selectFD.fdSelectionInfo.fdNumberSelection, { enabled: false });
      }
    });
  });
};

const tConvert = (sessionTime) => {
  // Check correct time format and split into components
  let time = sessionTime.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [sessionTime];

  if (time.length > 1) { // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(''); // return adjusted time or original string
};

/**
 *
 * @name resumeJourneySuccessHandler
 * @param {Object} payload
 * @param {Object} globals
 */

const resumeJourneySuccessHandler = async (payload, globals) => {
  const returnState = payload?.journey?.[0]?.journeyState;
  if (returnState) {
    const returnJourneyInfo = JSON.parse(payload?.journey?.[0]?.journeyStateInfo?.[0]?.stateInfo);
    if (returnJourneyInfo.currentFormContext !== undefined) {
      Object.assign(CURRENT_FORM_CONTEXT, returnJourneyInfo.currentFormContext);
      const applRefNumber = returnJourneyInfo?.currentFormContext?.executeInterfaceResponse?.APS_APPL_REF_NUM;
      if (applRefNumber !== undefined) {
        RESUME_JOURNEY_JSON_OBJECT = returnJourneyInfo;
        const savedTime = payload?.journey?.[0]?.journeyStateInfo?.[0]?.timeinfo;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const timeStamp = `${savedTime.substring(8, 10)} ${months[parseInt(savedTime.substring(5, 7), 10) - 1]} ${savedTime.substring(0, 4)}, ${tConvert(savedTime.substring(11, 19))}`;
        let percentageOfCompletion = '';
        if (returnState === 'CUSTOMER_OFFER_AVAILABLE') {
          percentageOfCompletion = '50%';
        } else if (returnState === 'DOCUMENT_UPLOAD_SUCCESS') {
          percentageOfCompletion = '60%';
        } else if (returnState === 'CUSTOMER_ONBOARDING_FAILURE') {
          percentageOfCompletion = '80%';
        } else {
          percentageOfCompletion = '30%';
        }
        console.log(percentageOfCompletion);
        const sessionTimeStamp = `Your previous session was saved on ${timeStamp}`;
        document.querySelector('.field-resumejourneytimerinfotext').innerText = sessionTimeStamp;
        globals.functions.setProperty(globals.form.resumeJourneyWrapper, { visible: true });
        const popupButton = document.querySelector('.field-resumejourneycontinue .button');
        popupButton.addEventListener('click', () => {
          if (globals.form.resumeJourneyWrapper.resumeJourneyPopup.resumeJourneyOptions.$value === '0') {
            RESUME_JOURNEY_JSON_OBJECT.prefillResumeJourneyData = true;
            validateAndDisableFDSelection(returnJourneyInfo, globals);
          } else {
            RESUME_JOURNEY_JSON_OBJECT.prefillResumeJourneyData = false;
          }
          globals.functions.setProperty(globals.form.resumeJourneyWrapper, { visible: false });
        });
      }
    }
  }
};

/**
 *
 * @name invokeResumeJourneyApi
 * @param {Object} globals
 */

const invokeResumeJourneyApi = async (globals) => {
  const journeyJsonObj = {
    RequestPayload: {
      userAgent: (typeof window !== 'undefined') ? window.navigator.userAgent : 'onLoad',
      mobileNumber: globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value,
      currentJourneyID: globals.form.runtime.journeyId.$value,
      journeyName: JOURNEY_NAME,
    },
  };
  const apiEndPoint = urlPath(ENDPOINTS.resumeJourneyInfo);
  const method = 'POST';
  const eventHandlers = {
    successCallBack: (response) => {
      resumeJourneySuccessHandler(response, globals);
    },
    errorCallBack: (response) => {
      console.error(response);
    },
  };
  restAPICall('', method, journeyJsonObj, apiEndPoint, eventHandlers.successCallBack, eventHandlers.errorCallBack);
};

/**
 *
 * @name prefillResumeJourneyData
 * @param {Object} resumeJourneyResponse
 * @param {Object} globals
 */

const prefillResumeJourneyData = async (resumeJourneyResponse, globals) => {
  if (resumeJourneyResponse.prefillResumeJourneyData == undefined || !resumeJourneyResponse.prefillResumeJourneyData) { return; }
  const changeDataAttrObj = { attrChange: true, value: false };
  const { reviewDetailsView } = globals.form.fdBasedCreditCardWizard.basicDetails;
  const {
    personalDetails, addressDetails, employmentDetails, employeeAssistance,
  } = reviewDetailsView;
  const setFormValue = (field, value) => {
    if (value !== undefined) {
      const fieldUtil = formUtil(globals, field);
      fieldUtil.setValue(value, changeDataAttrObj);
    }
  };

  setFormValue(personalDetails.fullName, resumeJourneyResponse?.FDlienCard?.fullName);
  setFormValue(personalDetails.firstName, resumeJourneyResponse?.FDlienCard?.firstName);
  setFormValue(personalDetails.gender, resumeJourneyResponse?.FDlienCard?.gender);
  setFormValue(personalDetails.dateOfBirthPersonalDetails, resumeJourneyResponse?.FDlienCard?.dobPersonalDetails);
  setFormValue(personalDetails.panNumberPersonalDetails, resumeJourneyResponse?.FDlienCard?.panPersonalDetails);
  setFormValue(personalDetails.fathersFullName, resumeJourneyResponse?.FDlienCard?.fathersFullName);
  setFormValue(personalDetails.emailID, resumeJourneyResponse?.FDlienCard?.emailID);
  setFormValue(personalDetails.nameOnCard, resumeJourneyResponse?.FDlienCard?.nameOnCard);
  setFormValue(personalDetails.nameOnCardDD, resumeJourneyResponse?.FDlienCard?.nameOnCard);
  globals.functions.setProperty(addressDetails.mailingAddressToggle, { value: resumeJourneyResponse?.FDlienCard?.currentAddressToggle });
  setFormValue(addressDetails.newCurentAddressPanel.newCurrentAddressLine1, resumeJourneyResponse?.FDlienCard?.addressLine1);
  setFormValue(addressDetails.newCurentAddressPanel.newCurrentAddressLine2, resumeJourneyResponse?.FDlienCard?.addressLine2);
  setFormValue(addressDetails.newCurentAddressPanel.newCurrentAddressLine3, resumeJourneyResponse?.FDlienCard?.addressLine3);
  setFormValue(addressDetails.newCurentAddressPanel.newCurentAddressPin, resumeJourneyResponse?.FDlienCard?.pincode);
  setFormValue(employmentDetails.employmentType, resumeJourneyResponse?.FDlienCard?.employmentType);
  setFormValue(employmentDetails.annualIncome, resumeJourneyResponse?.FDlienCard?.annualIncome);
  globals.functions.setProperty(employeeAssistance.employeeAssistanceToggle, { value: resumeJourneyResponse?.FDlienCard?.assistanceToggle });
  // globals.functions.setProperty(employeeAssistance.inPersonBioKYCPanel.inPersonBioKYCOptions, { value: resumeJourneyResponse?.FDlienCard?.inPersonBioKYCOptions });
  setFormValue(employeeAssistance.inPersonBioKYCPanel.inPersonBioKYCOptions, resumeJourneyResponse?.FDlienCard?.inPersonBioKYCOptions);
  setFormValue(employeeAssistance.employeeAssistancePanel.channel, resumeJourneyResponse?.FDlienCard?.channel);
  setFormValue(employeeAssistance.employeeAssistancePanel.branchCode, resumeJourneyResponse?.FDlienCard?.branchCode);
  setFormValue(employeeAssistance.employeeAssistancePanel.dsaCode, resumeJourneyResponse?.FDlienCard?.dsaCode);
  setFormValue(employeeAssistance.employeeAssistancePanel.dsaName, resumeJourneyResponse?.FDlienCard?.dsaName);
  setFormValue(employeeAssistance.employeeAssistancePanel.lc1Code, resumeJourneyResponse?.FDlienCard?.lc1Code);
  setFormValue(employeeAssistance.employeeAssistancePanel.lc2Code, resumeJourneyResponse?.FDlienCard?.lc2Code);
  setFormValue(employeeAssistance.employeeAssistancePanel.lgCode, resumeJourneyResponse?.FDlienCard?.lgCode);
  setFormValue(employeeAssistance.employeeAssistancePanel.smCode, resumeJourneyResponse?.FDlienCard?.smCode);
};

const resumeJourneyPopUp = (radioButtonObject, globals) => {
  const selectedRbValue = radioButtonObject.$value;
  if (selectedRbValue === '0') {
    prefillResumeJourneyData(RESUME_JOURNEY_JSON_OBJECT, globals);
  }
};

const getResumeJourneyJsonObject = () => RESUME_JOURNEY_JSON_OBJECT;

const displayResumeJourneyPopup = () => {

};

export {
  tConvert,
  invokeResumeJourneyApi,
  prefillResumeJourneyData,
  resumeJourneySuccessHandler,
  getResumeJourneyJsonObject,
  resumeJourneyPopUp,
  displayResumeJourneyPopup,
  RESUME_JOURNEY_JSON_OBJECT,
  validateAndDisableFDSelection,

};
