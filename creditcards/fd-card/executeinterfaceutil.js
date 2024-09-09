import { CURRENT_FORM_CONTEXT, FORM_RUNTIME } from '../../common/constants.js';
import { urlPath } from '../../common/formutils.js';
import { fetchJsonResponse } from '../../common/makeRestAPI.js';
import { JOURNEY_NAME, FD_ENDPOINTS } from './constant.js';

const createExecuteInterfaceRequest = (payload, globals) => {
  const { customerInfo, journeyID } = CURRENT_FORM_CONTEXT;
  const { reviewDetailsView } = globals.form.fdBasedCreditCardWizard.basicDetails;
  const { personalDetails, addressDetails } = reviewDetailsView;
  let communicationAddress1 = customerInfo?.communicationAddress1;
  let communicationAddress2 = customerInfo?.communicationAddress2;
  let communicationAddress3 = customerInfo?.communicationAddress3;
  let communicationCity = customerInfo?.communicationCity;
  let communicationState = customerInfo?.communicationState;
  let comCityZip = customerInfo?.comCityZip;
  const addressEditFlag = addressDetails?.mailingAddressToggle?.$value === 'on' ? 'N' : 'Y';
  if (addressEditFlag === 'Y') {
    communicationAddress1 = addressDetails.newCurentAddressPanel.newCurrentAddressLine1.$value || '';
    communicationAddress2 = addressDetails.newCurentAddressPanel.newCurrentAddressLine2.$value || '';
    communicationAddress3 = addressDetails.newCurentAddressPanel.newCurrentAddressLine3.$value || '';
    communicationCity = addressDetails.newCurentAddressPanel.newCurentAddressCity.$value;
    communicationState = addressDetails.newCurentAddressPanel.newCurentAddressState.$value;
    comCityZip = addressDetails.newCurentAddressPanel.newCurentAddressPin.$value;
  }
  const request = {
    requestString: {
      addressEditFlag,
      annualIncomeOrItrAmount: '',
      annualItr: '',
      applyingBranch: 'N',
      apsDobEditFlag: 'N',
      apsEmailEditFlag: 'N',
      authMode: '',
      bankEmployee: 'N',
      branchCity: '',
      branchName: '',
      CCAD_Relationship_number: '',
      cardsData: '',
      channel: '',
      channelSource: '',
      communicationAddress1: communicationAddress1 || 'Address line 1',
      communicationAddress2: communicationAddress2 || 'Address line 2',
      communicationAddress3: communicationAddress3 || 'Address line 3',
      communicationCity: communicationCity || 'Bengaluru',
      communicationState: communicationState || 'Karnataka',
      comAddressType: '2',
      comCityZip: comCityZip || '560102',
      comResidenceType: '2',
      companyName: '',
      // customerID: SELECTED_CUSTOMER_ID.selectedCustId.customerId,
      customerID: '',
      dateOfBirth: personalDetails.dateOfBirthPersonalDetails.$value,
      departmentOrEmpCode: '',
      designation: '',
      dsaValue: '',
      dseCode: '',
      eReferenceNumber: CURRENT_FORM_CONTEXT.referenceNumber,
      filler6: '',
      firstName: customerInfo.customerFirstName,
      fullName: customerInfo?.customerFullName,
      gender: '1',
      isManualFlow: 'false',
      journeyFlag: 'ETB',
      journeyID,
      journeyName: JOURNEY_NAME,
      lastName: customerInfo.customerLastName,
      leadClosures: '',
      leadGenerater: '',
      lc2: '',
      middleName: customerInfo.customerMiddleName,
      mobileEditFlag: 'N',
      mobileNumber: globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value,
      monthlyincome: '',
      nameEditFlag: personalDetails?.fathersFullName?.$value?.length > 0 ? 'Y' : 'N',
      nameOnCard: 'RANJIT SO VIJAY',
      occupation: '1',
      officialEmailId: 'deepak.bisht@hdfcbank.com',
      officeAddress1: '',
      officeAddress2: '',
      officeAddress3: '',
      officeCity: '',
      officeState: '',
      officeZipCode: '',
      panCheckFlag: 'Y',
      panEditFlag: 'N',
      panNumber: personalDetails.panNumberPersonalDetails.$value.replace(/\s+/g, ''),
      permanentAddress1: 'I THINK LODHA FLAT NO 93',
      permanentAddress2: 'COURTYARD MUMBAI',
      permanentAddress3: '',
      perAddressType: '2',
      permanentCity: 'Mumbai',
      permanentState: 'MAHARASHTRA',
      permanentZipCode: '400042',
      perfiosTxnID: '',
      personalEmailId: personalDetails?.emailID.$value,
      productCode: '',
      resPhoneEditFlag: 'N',
      selfConfirmation: 'Y',
      smCode: '',
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
 * @param {object} globals - The global context object.
 * @returns {Promise<object>} A promise that resolves to the response of the interface request.
 */
const executeInterface = (payload, showLoader, hideLoader, globals) => {
  const executeInterfaceRequest = createExecuteInterfaceRequest(payload, globals);
  Object.keys(executeInterfaceRequest).forEach((key) => {
    if (executeInterfaceRequest[key] === undefined) {
      executeInterfaceRequest[key] = '';
    }
  });
  const apiEndPoint = urlPath(FD_ENDPOINTS.executeInterface);
  if (showLoader) FORM_RUNTIME.executeInterface();
  return fetchJsonResponse(apiEndPoint, executeInterfaceRequest, 'POST', hideLoader);
};

export default executeInterface;
