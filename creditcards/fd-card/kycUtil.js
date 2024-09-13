import { CURRENT_FORM_CONTEXT } from '../../common/constants.js';

const KYC_STATE = {
  selectedKyc: '',
};
const kycProceedClickHandler = (selectedKyc, globals) => {
  const {
    addressDeclarationPanel,
    aadharConsent,
  } = globals.form;
  KYC_STATE.selectedKyc = selectedKyc;
  switch (selectedKyc) {
    case 'BIOMETRIC':
      // biometric flow
      globals.functions.setProperty(addressDeclarationPanel.currentResidenceAddressBiometricOVD, { visible: true });
      break;
    case 'AADHAAR':
      // aadhaar vkyc flow
      globals.functions.setProperty(aadharConsent, { visible: true });
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

const aadhaarConsent = async (globals) => {
  try {
    if (typeof window !== 'undefined') {
      const openModal = (await import('../../blocks/modal/modal.js')).default;
      const { aadharLangChange } = await import('./cc.js');
      const contentDomName = 'aadharConsentPopup';
      const btnWrapClassName = 'button-wrapper';
      const config = {
        content: document.querySelector(`[name = ${contentDomName}]`),
        actionWrapClass: btnWrapClassName,
        reqConsentAgree: true,
      };
      if (typeof formRuntime.aadharConfig === 'undefined') {
        formRuntime.aadharConfig = config;
      }
      await openModal(formRuntime.aadharConfig);
      aadharLangChange(formRuntime.aadharConfig?.content, 'English');
      config?.content?.addEventListener('modalTriggerValue', async (event) => {
        const receivedData = event.detail;
        if (receivedData?.aadharConsentAgree) {
          globals.functions.setProperty(globals.form.corporateCardWizardView.selectKycPanel.selectKYCOptionsPanel.ckycDetailsContinueETBPanel.triggerAadharAPI, { value: 1 });
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export {
  kycProceedClickHandler,
  addressDeclarationProceedHandler,
};
