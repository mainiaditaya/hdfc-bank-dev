/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import {
  createJourneyId,
  nreNroInvokeJourneyDropOffByParam,
} from './nre-nro-journey-utils.js';
// import {
//   moveWizardView,
// } from '../domutils/domutils.js';
import {
  ageValidator,
  clearString,
  urlPath,
  getTimeStamp,
  maskNumber,
  moveWizardView,
  formUtil,
  santizedFormDataWithContext,
} from '../../common/formutils.js';
import {
  displayLoader,
  hideLoaderGif,
  fetchJsonResponse,
} from '../../common/makeRestAPI.js';
import * as NRE_CONSTANT from './constant.js';
import {
  ENDPOINTS as ENDPOINTS,
  CURRENT_FORM_CONTEXT as currentFormContext,
  FORM_RUNTIME as formRuntime,
  ID_COM as idCom,
} from '../../common/constants.js';
import {
  sendAnalytics,
} from './analytics.js'

setTimeout(() => {
  if (typeof window !== 'undefined') {
    import('./nre-nro-dom-functions.js');
  }
}, 1200);

let prevSelectedIndex = -1;
let defaultDropdownIndex = -1;
let resendOtpCount = 0;
const MAX_OTP_RESEND_COUNT = 3;
const OTP_TIMER = 30;
let MAX_COUNT = 3;
let sec = OTP_TIMER;
let dispSec = OTP_TIMER;

const { CHANNEL, JOURNEY_NAME, VISIT_MODE } = NRE_CONSTANT;
// Initialize all NRE/NRO Journey Context Variables.
currentFormContext.journeyName = NRE_CONSTANT.JOURNEY_NAME;
currentFormContext.journeyType = 'NTB';
currentFormContext.errorCode = '';
currentFormContext.errorMessage = '';
currentFormContext.eligibleOffers = '';

formRuntime.getOtpLoader = currentFormContext.getOtpLoader || (typeof window !== 'undefined') ? displayLoader : false;
formRuntime.otpValLoader = currentFormContext.otpValLoader || (typeof window !== 'undefined') ? displayLoader : false;
formRuntime.hideLoader = (typeof window !== 'undefined') ? hideLoaderGif : false;

/**
 * Masks a email by replacing the specified letter of word with asterisks.
 * @param {email} email - The email to mask.
 * @returns {string} -The masked email as a string.
 */
const maskedEmail = (email) => {
  const [localPart, domain] = email.split('@');
  let maskedLocalPart;

  if (localPart.length === 1) {
    maskedLocalPart = '****';
  } else if (localPart.length < 5) {
    maskedLocalPart = `${localPart.slice(0, localPart.length - 2)}****${localPart.slice(-1)}`;
  } else {
    maskedLocalPart = `${localPart.slice(0, 3)}****${localPart.slice(-1)}`;
  }

  return `${maskedLocalPart}@${domain}`;
};

