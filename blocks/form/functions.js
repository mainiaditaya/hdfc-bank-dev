export const formIdPathMapping = {
  '/content/forms/af/hdfc_haf/cards/corporatecreditcard/uat/hdfc': '../../../creditcards/corporate-creditcard/cc-functions.js', 
  '/digital/hdfc_haf/cards/corporatecreditcard/uat/hdfc': '../../../creditcards/corporate-creditcard/cc-functions.js', 
  // cc
  // '/content/forms/af/hdfc_haf/cards/fdlien/forms/fdlien-dev': '../../../common/functions.js', // fd
};


export default function getCustomFunctionPath(id) {
  return id ? formIdPathMapping[atob(id)] : null;
}
