export const fileAttachmentText = 'Upload';
export const dragDropText = 'Drag and Drop To Upload';

export const defaultErrorMessages = {
  accept: 'The specified file type not supported.',
  maxFileSize: 'File too large. Reduce size and try again.',
  maxItems: 'Specify a number of items equal to or less than $0.',
  minItems: 'Specify a number of items equal to or greater than $0.',
  pattern: 'Specify the value in allowed format : $0.',
  minLength: 'Please lengthen this text to $0 characters or more.',
  maxLength: 'Please shorten this text to $0 characters or less.',
  maximum: 'Value must be less than or equal to $0.',
  minimum: 'Value must be greater than or equal to $0.',
  required: 'Please fill in this field.',
};

let submitBaseUrl = 'https://applyonlinedev.hdfcbank.com';

export function setSubmitBaseUrl(url) {
  submitBaseUrl = url;
}

// eslint-disable-next-line no-useless-escape
export const emailPattern = '([A-Za-z0-9][._]?)+[A-Za-z0-9]@[A-Za-z0-9]+(\.?[A-Za-z0-9]){2}\.([A-Za-z0-9]{2,4})?';

export function getSubmitBaseUrl() {
  return submitBaseUrl;
}

export const formIdPathMapping = {
  '/content/forms/af/hdfc_haf/cards/corporatecreditcard/uat/hdfc': '../../../creditcards/corporate-creditcard/cc-functions.js', // cc
  '/content/forms/af/hdfc_haf/cards/fdlien/forms/fdlien-dev': '../../../creditcards/fd-card/fd-functions.js', // fd
  '/content/forms/af/hdfc_haf/cards/fdlien/forms/copy/fdlien-dev02sep': '../../../creditcards/fd-card/fd-functions.js', // fd
};
