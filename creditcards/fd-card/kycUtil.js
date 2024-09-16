import { CURRENT_FORM_CONTEXT, FORM_RUNTIME } from '../../common/constants.js';
import { aadharLangChange } from '../domutils/domutils.js';
import { DOM_ELEMENT } from './constant.js';

const KYC_STATE = {
  selectedKyc: '',
};
const kycProceedClickHandler = (selectedKyc, globals) => {
  const {
    addressDeclarationPanel,
    aadharConsent,
    docUploadFlow,
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
      globals.functions.setProperty(docUploadFlow, { visible: true });
      globals.functions.setProperty(docUploadFlow.uploadAddressProof, { visible: CURRENT_FORM_CONTEXT.customerIdentityChange });
      globals.functions.setProperty(docUploadFlow.docUploadPanel, { visible: true });
      CURRENT_FORM_CONTEXT.identityDocUploadFlag = true;
      CURRENT_FORM_CONTEXT.addressDocUploadFlag = !!CURRENT_FORM_CONTEXT?.customerIdentityChange;
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
  const { addressDeclarationPanel, selectKYCOptionsPanel } = globals.form;
  try {
    if (typeof window !== 'undefined') {
      const openModal = (await import('../../blocks/modal/modal.js')).default;
      const config = {
        content: document.querySelector(`[name = ${DOM_ELEMENT.selectKyc.aadharModalContent}]`),
        actionWrapClass: DOM_ELEMENT.selectKyc.modalBtnWrapper,
        reqConsentAgree: true,
      };
      if (typeof FORM_RUNTIME.aadharConfig === 'undefined') {
        FORM_RUNTIME.aadharConfig = config;
      }
      await openModal(FORM_RUNTIME.aadharConfig);
      aadharLangChange(FORM_RUNTIME.aadharConfig?.content, DOM_ELEMENT.selectKyc.defaultLanguage);
      config?.content?.addEventListener('modalTriggerValue', (event) => {
        const receivedData = event.detail;
        if (receivedData?.aadharConsentAgree) {
          globals.functions.setProperty(selectKYCOptionsPanel.triggerAadharAPI, { value: 1 });
          globals.functions.setProperty(addressDeclarationPanel, { visible: true });
          globals.functions.setProperty(addressDeclarationPanel.aadhaarAddressDeclaration, { visible: true });
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
  aadhaarConsent,
};
