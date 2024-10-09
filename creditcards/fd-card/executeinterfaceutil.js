import { CURRENT_FORM_CONTEXT, FORM_RUNTIME } from '../../common/constants.js';
import { urlPath } from '../../common/formutils.js';
import { fetchJsonResponse, restAPICall } from '../../common/makeRestAPI.js';
import { confirmCardState } from './confirmcardutil.js';
import { JOURNEY_NAME, FD_ENDPOINTS, EMPLOYEE_MAP } from './constant.js';
import { SELECTED_CUSTOMER_ID } from './customeridutil.js';
import { invokeJourneyDropOffUpdate } from './fd-journey-util.js';
import { SELECT_FD_STATE } from './fddetailsutil.js';
import finalDap from './finaldaputils.js';
import { IPA_RESPONSE } from './ipautil.js';

const createExecuteInterfaceRequest = (payload, source, globals) => {
  const {
    customerInfo,
    journeyID,
    customerAddress,
    permanentAddress,
  } = CURRENT_FORM_CONTEXT;
  const { basicDetails, selectFD } = globals.form.fdBasedCreditCardWizard;
  const {
    personalDetails, addressDetails, employeeAssistance, employmentDetails,
  } = basicDetails.reviewDetailsView;
  const { employeeAssistancePanel, employeeAssistanceToggle } = employeeAssistance;

  const { fdNumberSelection } = selectFD.fdSelectionInfo;
  const { fdList } = SELECT_FD_STATE;
  const selectedFds = fdNumberSelection.reduce((acc, fd) => {
    if (fd.fdAccSelect._data.$_value === 'on') {
      acc.push(fd?.fdNumber?._data?.$_value?.toString());
    }
    return acc;
  }, []);
  const selectedFdDetails = fdList.filter((fd) => selectedFds.includes(fd.fdAccountNo.trim())) // Filter based on selected FD
    .map((fd) => ({
      fdNumber: fd.fdAccountNo.trim(),
      fdTenure: `${fd.termMonths} months ${fd.termDays} days`,
      fdAmt: fd.balPrincipal,
    }));
  const addressEditFlag = addressDetails?.mailingAddressToggle?.$value !== 'on';

  const getAddress = (addressSource) => ({
    line1: addressSource?.addressLine1 || '',
    line2: addressSource?.addressLine2 || '',
    line3: addressSource?.addressLine3 || '',
    city: addressSource?.city || '',
    state: addressSource?.state || '',
    zip: addressSource?.pincode || addressSource?.comCityZip || '',
  });

  const getEditedAddress = (panel) => ({
    line1: panel?.newCurrentAddressLine1?.$value || '',
    line2: panel?.newCurrentAddressLine2?.$value || '',
    line3: panel?.newCurrentAddressLine3?.$value || '',
    city: panel?.newCurentAddressCity?.$value || '',
    state: panel?.newCurentAddressState?.$value || '',
    zip: panel?.newCurentAddressPin?.$value || '',
  });

  let communicationAddress = getAddress(customerAddress);
  let customerPermanentAddress = CURRENT_FORM_CONTEXT?.perAddExist
    ? getAddress(permanentAddress)
    : communicationAddress;

  if (addressEditFlag) {
    const newAddressPanel = addressDetails.newCurentAddressPanel;
    communicationAddress = getEditedAddress(newAddressPanel);
    customerPermanentAddress = getEditedAddress(newAddressPanel);
  }

  let apsEmailEditFlag = 'N';
  if (customerInfo?.refCustEmail !== personalDetails.emailID.$value) {
    apsEmailEditFlag = 'Y';
  }
  let nameOnCard = personalDetails.nameOnCard?.$value?.toUpperCase()?.replace(/\s+/g, ' ');
  if (!CURRENT_FORM_CONTEXT?.editFlags?.nameOnCard) {
    nameOnCard = personalDetails.nameOnCardDD?.$value?.toUpperCase()?.replace(/\s+/g, ' ');
  }
  if (source === 'confirmcard') {
    CURRENT_FORM_CONTEXT.selectedProductCode = IPA_RESPONSE?.productDetails?.[confirmCardState.selectedCardIndex]?.cardProductCode;
  }
  const annualIncome = employmentDetails?.annualIncome?._data?.$_value || '';
  const empAssistanceToggle = employeeAssistanceToggle?._data?.$_value === 'on';
  const companyName = employmentDetails.employmentType._data.$_value === '1' || employmentDetails.employmentType._data.$_value === '2' ? customerInfo?.customerFullName : '';
  const request = {
    requestString: {
      addressEditFlag: addressEditFlag ? 'Y' : 'N',
      annualIncomeOrItrAmount: String(annualIncome),
      annualItr: '',
      applyingBranch: 'N',
      apsDobEditFlag: customerInfo?.datBirthCust ? 'N' : 'Y',
      apsEmailEditFlag,
      authMode: '',
      bankAccountNumber: SELECTED_CUSTOMER_ID?.selectedCustId?.codAcctNo,
      bankEmployee: 'N',
      branchCity: (empAssistanceToggle && employeeAssistancePanel?.branchCity?._data?.$_value) || '',
      branchName: (empAssistanceToggle && employeeAssistancePanel?.branchName?._data?.$_value) || '',
      CCAD_Relationship_number: '',
      cardsData: '',
      channel: (empAssistanceToggle && employeeAssistancePanel?.channel?._data?.$_value) || '',
      channelSource: '',
      communicationAddress1: communicationAddress?.line1,
      communicationAddress2: communicationAddress?.line2,
      communicationAddress3: communicationAddress?.line3,
      communicationCity: communicationAddress?.city,
      communicationState: communicationAddress?.state,
      comAddressType: '2',
      comCityZip: communicationAddress?.zip,
      comResidenceType: '2',
      companyName,
      customerID: SELECTED_CUSTOMER_ID?.selectedCustId?.customerID,
      dateOfBirth: personalDetails.dateOfBirthPersonalDetails.$value,
      departmentOrEmpCode: '',
      designation: EMPLOYEE_MAP[employmentDetails.employmentType._data.$_value],
      dsaValue: (empAssistanceToggle && employeeAssistancePanel?.dsaName?._data?.$_value) || '',
      dseCode: (empAssistanceToggle && employeeAssistancePanel?.dsaCode?._data?.$_value) || '',
      eReferenceNumber: CURRENT_FORM_CONTEXT.referenceNumber,
      filler6: '',
      firstName: customerInfo.customerFirstName,
      fullName: customerInfo?.customerFullName,
      gender: personalDetails.gender._data.$_value,
      isManualFlow: 'false',
      journeyFlag: 'ETB',
      journeyID,
      journeyName: JOURNEY_NAME,
      lastName: customerInfo.customerLastName,
      leadClosures: '',
      leadGenerater: '',
      lc2: (empAssistanceToggle && employeeAssistancePanel?.lc2Code?._data?.$_value) || '',
      lienConsent: new Date().toISOString(),
      middleName: customerInfo.customerMiddleName,
      mobileEditFlag: 'N',
      mobileNumber: globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value,
      monthlyincome: '',
      nameEditFlag: personalDetails?.fathersFullName?.$value?.length > 0 || CURRENT_FORM_CONTEXT?.nameParsed ? 'Y' : 'N',
      nameOnCard,
      occupation: employmentDetails.employmentType._data.$_value || '1',
      officialEmailId: '',
      officeAddress1: '',
      officeAddress2: '',
      officeAddress3: '',
      officeCity: '',
      officeState: '',
      officeZipCode: '',
      panCheckFlag: 'Y',
      panDobMatch: payload?.validDob,
      panEditFlag: customerInfo?.refCustItNum ? 'N' : 'Y',
      panNameMatch: payload?.validName,
      panNumber: personalDetails.panNumberPersonalDetails.$value.replace(/\s+/g, ''),
      permanentAddress1: customerPermanentAddress?.line1,
      permanentAddress2: customerPermanentAddress?.line2,
      permanentAddress3: customerPermanentAddress?.line3,
      permanentCity: customerPermanentAddress?.city,
      permanentState: customerPermanentAddress?.state,
      permanentZipCode: customerPermanentAddress?.zip,
      perAddressType: '2',
      perfiosTxnID: '',
      personalEmailId: personalDetails?.emailID.$value,
      productCode: source === 'confirmcard' ? CURRENT_FORM_CONTEXT?.selectedProductCode : '',
      resPhoneEditFlag: 'N',
      selectedFdDetails,
      selfConfirmation: 'Y',
      smCode: (empAssistanceToggle && employeeAssistancePanel?.smCode?._data?.$_value) || '',
      timeInfo: new Date().toISOString(),
    },
  };
  return request;
};
/**
 * Executes an interface request.
 * @name executeInterface
 * @param {object} payload - The payload for the interface request.
 * @param {boolean} showLoader - Whether to show a loader while the request is in progress.
 * @param {boolean} hideLoader - Whether to hide the loader after the request is complete.
 * @param {string} source
 * @param {object} globals - The global context object.
 * @returns {Promise<object>} A promise that resolves to the response of the interface request.
 */
