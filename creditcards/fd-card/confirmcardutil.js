import { getUrlParamCaseInsensitive } from '../../common/formutils.js';

/**
 *
 * @name confirmCardClickHandler
 * @param {Object} globals - The global context object containing various information.
 */
const confirmCardClickHandler = (globals) => {
  const { addressDetails, employeeAssistance } = globals.form.fdBasedCreditCardWizard.basicDetails.reviewDetailsView;
  const { aadharBiometricVerification } = globals.form.selectKYCOptionsPanel.selectKYCMethodOption1;
  const inPersonBioKYC = getUrlParamCaseInsensitive('InpersonBioKYC');
  if ((addressDetails.mailingAddressToggle._data.$_value === 'off' || inPersonBioKYC.toLowerCase() === 'yes')
  && employeeAssistance.inPersonBioKYCPanel.inPersonBioKYCOptions._data.$_value === '0') {
    globals.functions.setProperty(aadharBiometricVerification, { value: '0' });
  }
};

export default confirmCardClickHandler;