const validFDPan = (val) => {
  if (val?.length !== 12) return false;
  if (![...val.slice(0, 5)]?.every((c) => /[a-zA-Z]/.test(c))) return false;
  return true;
};
/**
 * Validates the date of birth field to ensure the age is between 18 and 120.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/

const validateLogin = (globals) => {
  const mobileNo = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registeredMobileNumber.$value;
  const isdCode = (globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.countryCode.$value)?.replace(/[^a-zA-Z0-9]+/g, '');
  // const dobValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dateOfBirth.$value;
  let dobValue = "";
  const panValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.pan.$value;
  const panDobSelection = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.panDobSelection.$value;
  const radioSelect = (panDobSelection === '0') ? 'DOB' : 'PAN';
  const consentFirst = globals.form.parentLandingPagePanel.landingPanel.consentsFragmentNreNro.checkboxConsent1Label.$value;
  const panErrorText = 'Please enter a valid PAN Number';
  const isdNumberPattern = /^(?!0)([5-9]\d{9})$/;
  const panIsValid = validFDPan(panValue);
  const nonISDNumberPattern = /^(?!0)\d{3,15}$/;
  globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });

  const panInput = document.querySelector(`[name=${'pan'} ]`);
  const panWrapper = panInput.parentElement;

  switch (radioSelect) {
    case 'DOB':
      console.log("DOB : " , dobValue, typeof dob);
      dobValue = "1988-09-14";
      if (dobValue && String(new Date(dobValue).getFullYear()).length === 4) {
        const minAge = 18;
        const maxAge = 120;
        const dobErrorText = `Age should be between ${minAge} to ${maxAge}`;
        const ageValid = ageValidator(minAge, maxAge, dobValue);
        if (ageValid && consentFirst) {
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: true });
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.dateOfBirth', '', { useQualifiedName: true });
        }
        if (ageValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.dateOfBirth', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dateOfBirth, { valid: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dobErrorText, { visible: false });
        }
        if (!ageValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.dateOfBirth', dobErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dobErrorText, { visible: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
        if (!consentFirst) {
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    case 'PAN':
      panWrapper.setAttribute('data-empty', true);
      if (panValue) {
        panWrapper.setAttribute('data-empty', false);
        if (panIsValid && consentFirst && mobileNo) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: true });
        }
        if (panIsValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.pan', '', { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.pan, { valid: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.panErrorText, { visible: false });
        }
        if (!panIsValid) {
          globals.functions.markFieldAsInvalid('$form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.pan', panErrorText, { useQualifiedName: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.panErrorText, { visible: true });
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
        if (!consentFirst && !mobileNo) {
          globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
        }
      }
      break;
    default:
      globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
  }
  if (mobileNo && ((isdCode === '91' && !isdNumberPattern.test(mobileNo))
    || (isdCode !== '91' && !nonISDNumberPattern.test(mobileNo)))) {
    globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registerMobileNumberError, { visible: true });
    globals.functions.setProperty(globals.form.parentLandingPagePanel.getOTPbutton, { enabled: false });
  } else {
    globals.functions.setProperty(globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registerMobileNumberError, { visible: false });
  }
};

const getOtpNRE = (mobileNumber, pan, dob, globals) => {
  // Promise.resolve(sendAnalytics('otp click', { }, 'CUSTOMER_IDENTITY_RESOLVED', globals));
  /* jidTemporary  temporarily added for FD development it has to be removed completely once runtime create journey id is done with FD */
  const jidTemporary = createJourneyId(VISIT_MODE, JOURNEY_NAME, CHANNEL, globals);
  currentFormContext.action = 'getOTP';
  currentFormContext.journeyID = globals.form.runtime.journeyId.$value || jidTemporary;
  currentFormContext.leadIdParam = globals.functions.exportData().queryParams;
  const jsonObj = {
    requestString: {
      mobileNumber: mobileNumber.$value,
      dateOfBirth: '19880914',
      // dateOfBirth: clearString(dob.$value) || '',
      panNumber: pan.$value || '',
      journeyID: globals.form.runtime.journeyId.$value ?? jidTemporary,
      journeyName: globals.form.runtime.journeyName.$value || currentFormContext.journeyName,
      identifierValue: pan.$value || clearString(dob.$value),
      identifierName: pan.$value ? 'PAN' : 'DOB',
      getEmail: 'Y',
    },
  };

  const path = urlPath(ENDPOINTS.customerOtpGen);
  formRuntime?.getOtpLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
};

const getCountryCodes = (dropdown) => {
  const finalURL = '/content/hdfc_commonforms/api/mdm.ETB.NRI_ISD_MASTER.COUNTRYNAME-.json';
  fetchJsonResponse(urlPath(finalURL), null, 'GET', true).then((response) => {
    dropdown.addEventListener('change', () => {
      if (prevSelectedIndex !== -1) {
        dropdown.remove(prevSelectedIndex);
      }
      const selectedIndex = dropdown.selectedIndex; // eslint-disable-line prefer-destructuring
      const selectedOption = dropdown.options[selectedIndex];
      const selectedOptionText = selectedOption.text;
      const selectedOptionVal = selectedOption.value;
      const newOption = document.createElement('option');
      newOption.value = selectedOptionVal;
      newOption.text = selectedOptionText;
      dropdown.options[selectedIndex].text = selectedOptionVal;
      dropdown.options[selectedIndex].style.display = 'none';
      dropdown.add(newOption, selectedIndex + 1);
      prevSelectedIndex = selectedIndex;
    });
    dropdown.innerHTML = '';
    response.forEach((countryCode) => {
      if (countryCode.ISDCODE != null && countryCode.DESCRIPTION != null) {
        const val = ` +${String(countryCode.ISDCODE)}`;
        const key = `${countryCode.DESCRIPTION} (${val})`;
        const newOption = document.createElement('option');
        newOption.value = val;
        newOption.textContent = key;
        dropdown.appendChild(newOption);
        if (val === ' +91') {
          defaultDropdownIndex = dropdown.options.length - 1;
        }
      }
    });
    dropdown.selectedIndex = 0;
    if (defaultDropdownIndex !== -1) {
      dropdown.selectedIndex = defaultDropdownIndex;
    }
    const event = new Event('change', {
      bubbles: true, // Allow the event to bubble up
      cancelable: true, // Allow the event to be canceled
    });
    dropdown.dispatchEvent(event);
  }).catch((error) => {
    console.error('Promise rejected:', error); // Handle any error (failure case)
  });
};