const executeInterface = (payload, showLoader, hideLoader, source, globals) => {
  const executeInterfaceRequest = createExecuteInterfaceRequest(payload, source, globals);
  CURRENT_FORM_CONTEXT.executeInterfaceRequest = executeInterfaceRequest;
  Object.keys(executeInterfaceRequest).forEach((key) => {
    if (executeInterfaceRequest[key] === undefined) {
      executeInterfaceRequest[key] = '';
    }
  });
  if (CURRENT_FORM_CONTEXT?.selectedKyc === 'biokyc') {
    executeInterfaceRequest.requestString.authMode = 'OTP';
  }
  const apiEndPoint = urlPath(FD_ENDPOINTS.executeInterface);
  if (showLoader) FORM_RUNTIME.executeInterface();
  return fetchJsonResponse(apiEndPoint, executeInterfaceRequest, 'POST', hideLoader);
};

/**
 * Executes an interface post request with the appropriate authentication mode based on the response.
 *
 * @param {object} source - The source object (unused in the current implementation).
 * @param {object} globals - An object containing global variables and functions.
 */
const executeInterfacePostRedirect = async (source, userRedirected, globals) => {
  const formCallBackContext = globals.functions.exportData()?.currentFormContext || JSON.parse(globals?.functions?.exportData()?.formContext);
  const requestObj = formCallBackContext?.executeInterfaceRequest;

  if (source === 'idCom') {
    if (requestObj?.requestString?.addressEditFlag?.toUpperCase() === 'Y') {
      requestObj.requestString.authMode = 'eKYCID-COM';
    } else requestObj.requestString.authMode = 'IDCOM';
  }
  const apiEndPoint = urlPath(FD_ENDPOINTS.executeInterface);
  const eventHandlers = {
    successCallBack: (response) => {
      if (response?.ExecuteInterfaceResponse?.APS_ERROR_CODE === '0000') {
        CURRENT_FORM_CONTEXT.jwtToken = response.Id_token_jwt;
        finalDap(userRedirected, globals);
      } else {
        const formContextCallbackData = globals.functions.exportData()?.currentFormContext;
        const mobileNumber = globals.functions.exportData().form.login.registeredMobileNumber;
        const leadProfileId = globals.functions.exportData().leadProifileId;
        const journeyId = formContextCallbackData.journeyID;
        invokeJourneyDropOffUpdate('POST_EXECUTEINTERFACE_FAILURE', mobileNumber, leadProfileId, journeyId, globals);
      }
    },
    errorCallBack: (response) => {
      console.error(response);
    },
  };
  restAPICall('', 'POST', requestObj, apiEndPoint, eventHandlers.successCallBack, eventHandlers.errorCallBack);
};

export {
  executeInterface,
  executeInterfacePostRedirect,
};
