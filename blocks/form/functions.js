export const formIdPathMapping = {
  '/content/forms/af/hdfc_haf/digital/corporate-credit-cards-application-form': '../../../creditcards/corporate-creditcard/cc-functions.js',
  // cc
  // '/content/forms/af/hdfc_haf/cards/fdlien/forms/fdlien-dev': '../../../common/functions.js', // fd
  '/content/forms/af/hdfc_haf/liabilities/nre-nro/forms/account-opening-nre-nro': '../../../liabilities/nre-Nro/nre-nro.js', // nre-Nro
  '/content/forms/af/hdfc_haf/liabilities/nre-nro/forms/account-opening-nre-nro-idcomm':'../../../liabilities/nre-Nro/nre-nro.js',
  '/content/forms/af/hdfc_haf/liabilities/nre-nro/forms/account-opening-nre-nro2': '../../../liabilities/nre-Nro/nre-nro.js', // nre-Nro
};


export default function getCustomFunctionPath(id) {
  return id ? formIdPathMapping[atob(id)] : null;
}