/**
 * Starts the Nre_Nro OTPtimer for resending OTP.
 * @param {Object} globals - The global object containing necessary data for DAP request.
*/
function otpTimer(globals) {
  if (resendOtpCount < MAX_OTP_RESEND_COUNT) {
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: true });
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: false });
  } else {
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: false });
  }
  const timer = setInterval(() => {
    sec -= 1;
    dispSec = sec;
    if (sec < 10) {
      dispSec = `0${sec}`;
    }
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel.seconds, { value: dispSec });
    if (sec < 0) {
      clearInterval(timer);
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: false });
      if (resendOtpCount < MAX_OTP_RESEND_COUNT) {
        globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: true });
      }
    }
  }, 1000);
}

function updateOTPHelpText(mobileNo, otpHelpText, email, globals) {
  if (!email) globals.functions.setProperty(otpHelpText, { value: `${otpHelpText} ${maskNumber(mobileNo, 6)}` });
  globals.functions.setProperty(otpHelpText, { value: `${otpHelpText} ${maskNumber(mobileNo, 6)} & email ID ${maskedEmail(email)}.` });
}

/**
 * validates the otp
 * @param {object} mobileNumber
 * @param {object} pan
 * @param {object} dob
 * @return {PROMISE}
 */
function otpValidationNRE(mobileNumber, pan, dob, otpNumber, globals) {
  const referenceNumber = `AD${getTimeStamp(new Date())}` ?? '';
  currentFormContext.referenceNumber = referenceNumber;
  const jsonObj = {
    requestString: {
      mobileNumber: mobileNumber.$value,
      passwordValue: otpNumber.$value,
      dateOfBirth: clearString(dob.$value) || '',
      panNumber: pan.$value || '',
      journeyID: currentFormContext.journeyID,
      journeyName: globals.form.runtime.journeyName.$value || currentFormContext.journeyName,
      referenceNumber: referenceNumber ?? '',
    },
  };

  const path = urlPath(ENDPOINTS.otpValidationFatca);
  formRuntime?.otpValLoader();
  return fetchJsonResponse(path, jsonObj, 'POST', true);
}

// function setupBankUseSection(lg, lc, toggle, resetAll, globals) {
function setupBankUseSection(globals){
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};
    let lgCode = globals.form.wizardPanel.wizardFragment.wizardNreNro.confirmDetails.needBankHelp.bankUseFragment.mainBankUsePanel.lgCode;
    let lcCode = globals.form.wizardPanel.wizardFragment.wizardNreNro.confirmDetails.needBankHelp.bankUseFragment.mainBankUsePanel.lcCode;
    let toggle = globals.form.wizardPanel.wizardFragment.wizardNreNro.confirmDetails.needBankHelp.bankUseFragment.mainBankUsePanel.bankUseToggle;
    let resetAllBtn = globals.form.wizardPanel.wizardFragment.wizardNreNro.confirmDetails.needBankHelp.bankUseFragment.mainBankUsePanel.resetAllBtn

    if(urlParams.size > 0){
      ['lgCode', 'lcCode'].forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            utmParams[param] = value;
        }
      });

      globals.functions.setProperty(lgCode, { value: utmParams["lgCode"] });
      globals.functions.setProperty(lcCode, { value: utmParams["lcCode"] });
    }
    else{
      globals.functions.setProperty(lgCode, { value: "NETADDON" });
      globals.functions.setProperty(lcCode, { value: "NRI INSTASTP" });
    }
      globals.functions.setProperty(resetAllBtn, { enabled: false });
      globals.functions.setProperty(toggle, { checked: true });
      globals.functions.setProperty(toggle, { enabled: false });
      globals.functions.setProperty(lgCode, { enabled: false });
      globals.functions.setProperty(lcCode, { enabled: false });
}

