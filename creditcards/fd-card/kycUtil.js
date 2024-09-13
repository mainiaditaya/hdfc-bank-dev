import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';

const KYC_STATE = {
  selectedKyc: '',
};
const kycProceedClickHandler = (selectedKyc, globals) => {
  const { addressDeclarationPanel } = globals.form;
  switch (selectedKyc) {
    case 'BIOMETRIC':
      // biometric flow
      globals.functions.setProperty(addressDeclarationPanel.currentResidenceAddressBiometricOVD, { visible: true });
      KYC_STATE.selectedKyc = selectedKyc;
      break;
    case 'AADHAAR':
      // aadhaar vkyc flow
      break;
    case 'OVD':
      // ovd flow
      break;
    default:
  }
};

const addressDeclarationProceedHandler = (globals) => {
  const { addressDeclarationPanel, docUploadFlow, resultPanel } = globals.form;
  if (CURRENT_FORM_CONTEXT.customerIdentityChange && KYC_STATE.selectedKyc === 'BIOMETRIC') {
    const { docUploadPanel, uploadAddressProof } = docUploadFlow;
    globals.functions.setProperty(addressDeclarationPanel, { visible: false });
    globals.functions.setProperty(docUploadFlow, { visible: true });
    globals.functions.setProperty(docUploadPanel, { visible: false });
    globals.functions.setProperty(uploadAddressProof, { visible: true });
    return;
  }
  if (!CURRENT_FORM_CONTEXT.customerIdentityChange && KYC_STATE.selectedKyc === 'BIOMETRIC') {
    // call final dap
    globals.functions.setProperty(addressDeclarationPanel, { visible: false });
    globals.functions.setProperty(resultPanel, { visible: true });
    globals.functions.setProperty(resultPanel.successResultPanel, { visible: true });
    globals.functions.setProperty(resultPanel.successResultPanel.vkycConfirmationPanel, { visible: false });
  }
};

export {
  kycProceedClickHandler,
  addressDeclarationProceedHandler,
};
