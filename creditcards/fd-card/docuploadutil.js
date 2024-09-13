/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import { invokeJourneyDropOffUpdate } from './common-journeyutil.js';
import {
  displayLoader,
  hideLoaderGif,
  chainedFetchAsyncCall,
} from '../../common/makeRestAPI.js';
import { urlPath, generateUUID, moveWizardView } from '../../common/formutils.js';
import { ENDPOINTS, CURRENT_FORM_CONTEXT } from '../../common/constants.js';
import idcomm from './idcomutil.js';
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
    CURRENT_FORM_CONTEXT.executeInterfaceResponse = {
      applicationRefNumber: '24I12D00449470W1',
    };
    CURRENT_FORM_CONTEXT.eRefNumber = 'AD20240912112637';
    const {
      journeyName,
      journeyID,
      eRefNumber,
      executeInterfaceResponse: { applicationRefNumber },
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
 * docUploadClickHandler
 * @param {object} globals - The global object containing necessary globals form data
 */
const docUploadClickHandler = async (globals) => {
  idcomm(globals);
  // const {
  //   docUploadPanel,
  //   uploadAddressProof,
  // } = globals.form.docUploadFlow;
  // const identityDocType = docUploadPanel.docUploadDropdown.$value;
  // const addressDocType = uploadAddressProof.docTypeDropdown.$value;
  // const mobileNumber = globals.form.loginMainPanel.loginPanel.mobilePanel.registeredMobileNumber.$value;
  // const formContextCallbackData = globals.functions.exportData()?.CURRENT_FORM_CONTEXT || CURRENT_FORM_CONTEXT;
  // const leadProfileId = globals.functions.exportData().leadProifileId || globals.form.runtime.leadProifileId.$value || '';
  // const journeyId = formContextCallbackData.journeyID;
  // const apiEndPoint = urlPath(ENDPOINTS.docUpload);
  // const method = 'POST';

  // const documents = [
  //   ...(CURRENT_FORM_CONTEXT?.identityDocUploadFlag ? [
  //     { docValue: docUploadPanel?.DocUploadFront, docType: identityDocType, fileId: '1_FS' },
  //     { docValue: docUploadPanel?.DocUploadBack, docType: identityDocType, fileId: '1_BS' },
  //   ] : []),
  //   ...(CURRENT_FORM_CONTEXT?.addressDocUploadFlag ? [
  //     { docValue: uploadAddressProof?.addressProofFile, docType: addressDocType, fileId: '1_AD' },
  //   ] : []),
  // ];

  // try {
  //   displayLoader();

  //   const payloads = await Promise.all(
  //     documents.map((doc) => createDocPayload(doc, mobileNumber)),
  //   );
  //   if (payloads.some((payload) => !payload)) throw new Error('Error in File');

  //   const responses = await chainedFetchAsyncCall(apiEndPoint, method, payloads, 'formData');

  //   if (responses.every((response) => response.value?.errorCode === '0000')) {
  //     // return invokeJourneyDropOffUpdate('DOCUMENT_UPLOAD_SUCCESS', mobileNumber, leadProfileId, journeyId, globals);
  //     const response = await invokeJourneyDropOffUpdate('DOCUMENT_UPLOAD_SUCCESS', mobileNumber, leadProfileId, journeyId, globals);
  //     idcomm(globals);
  //     // console.log(dropOffUpdateResponse);
  //   }
  //   throw new Error('File upload failed');
  // } catch (error) {
  //   console.error(error);
  // } finally {
  //   hideLoaderGif();
  // }
};

/**
 * fileUploadUIHandler
 * @param {object} globals - The global object containing necessary globals form data
 */
const fileUploadUIHandler = () => {
  const fileInputs = document.querySelectorAll('input[type="file"]');

  fileInputs.forEach((fileInput) => {
    if (fileInput.files.length > 0) {
      const parentDiv = fileInput.closest('.file-wrapper');
      parentDiv.classList.add('file-uploaded');
      const fileList = parentDiv.querySelector('.files-list');
      if (fileList) {
        fileList.textContent = fileInput.files[0].name;
      }
      const uploadButton = parentDiv.querySelector('.file-attachButton');
      if (uploadButton) {
        uploadButton.textContent = 'Re-Upload';
      }
    }
  });
};

export {
  fileUploadUIHandler,
  docUploadClickHandler,
};
