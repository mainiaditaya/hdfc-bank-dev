export const formIdPathMapping = {
  '/content/forms/af/hdfc_haf/digital/corporate-credit-cards-application-form': '../../../creditcards/corporate-creditcard/cc-functions.js',
  // cc
  // '/content/forms/af/hdfc_haf/cards/fdlien/forms/fdlien-dev': '../../../common/functions.js', // fd
};


export default function getCustomFunctionPath(id) {
  return id ? formIdPathMapping[atob(id)] : null;
}
