export const fileAttachmentText = 'Upload';
export const dragDropText = 'Drag and Drop To Upload';

export const defaultErrorMessages = {
  accept: 'The specified file type not supported.',
  maxFileSize: 'File too large. Reduce size and try again.',
  maxItems: 'Specify a number of items equal to or less than $0.',
  minItems: 'Specify a number of items equal to or greater than $0.',
};

let submitBaseUrl = 'https://hdfc-dev-04.adobecqms.net';

export function setSubmitBaseUrl(url) {
  submitBaseUrl = url;
}

export function getSubmitBaseUrl() {
  return submitBaseUrl;
}

export const formIdPathMapping = {
  '/content/forms/af/hdfc_haf/cards/corporatecreditcard/uat/hdfc': '../../../creditcards/corporate-creditcard/cc-functions.js', // cc
  // '/content/forms/af/hdfc_haf/cards/fdlien/forms/fdlien-dev': '../../../common/functions.js', // fd
};