function prefillCustomerDetails(response, globals) {
  const {
    customerName,
    accountNumber,
    customerID,
    singleAccount,
    custIDWithoutMasking,
  } = globals.form.wizardPanel.wizardFragment.wizardNreNro.selectAccount;

  const {
    personalDetails,
    fatcaDetails,
    financialDetails,
    nomineeDetails,
  } = globals.form.wizardPanel.wizardFragment.wizardNreNro.confirmDetails.confirmDetailsAccordion;

  const changeDataAttrObj = { attrChange: true, value: false, disable: true };

  const setFormValue = (field, value) => {
    const fieldUtil = formUtil(globals, field);
    fieldUtil.setValue(value, changeDataAttrObj);
  };
  // not getting txtPermadrAdd1
  setFormValue(custIDWithoutMasking, response.customerId);
  setFormValue(customerName, response.customerShortName);
  setFormValue(customerID, maskNumber(response.customerId, 4));
  setFormValue(singleAccount.customerID, maskNumber(response.customerId, 4));
  setFormValue(singleAccount.accountNumber, maskNumber(response.customerAccountDetailsDTO[0].accountNumber, 10));
  setFormValue(singleAccount.accountType, response.customerAccountDetailsDTO[0].prodTypeDesc);
  setFormValue(singleAccount.branch, response.customerAccountDetailsDTO[0].branchName);
  setFormValue(singleAccount.ifsc, response.customerAccountDetailsDTO[0].ifscCode);
  setFormValue(personalDetails.emailID, response.refCustEmail);
  setFormValue(personalDetails.fullName, response.customerFullName);
  setFormValue(personalDetails.mobileNumber, response.rmPhoneNo);
  setFormValue(personalDetails.pan, response.refCustItNum);
  setFormValue(personalDetails.telephoneNumber, response.refCustTelex);
  setFormValue(personalDetails.communicationAddress, `${response.txtCustadrAdd1} ${response.txtCustadrAdd2} ${response.txtCustadrAdd3} ${response.namCustadrCity} ${response.namCustadrState} ${response.namCustadrCntry} ${response.txtCustadrZip}`);
  setFormValue(personalDetails.permanentAddress, `${response.txtPermadrAdd1} ${response.txtPermadrAdd2} ${response.txtPermadrAdd3} ${response.namPermadrCity} ${response.namPermadrState} ${response.namPermadrCntry} ${response.txtPermadrZip}`);
  setFormValue(fatcaDetails.nationality, response.txtCustNATNLTY);
  setFormValue(fatcaDetails.countryTaxResidence, response.customerFATCADtlsDTO[0].codTaxCntry1);
  setFormValue(fatcaDetails.taxIdNumber, response.customerFATCADtlsDTO[0].tinNo1);
  setFormValue(fatcaDetails.addressForTaxPurpose, response.customerFATCADtlsDTO[0].typAddrTax1);
  setFormValue(fatcaDetails.cityOfBirth, response.customerFATCADtlsDTO[0].namCityBirth);
  setFormValue(fatcaDetails.countryOfBirth, response.customerFATCADtlsDTO[0].codCntryBirth);
  setFormValue(fatcaDetails.fathersName, response.customerFATCADtlsDTO[0].namCustFather);
  setFormValue(fatcaDetails.mothersName, response.namMotherMaiden);
  setFormValue(fatcaDetails.spousesName, response.customerFATCADtlsDTO[0].namSpouseCust);
  setFormValue(fatcaDetails.taxIdType, response.customerFATCADtlsDTO[0].typTinNo1);
  setFormValue(financialDetails.sourceOfFunds, response.customerAMLDetailsDTO[0].incomeSource);
  setFormValue(financialDetails.occupation, response.customerFATCADtlsDTO[0].txtCustOccuptn);
  setFormValue(financialDetails.employeerName, response.customerFATCADtlsDTO[0].namCustEmp);
  setFormValue(financialDetails.selfEmployedProfessional, response.customerAMLDetailsDTO[0].txtProfessionDesc);
  setFormValue(financialDetails.selfEmployedSince, response.customerAMLDetailsDTO[0].selfEmpFrom);
  setFormValue(financialDetails.dateOfIncorporation, response.datIncorporated);
  setFormValue(financialDetails.natureOfBusiness, response.customerAMLDetailsDTO[0].natureOfBus);
  setFormValue(financialDetails.typeOfCompoanyFirm, response.customerAMLDetailsDTO[0].typCompany);
  setFormValue(financialDetails.residenceType, response.customerAMLDetailsDTO[0].typResidence);
  setFormValue(financialDetails.currencyName, response.customerAMLDetailsDTO[0].namCcy);
  setFormValue(financialDetails.grossAnnualIncome, response.customerAMLDetailsDTO[0].annualTurnover);
  setFormValue(financialDetails.pepDeclaration, response.customerAMLDetailsDTO[0].amlCod1);
  setFormValue(nomineeDetails.nomineeName, response.customerAccountDetailsDTO[0].nomineeName);
  setFormValue(nomineeDetails.dateOfBirth, response.customerAccountDetailsDTO[0].nomineeDOB);
  setFormValue(nomineeDetails.relation, response.customerAccountDetailsDTO[0].nomineeName);
}

