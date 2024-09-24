/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import { invokeJourneyDropOffUpdate } from './journey-utils.js';
import {
  displayLoader,
  hideLoaderGif,
  chainedFetchAsyncCall,
} from '../../common/makeRestAPI.js';
import { urlPath, generateUUID, moveWizardView } from '../../common/formutils.js';
import { ENDPOINTS, CURRENT_FORM_CONTEXT as currentFormContext } from '../../common/constants.js';
import { sendAnalytics } from './analytics.js';

/**
 * Creates a FormData payload for document upload.
 *
 * @param {Object} param0 - Parameters object.
 * @param {Object} param0.docValue - Document value object containing data to upload.
 * @param {string} param0.docType - Type of the document.
 * @param {string} param0.fileId - Unique identifier for the file.
 * @returns {Promise<FormData>} FormData object containing the document payload.
 * @throws {Error} Throws an error if document creation fails.
 */
const createDocPayload = async ({ docValue, docType, fileId }) => {
  try {
    const {
      journeyName,
      journeyID,
      eRefNumber,
      breDemogResponse: { MOBILE },
      executeInterfaceResPayload: { applicationRefNumber },
    } = currentFormContext;
    const file = docValue?.$value?.data;
    const fileBinary = file;
    const documentName = file.name;
    const mobileNumber = String(MOBILE);
    const { userAgent } = window.navigator;
    const uuId = generateUUID();
    const payloadKeyValuePairs = {
      [`${uuId}`]: fileBinary,
      imageBinary: fileBinary,
      docuemntType: docType,
      journeyID,
      requestNumber: eRefNumber,
      applicationRefNo: applicationRefNumber,
      journeyName,
      mobileNumber,
      userAgent,
      docuemntName: documentName,
      fileId: uuId,
      [`existing_${fileId}`]: '',
    };
    const formData = new FormData();
    Object.entries(payloadKeyValuePairs).forEach(([key, value]) => formData.append(key?.toString(), value));
    return formData;
  } catch (error) {
    throw new Error('Failed to create document payload', error);
  }
};

/**
 * documentUpload
 * @param {object} globals - The global object containing necessary globals form data
 */
const documentUpload = async (globals) => {
  const fsId = '1_FS';
  const bsId = '1_BS';
  const {
    selectKycPanel: {
      docUploadETBFlow: { DocUploadFront, DocUploadBack, docUploadDropdown },
    },
  } = globals.form.corporateCardWizardView;
  const docType = docUploadDropdown.$value;
  const frontDoc = {
    docValue: DocUploadFront,
    docType,
    fileId: fsId,
  };
  const backDoc = {
    docValue: DocUploadBack,
    docType,
    fileId: bsId,
  };
  const apiEndPoint = urlPath(ENDPOINTS.docUpload);
  const method = 'POST';

  sendAnalytics('document upload continue', { errorCode: '0000', errorMessage: 'Success' }, 'JOURNEYSTATE', globals); // should be called in form
  const formContextCallbackData = globals.functions.exportData()?.currentFormContext || currentFormContext;
  const mobileNumber = globals.functions.exportData().form.login.registeredMobileNumber || globals.form.loginPanel.mobilePanel.registeredMobileNumber.$value;
  const leadProfileId = globals.functions.exportData().leadProifileId || globals.form.runtime.leadProifileId.$value;
  const journeyId = formContextCallbackData.journeyID;

  const {
    AddressDeclarationAadhar, addressDeclarationOffice, addressDeclarationText1, addressDeclarationText2,
    tandCPanelConfirmAndSubmit: { confirmAndSubmitTC2 },
  } = globals.form.corporateCardWizardView.confirmAndSubmitPanel.addressDeclarationPanel;

  try {
    displayLoader();
    const fsFilePayload = await createDocPayload(frontDoc);
    const bsFilePayload = await createDocPayload(backDoc);
    if (fsFilePayload && bsFilePayload) {
      const [fsFileResponse, bsFileResponse] = await chainedFetchAsyncCall(
        apiEndPoint,
        method,
        [fsFilePayload, bsFilePayload],
        'formData',
      );
      if ((fsFileResponse.value?.errorCode === '0000') && (bsFileResponse.value?.errorCode === '0000')) {
        hideLoaderGif();
        moveWizardView('corporateCardWizardView', 'confirmAndSubmitPanel');
        invokeJourneyDropOffUpdate('DOCUMENT_UPLOAD_SUCCESS', mobileNumber, leadProfileId, journeyId, globals);
        globals.functions.setProperty(AddressDeclarationAadhar, { visible: false });
        globals.functions.setProperty(addressDeclarationOffice, { visible: false });
        globals.functions.setProperty(addressDeclarationText1, { visible: false });
        globals.functions.setProperty(addressDeclarationText2, { visible: false });
        globals.functions.setProperty(confirmAndSubmitTC2, { visible: false });
      } else {
        throw new Error('file upload failed');
      }
    }
    throw new Error('Error in File');
  } catch (error) {
    hideLoaderGif();
    globals.functions.setProperty(globals.form.corporateCardWizardView, { visible: false });
    globals.functions.setProperty(globals.form.resultPanel, { visible: true });
    globals.functions.setProperty(globals.form.resultPanel.errorResultPanel, { visible: true });
  }
};

export default documentUpload;
