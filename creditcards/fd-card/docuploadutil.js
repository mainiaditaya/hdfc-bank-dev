/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import { invokeJourneyDropOffUpdate } from './fd-journey-util.js';
import {
  displayLoader,
  hideLoaderGif,
  chainedFetchAsyncCall,
} from '../../common/makeRestAPI.js';
import { urlPath, generateUUID } from '../../common/formutils.js';
import { ENDPOINTS, CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import { finalPagePanelVisibility } from './thankyouutil.js';
import creditCardSummary from './creditcardsumaryutil.js';
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
const createDocPayload = async ({ docValue, docType, fileId }, mobileNumber) => {
  try {
    const {
      journeyName,
      journeyID,
      eRefNumber,
    } = CURRENT_FORM_CONTEXT;
    const file = docValue?.$value?.data;
    const fileBinary = file;
    const documentName = file.name;
    const { userAgent } = window.navigator;
    const uuId = generateUUID();
    const payloadKeyValuePairs = {
      [`${uuId}`]: fileBinary,
      imageBinary: fileBinary,
      docuemntType: docType,
      journeyID,
      requestNumber: eRefNumber,
      applicationRefNo: CURRENT_FORM_CONTEXT.executeInterfaceResponse.APS_APPL_REF_NUM,
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
 * docUploadClickHandler
 * @param {object} globals - The global object containing necessary globals form data
 */
const docUploadClickHandler = async (globals) => {
  const {
    docUploadPanel,
    uploadAddressProof,
  } = globals.form.docUploadFlow;
  const identityDocType = docUploadPanel.docUploadDropdown.$value;
  const addressDocType = uploadAddressProof.docTypeDropdown.$value;
  const mobileNumber = globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value;
  const formContextCallbackData = globals.functions.exportData()?.currentFormContext || CURRENT_FORM_CONTEXT;
  const leadProfileId = globals.functions.exportData().leadProifileId || globals.form.runtime.leadProifileId.$value || '';
  const journeyId = formContextCallbackData.journeyID;
  const apiEndPoint = urlPath(ENDPOINTS.docUpload);
  const method = 'POST';

  const documents = [
    ...(CURRENT_FORM_CONTEXT?.identityDocUploadFlag ? [
      { docValue: docUploadPanel?.DocUploadFront, docType: identityDocType, fileId: '1_FS' },
      { docValue: docUploadPanel?.DocUploadBack, docType: identityDocType, fileId: '1_BS' },
    ] : []),
    ...(CURRENT_FORM_CONTEXT?.addressDocUploadFlag ? [
      { docValue: uploadAddressProof?.addressProofFile, docType: addressDocType, fileId: '1_AD' },
    ] : []),
  ];

  try {
    displayLoader();

    const payloads = await Promise.all(
      documents.map((doc) => createDocPayload(doc, mobileNumber)),
    );
    if (payloads.some((payload) => !payload)) throw new Error('Error in File');

    const responses = await chainedFetchAsyncCall(apiEndPoint, method, payloads, 'formData');

    if (responses.every((response) => response.value?.errorCode === '0000')) {
      return invokeJourneyDropOffUpdate('DOCUMENT_UPLOAD_SUCCESS', mobileNumber, leadProfileId, journeyId, globals);
    }
    throw new Error('File upload failed');
  } catch (error) {
    console.error(error);
    throw new Error('File upload failed');
  } finally {
    hideLoaderGif();
  }
};

/**
 * fileUploadUIHandler
 * @param {object} globals - The global object containing necessary globals form data
 */
const fileUploadUIHandler = () => {
  const fileInputs = document.querySelectorAll('input[type="file"]');

  fileInputs.forEach((fileInput) => {
    // Check if the current file input has a file selected
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const parentDiv = fileInput.closest('.field-addressprooffile');
      const fileList = parentDiv.querySelector('.files-list');
      const uploadButton = parentDiv.querySelector('.file-attachButton');

      const validFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];

      if (validFileTypes.includes(file.type)) {
        parentDiv.classList.add('file-uploaded');
        parentDiv.classList.remove('file-error');

        if (fileList) {
          fileList.textContent = file.name;
        }

        if (uploadButton) {
          uploadButton.textContent = 'Re-upload';
        }
      } else {
        parentDiv.classList.add('file-error');
        parentDiv.classList.remove('file-uploaded');

        if (uploadButton) {
          uploadButton.textContent = 'Upload';
        }
      }
    }
  });
};

const docUploadBiometricHandler = (globals) => {
  const { vkycConfirmationPanel } = globals.form.resultPanel.successResultPanel;
  globals.functions.setProperty(vkycConfirmationPanel, { visible: false });
  creditCardSummary(globals);
  finalPagePanelVisibility('success', CURRENT_FORM_CONTEXT.executeInterfaceResponse.APS_APPL_REF_NUM, globals);
};

export {
  fileUploadUIHandler,
  docUploadClickHandler,
  docUploadBiometricHandler,
};
