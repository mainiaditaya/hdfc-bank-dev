const data = {
  'otp click': {
    linkType: 'button',
    StepName: 'Identify Yourself',
    linkPosition: 'Form',
  },
  'submit otp': {
    error: '',
    linkPosition: 'Form',
  },
  'select fd': {
    linkType: 'button',
    linkName: 'Select FD',
    linkPosition: 'Form',
  },
  'review details': {
    linkType: 'button',
    linkName: 'Review Details',
    linkPosition: 'Form',
  },
  'review details back': {
    linkType: 'button',
    linkName: 'Review Details',
    linkPosition: 'Form',
  },
  'select card': {
    linkType: 'button',
    linkName: 'Select Card',
    linkPosition: 'Form',
  },
  'select card consent': {
    linkType: 'button',
    linkName: 'Select Card Consent',
    linkPosition: 'Form',
  },
  'validation method kyc': {
    linkType: 'button',
    linkName: 'Validation Method KYC',
    linkPosition: 'Form',
  },
  'aadhaar kyc language popup': {
    linkType: 'button',
    linkName: 'Aadhaar KYC Language Popup',
    linkPosition: 'Form',
  },
  'documents upload': {
    linkType: 'button',
    linkName: 'Documents Upload',
    linkPosition: 'Form',
  },
  'documents upload upload': {
    linkType: 'button',
    linkName: 'Documents Upload',
    linkPosition: 'Form',
  },
  'confirmation page': {
    linkType: 'button',
    linkName: 'Confirmation Page',
    linkPosition: 'Form',
  },
  'check offers': {
    linkType: 'button',
    linkName: 'Check Offers',
    linkPosition: 'Form',
  },
  'get this card': {
    linkType: 'button',
    linkName: 'Get this Card',
    linkPosition: 'Form',
  },
  'i agree': {
    linkType: 'button',
    linkName: 'I agree',
    linkPosition: 'Form',
  },
  'document upload continue': {
    linkType: 'button',
    linkName: 'I agree',
    linkPosition: 'Form',
  },
  'address continue': {
    linkType: 'button',
    linkName: 'Submit',
    linkPosition: 'Form',
  },
  'kyc continue': {
    linkType: 'button',
    linkName: 'Continue KYC',
    linkPosition: 'Form',
  },
  // 'aadhaar otp': {
  //   linkType: '',
  //   linkName: '',
  // },
  'start kyc': {
    linkType: 'button',
    linkName: 'Start KYC',
    linkPosition: 'Form',
  },
  'submit review': {
    linkType: 'button',
    linkName: 'Submit Feedback',
    linkPosition: 'Form',
  },
};
const ANALYTICS_CLICK_OBJECT = {
  page: {
    pageInfo: {
      pageName: '',
      errorCode: '',
      errorMessage: '',
    },
  },
  user: {
    pseudoID: '',
    journeyID: '',
    journeyName: '',
    journeyState: '',
    casa: '',
    gender: '',
    email: '',
  },
  form: {
    name: '',
  },
  link: {
    linkName: '',
    linkType: '',
    linkPosition: '',
  },
  event: {
    phone: '',
    validationMethod: '',
    status: '',
    rating: '',
  },
  formDetails: {
    employmentType: '',
    companyName: '',
    designation: '',
    relationshipNumber: '',
    pincode: '',
    city: '',
    state: '',
    KYCVerificationMethod: '',
    languageSelected: '',
    reference: '',
    isVideoKYC: '',
    documentProof: '',
    nomineeRelation: '',
  },
  card: {
    selectedCard: '',
    eligibleCard: '',
    annualFee: '',
  },
};

const ANALYTICS_PAGE_LOAD_OBJECT = {
  page: {
    pageInfo: {
      pageName: '',
      errorCode: '',
      errorMessage: '',
    },
  },
  card: {
    selectedCard: '',
    eligibleCard: '',
  },
  user: {
    pseudoID: '',
    journeyID: '',
    journeyName: '',
    journeyState: '',
    casa: '',
  },
  form: {
    name: '',
  },
};

const PAGE_NAME = {
  ccc: {
    'otp click': 'Identify Yourself',
    'confirm otp': 'Verify with OTP',
    'check offers': 'Customer Details',
    'get this card': 'Choose Card',
    'kyc continue': 'Select KYC',
    'i agree': 'Select KYC - Aadhaar Pop-Up',
    'document upload continue': 'Document Upload',
    'address continue': 'Address Details',
    'aadhaar otp': 'Select KYC - Aadhaar OTP verification',
    'start kyc': 'Confirmation',
    'submit review': 'Confirmation',
    'thank you screen': 'Confirmation',
  },
  fd: {
    getOtp: 'Step 1 - Identify Yourself',
    submitOtp: 'Step 2 - Verify with OTP',
    selectCustomerId: 'Select Customer ID',
    selectFd: 'Step 3 - Select FD',
    reviewDetailsBack: 'Step 4 - Confirm your details',
    reviewDetails: 'Step 4 - Confirm your details',
    selectCard: 'Step 5 - Choose Card',
    selectCardConsent: 'Step 5 - Choose Card',
    validationMethodKYC: 'Step 6 - Validation Method - KYC Details',
    aadhaarKYCLangPopup: 'Aadhaar KYC Language Popup',
    docUpload: 'Step 6 – Validation Method – Document Upload',
    docUploadUpload: 'Step 6 – Validation Method – Document Upload',
    confirmationPage: 'Confirmation',
  },
};
export {
  data,
  ANALYTICS_CLICK_OBJECT,
  ANALYTICS_PAGE_LOAD_OBJECT,
  PAGE_NAME,
};
