/* eslint-disable no-underscore-dangle */
/* eslint-disable no-useless-escape */
import { CURRENT_FORM_CONTEXT, FORM_RUNTIME as formRuntime } from '../../common/constants.js';
import {
  composeNameOption,
  formUtil,
  urlPath,
  getUrlParamCaseInsensitive,
} from '../../common/formutils.js';
import { getJsonResponse, displayLoader } from '../../common/makeRestAPI.js';
import { addDisableClass, setSelectOptions } from '../domutils/domutils.js';
import { FD_ENDPOINTS, NAME_ON_CARD_LENGTH } from './constant.js';

let CUSTOMER_DATA_BINDING_CHECK = true;

const initializeNameOnCardDdOptions = (globals, personalDetails, customerInfo) => {
  const elementNameSelect = 'nameOnCardDD';
  const { customerFirstName, customerMiddleName, customerLastName } = customerInfo;
  // const customerFirstName = customerInfo.customerFirstName ? customerInfo.customerFirstName : 'FirstName';
  // const customerMiddleName = customerInfo.customerMiddleName ? customerInfo.customerMiddleName : 'MiddleName';
  // const customerLastName = customerInfo.customerLastName ? customerInfo.customerLastName : 'LastName';
  const options = composeNameOption(
    customerFirstName.toUpperCase(),
    customerMiddleName.toUpperCase(),
    customerLastName.toUpperCase(),
    'fd',
    NAME_ON_CARD_LENGTH,
  );
  const initialValue = options[0]?.value;
  setSelectOptions(options, elementNameSelect);
  globals.functions.setProperty(personalDetails.nameOnCardDD, { enum: options, value: initialValue });
};

/**
 * @name bindEmployeeAssistanceField
 * @returns {Promise<Object>} - A promise that resolves with the JSON response from the provided URL.
 */