/**
 * @name resendOTP
 * @param {Object} globals - The global object containing necessary data for DAP request.
 * @return {PROMISE}
 */
const resendOTP = async (globals) => {
  dispSec = OTP_TIMER;
  const mobileNo = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.mobilePanel.registeredMobileNumber;
  const panValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.pan;
  const dobValue = globals.form.parentLandingPagePanel.landingPanel.loginFragmentNreNro.identifierPanel.dateOfBirth;
  globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: false });
  globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: true });
  globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel.seconds, { value: dispSec });
  if (resendOtpCount < MAX_OTP_RESEND_COUNT) {
    resendOtpCount += 1;

    const otpResult = await getOtpNRE(mobileNo, panValue, dobValue, globals);
    globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel.seconds, { value: dispSec });
    if (otpResult && otpResult.customerIdentificationResponse.existingCustomer === 'Y') {
      sec = OTP_TIMER;
      otpTimer(globals);
    } else {
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.errorMessage, { visible: true, message: otpResult.message });
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: true });
    }

    if (resendOtpCount === MAX_OTP_RESEND_COUNT) {
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.secondsPanel, { visible: false });
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.otpResend, { visible: false });
      globals.functions.setProperty(globals.form.otppanelwrapper.otpFragment.otpPanel.maxAttemptMessage, { visible: true });
    }
    return otpResult;
  }

  return null; // Return null if max attempts reached
};

/**
   * Creates an IdCom request object based on the provided global data.
   * @param {Object} globals - The global object containing necessary data for IdCom request.
   * @returns {Object} - The IdCom request object.
   */
const createIdComRequestObj = (globals) => {
  const formData = santizedFormDataWithContext(globals);
  const idComObj = {
    requestString: {
      CustID : formData.AccountOpeningNRENRO.custIDWithoutMasking,
      ProductCode: "ADETBACO",
      userAgent: window.navigator.userAgent,
      journeyID: formData.journeyId,
      journeyName: formData.journeyName,
      scope: "ADOBE_ACNRI",
    },
  };

  return idComObj;
};

/**
   * Fetches an authentication code from the API.
   *
   * This function creates an idcomm request object, constructs the API endpoint URL,
   * and then sends a POST request to the endpoint to fetch the authentication code.
   * @name fetchAuthCode
   * @params {object} globals
   * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
   */
const fetchAuthCode = (globals) => {
  currentFormContext.VISIT_TYPE = 'IDCOMM';
  const idComRequest = createIdComRequestObj(globals);
  const apiEndPoint = urlPath(ENDPOINTS.fetchAuthCode);
  return fetchJsonResponse(apiEndPoint, idComRequest, 'POST');
};

/**
 * does the custom show hide of panel or screens in resend otp.
 * @param {string} errorMessage
 * @param {number} numRetries
 * @param {object} globals
 */