const bindEmployeeAssistanceField = async (globals) => {
  const { employeeAssistancePanel } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView.employeeAssistance;
  const defaultChannel = getUrlParamCaseInsensitive('channel');
  const codes = {
    lc1Code: getUrlParamCaseInsensitive('lccode'),
    lgCode: getUrlParamCaseInsensitive('lgcode'),
    smCode: getUrlParamCaseInsensitive('smcode'),
    lc2Code: getUrlParamCaseInsensitive('lc2'),
    dsaCode: getUrlParamCaseInsensitive('dsacode'),
    branchCode: getUrlParamCaseInsensitive('branchcode'),
  };

  try {
    const response = await getJsonResponse(FD_ENDPOINTS.masterchannel, null, 'GET');
    if (!response) return;

    const dropDownSelectField = employeeAssistancePanel.channel;
    const options = [{ label: 'Website Download', value: 'Website Download' }];
    let matchedChannel = options[0].value;

    response.forEach((item) => {
      const channel = item.CHANNELS;
      options.push({ label: channel, value: channel });
      if (defaultChannel?.toLowerCase() === channel.toLowerCase()) {
        matchedChannel = channel;
      }
    });

    setSelectOptions(options, 'channel');
    globals.functions.setProperty(dropDownSelectField, { enum: options, value: matchedChannel });

    const changeDataAttrObj = { attrChange: true, value: false };
    ['lc1Code', 'lgCode', 'smCode', 'lc2Code', 'dsaCode', 'branchCode'].forEach((code) => {
      const util = formUtil(globals, employeeAssistancePanel[code]);
      util.setValue(codes[code], changeDataAttrObj);
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Binds customer details from the global context to the current form.
 * @name bindCustomerDetails
 * @param {Object} globals - The global context object containing various information.
 */
const bindCustomerDetails = (globals) => {
  if (!CUSTOMER_DATA_BINDING_CHECK) return;
  CUSTOMER_DATA_BINDING_CHECK = false;
  formRuntime.validatePanLoader = (typeof window !== 'undefined') ? displayLoader : false;
  bindEmployeeAssistanceField(globals);
  const { customerInfo } = CURRENT_FORM_CONTEXT;
  const changeDataAttrObj = { attrChange: true, value: false, disable: true };
  const genderMap = { Male: '0', Female: '1', Others: '3' };
  const { reviewDetailsView } = globals.form.fdBasedCreditCardWizard.basicDetails;
  const { personalDetails, addressDetails } = reviewDetailsView;

  const setFormValue = (field, value) => {
    const fieldUtil = formUtil(globals, field);
    fieldUtil.setValue(value, changeDataAttrObj);
  };
  // customerInfo.customerFullName = 'FirstName MiddleName LastName';
  setFormValue(personalDetails.fullName, customerInfo.customerFullName);
  setFormValue(personalDetails.gender, genderMap[customerInfo.gender]);
  setFormValue(personalDetails.dateOfBirthPersonalDetails, customerInfo.dob);
  if (customerInfo.pan) {
    const formattedPan = customerInfo.pan.replace(/([A-Za-z])(\d)|(\d)([A-Za-z])/g, '$1$3 $2$4');
    setFormValue(personalDetails.panNumberPersonalDetails, formattedPan);
  }
  setFormValue(addressDetails.prefilledMailingAdddress, customerInfo.address);
  const emailIDUtil = formUtil(globals, personalDetails.emailID);
  emailIDUtil.setValue(customerInfo.emailId, { attrChange: true, value: false });
  // setFormValue(personalDetails.fullName, '');
  // setFormValue(personalDetails.panNumberPersonalDetails, '');
  // setFormValue(personalDetails.emailID, '');
  // setFormValue(addressDetails.prefilledMailingAdddress, '');
  if (customerInfo.address.length === 0) {
    globals.functions.setProperty(addressDetails.prefilledMailingAdddress, { visible: false });
    globals.functions.setProperty(addressDetails.mailingAddressToggle, { value: 'off', enabled: false });
  }
  if (customerInfo.customerFullName.length < NAME_ON_CARD_LENGTH) {
    setFormValue(personalDetails.nameOnCard, customerInfo.customerFullName?.toUpperCase());
  } else {
    globals.functions.setProperty(personalDetails.nameOnCard, { visible: false });
    globals.functions.setProperty(personalDetails.nameOnCardDD, { visible: true });
    initializeNameOnCardDdOptions(globals, personalDetails, customerInfo);
  }

  const personaldetails = document.querySelector('.field-personaldetails');
  setTimeout(() => {
    addDisableClass(personaldetails, ['nameOnCardDD', 'emailID']);
  }, 10);
};

/**
 *
 * @name validateEmailID
 * @param {Object} globals - The global context object containing various information.
 */
const validateEmailID = async (email, globals) => {
  const url = urlPath(FD_ENDPOINTS.emailId);
  const invalidMsg = 'Please enter valid email id...';
  const payload = {
    email,
  };
  const method = 'POST';
  try {
    const emailValid = await getJsonResponse(url, payload, method);
    if (emailValid === true) {
      console.log(email, globals, invalidMsg);
    } else {
      console.log(email);
    }
  } catch (error) {
    console.error(error, 'error in emailValid');
  }
};

const setVisibility = (panel, properties, visibility, globals) => {
  properties.forEach((property) => {
    globals.functions.setProperty(panel[property], { visible: visibility });
  });
};

/**
 *
 * @name channelChangeHandler
 * @param {Object} globals - The global context object containing various information.
 */
const channelChangeHandler = (globals) => {
  const { employeeAssistancePanel } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView.employeeAssistance;
  const channelValue = employeeAssistancePanel.channel._data.$_value;

  const visibilitySettings = {
    'website download': ['branchCity', 'branchCode', 'branchName', 'cardsBdrLc1', 'tseLgCode', 'dsaCode', 'dsaName', 'lc1Code', 'lc2Code', 'lgCode', 'smCode'],
    branch: ['dsaCode', 'dsaName', 'lc1Code', 'lgCode'],
    dsa: ['branchCity', 'branchCode', 'branchName', 'tseLgCode', 'cardsBdrLc1'],
    default: ['branchCity', 'branchCode', 'branchName', 'cardsBdrLc1', 'tseLgCode', 'dsaCode', 'dsaName'],
  };

  const propertiesToHide = visibilitySettings[channelValue.toLowerCase()] || visibilitySettings.default;
  setVisibility(employeeAssistancePanel, propertiesToHide, false, globals);
};

/**
 *
 * @name dsaCodeHandler
 * @param {Object} globals - The global context object containing various information.
 */
const dsaCodeHandler = async (globals) => {
  const { employeeAssistancePanel } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView.employeeAssistance;
  const dsaCode = employeeAssistancePanel.dsaCode._data.$_value?.toLowerCase();
  const url = `${FD_ENDPOINTS.dsamaster}${dsaCode}.json`;

  try {
    const response = await getJsonResponse(url, null, 'GET');

    if (response && response.length === 1) {
      const { DSA_CODE, DSA_NAME } = response[0];

      if (DSA_CODE.toLowerCase() === dsaCode) {
        const changeDataAttrObj = { attrChange: true, value: false, disable: true };
        const dsaNameUtil = formUtil(globals, employeeAssistancePanel.dsaName);
        dsaNameUtil.setValue(DSA_NAME, changeDataAttrObj);
        return;
      }
    }
    globals.functions.setProperty(employeeAssistancePanel.dsaName, { value: '', readOnly: false });
  } catch (error) {
    console.log(error);
  }
};

/**
*
* @name branchCodeHandler
* @param {Object} globals - The global context object containing various information.
*/
const branchCodeHandler = async (globals) => {
  const { employeeAssistancePanel } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView.employeeAssistance;
  const branchCode = employeeAssistancePanel.branchCode._data.$_value;
  const url = `${FD_ENDPOINTS.branchMaster}${branchCode}.json`;
  const branchNameUtil = formUtil(globals, employeeAssistancePanel.branchName);
  const branchCityUtil = formUtil(globals, employeeAssistancePanel.branchCity);
  try {
    const response = await getJsonResponse(url, null, 'GET');
    if (response?.total === 1) {
      const changeDataAttrObj = { attrChange: true, value: false, disable: true };
      branchNameUtil.setValue(response.branchDetails[0].Name, changeDataAttrObj);
      branchCityUtil.setValue(response.cityDetails[0].CityName, changeDataAttrObj);
    }
  } catch (error) {
    globals.functions.setProperty(employeeAssistancePanel.branchName, { value: '', readOnly: false });
    globals.functions.setProperty(employeeAssistancePanel.branchCity, { value: '', readOnly: false });
  }
};

export {
  bindCustomerDetails,
  validateEmailID,
  channelChangeHandler,
  dsaCodeHandler,
  branchCodeHandler,
};