function customFocus(errorMessage, numRetries, globals) {
  if (numRetries === 1) {
    globals.functions.setProperty(globals.form.errorPanel.otppanelwrapper.incorrectOTPPanel, { visible: true });
  }
}

async function idComRedirection(globals){
  let resp = await fetchAuthCode(globals);
  if(resp.status.errorMessage==="Success"){
    window.location.href = resp.redirectUrl;
  }
}

/**
 * @name finalResult - constant-variables store
 */
const finalResult = {
  journeyParamState: null,
  journeyParamStateInfo: null,
};

// post-redirect-aadhar-or-idcom
const searchParam = new URLSearchParams(window.location.search);
const authModeParam = searchParam.get('authmode');
const journeyId = searchParam.get('journeyId');
const idComRedirect = authModeParam && ((authModeParam === 'DebitCard') || (authModeParam === 'CreditCard')); // debit card or credit card flow

/**
 * @name nreNroFetchRes - async action call maker until it reaches the final response.
 * @returns {void}
 */
const nreNroFetchRes = async (globals) => {
  try {
    globals.functions.setProperty(globals.form.runtime.journeyId, { value: journeyId });
    const data = await nreNroInvokeJourneyDropOffByParam('', '', journeyId);
    console.log("DropOffParam Data : " , data);
    const journeyDropOffParamLast = data.formData.journeyStateInfo[data.formData.journeyStateInfo.length - 1];
    finalResult.journeyParamState = journeyDropOffParamLast.state;
    finalResult.journeyParamStateInfo = journeyDropOffParamLast.stateInfo;
    if(journeyDropOffParamLast.state == 'CUSTOMER_ONBOARDING_COMPLETE'){
      console.log("Show Error Here");
    }
    const checkFinalSuccess = (journeyDropOffParamLast.state === 'IDCOM_REDIRECTION_INITIATED');
    if (checkFinalSuccess) {
      console.log("checkFinalSuccess : " , checkFinalSuccess);
    }
    const err = 'Bad response';
    throw err;
  } catch (error) {
    const errorCase = (finalResult.journeyParamState === 'CUSTOMER_FINAL_FAILURE');
    const stateInfoData = finalResult.journeyParamStateInfo;
    if (errorCase) {
      console.log("Error Case : " , errorCase);
    }
  }
};

/**
 * Redirects the user to different panels based on conditions.
 * If `idCom` is true, initiates a journey drop-off process and handles the response.
 * @param {boolean} idCom - Indicates whether ID com redirection is triggered.
 * @returns {void}
 */
const nreNroPageRedirected = (idCom,globals) => {
  if (idCom) {
    setTimeout(() => {
      displayLoader();
      nreNroFetchRes(globals);
    }, 2000);
  }
};

const addPageNameClassInBody = (pageName) => {
  if (pageName === 'Get_OTP_Page' || pageName === 'Submit_OTP') {
    document.body.classList.add('errorPageBody');
  }
  if (pageName === 'Select_Account') {
    document.body.classList.add('wizardPanelBody');
  }
};

const onPageLoadAnalytics = async (globals) => {
  await Promise.resolve(sendAnalytics('page load-All Pages', { }, 'ON_PAGE_LOAD', globals));
};

setTimeout((globals) => {
  onPageLoadAnalytics(globals);
}, 5000);

const switchWizard = (globals) => {
  moveWizardView('wizardNreNro', 'confirmDetails');
  currentFormContext.action = "Confirm Details";
  Promise.resolve(sendAnalytics('page load-Confirm Details', { }, 'ON_CONFIRM_DETAILS_PAGE_LOAD', globals));
}

setTimeout(async function(globals) {
  await nreNroPageRedirected(idComRedirect, globals);
  if (typeof window !== 'undefined') { /* check document-undefined */
    getCountryCodes(document.querySelector('.field-countrycode select'));
  }
}, 2000);

export {
  validateLogin,
  getOtpNRE,
  otpTimer,
  otpValidationNRE,
  updateOTPHelpText,
  prefillCustomerDetails,
  getCountryCodes,
  resendOTP,
  customFocus,
  validFDPan,
  switchWizard,
  setupBankUseSection,
  idComRedirection,
  addPageNameClassInBody
};
