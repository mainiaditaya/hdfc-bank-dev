/* eslint-disable */

function displayMobileNumber(){
  // only numeric 10 digits
  // will be already prefilled from some source . To get more details about this 
  // will be shown with prefix +91 and * value for first 5 numeric values
}

function maskMobileNumber() {

}


function validateDob(){

}

function validationPan(){
  // PAN logic for alphanumeric character with defined sequence of characters
}




function resendOTP(){
  // triggers OTP Generate call,
}


function checkOffer(firstName,middleName,lastName){

  // triggers Offer check API 
}
function getAddressDetails(){
  // based of the offer response and product codes recieved, 
  // renders the specific card and card features
}

function getThisCard(){
  // Triggers card acquisition API 
}

function getJoiningFee(){
  // Triggers joining fee API 
}

/**
* pre-fills form
*/
function prefillForm(){
  // Triggers form Prefill. 
}



/**
* test pan
*
* @param {object} arg1 - arg1 from data.
*/
function testPAN(arg1, arg2, arg3) {
}


function decoratePwdField(){

}

/**
* generates the otp
* @param {object} mobileNumber
* @param {object} pan
* @param {object} dob
* @return {PROMISE}
*/
function getOTP(mobileNumber, pan, dob){
}

/**
* Returns form context.
* @returns {PROMISE}
*/
function getFormContext(){
}

/**
* panAPISuccesHandler 
* @param {*} panStatus
* @returns {PROMISE}
*/
function panAPISuccesHandler(panStatus) {
}


/**
* generates the journeyId
*
* @param {string} visitMode - The visit mode (e.g., "online", "offline").
* @param {string} journeyAbbreviation - The abbreviation for the journey.
* @param {string} channel - The channel through which the journey is initiated.
* @param {object} globals
*/
function createJourneyId(visitMode, journeyAbbreviation, channel) {
}


function pinCodeMaster(){
}

function currentAddressToggleHandler(){
}

/**
* openModal
* @param {object} arg1 - arg1 from data.
*/
function openModal(arg1){
}
/**
* closeModal
* @param {object} arg1 - arg1 from data.
*/
function closeModal(arg1){
}



/**
* @name setPageDetails
* @param {string} pageName - pageName is the step-screen where user CTA happened
*/
function setPageDetails(pageName) {
}


/**
* @name journeyResponseHandler
* @param {string} payload.
*/
function journeyResponseHandler(payload){
}

function idcomRedirection(){
}

function finalDap(){
}

/**
* @name aadharInit aadhar init call
* @param {object} mobileNumber
* @param {object} pan
* @param {object} dob
* @param {object} globals - The global object containing necessary globals form data.
* @return {PROMISE}
*/
function aadharInit(mobileNumber, pan, dob){
}


/**
* @name moveWizardView - Moves the corporate card wizard view from one step to the next step.
* @param {object} source - The name attribute of the source element (parent wizard panel).
* @param {object} target - The name attribute of the destination element.
* @param {object} globals - The name attribute of the destination element.
*/
function moveWizardView(source, target, gloabls){
}




/**
* Returns the next action based on user KYC Selection
* @param {String} arg1
* @param {String} arg2
* @param {String} arg3
* @return {PROMISE}
*/
function kycNextAction(arg1, arg2, arg3) {
}




/**
* Returns the next action based on user KYC Selection
* @return {PROMISE}
*/
function checkMode(){
}


/**
* Returns the next action based on user KYC Selection
* @return {PROMISE}
*/
function intialState(){

}



/**
* invokes the journey update call
* @param {string} state
* @param {string} mobileNumber
* @return {PROMISE}
*/
function crmJourneyStateOnLoad(mobileNumber){
}


/**
* validates the otp
* @param {object} mobileNumber
* @param {object} pan
* @param {object} dob
* @param {object} otpNumber
* @return {PROMISE}
*/
function otpValidation(mobileNumber, pan, dob, otpNumber) {

}

/**
* @name otpValHandler
* @param {string} res
*/
function otpValHandler(res) {
}


/**
* does the custom show hide of panel or screens .
* @param {string} errorMessage
* @param {number} numRetries
*/
function customSetFocus(errorMessage, numRetries){
}

/**
* validates the emailid
* @param {string} emailId
* @return {PROMISE}
*/
function validateEmailID(emailId) {
}


/**
* @name ipaRequestApi
* @param {string} eRefNumber
* @param {string} mobileNumber
* @param {string} applicationRefNumber
* @param {string} idTokenJwt
* @param {string} ipaDuration
* @param {string} ipaTimer
* @param {boolean} showLoader
* @param {boolean} hideLoader
* @return {PROMISE}
*/
function ipaRequestApi(eRefNumber, mobileNumber, applicationRefNumber, idTokenJwt, ipaDuration, ipaTimer,showLoader, hideLoader ){
}

/**
* validatePan - creates PAN validation request and executes API.
* @param {string} mobileNumber 
* @param {string} panNumber 
* @param {object} dob 
* @param {string} firstName 
* @param {boolean} showLoader
* @param {boolean} hideLoader
* @return {PROMISE} - pan validation response
*/
function validatePan(mobileNumber, panNumber, dob, firstName,showLoader, hideLoader){
}

/**
* @name executeInterfaceApi
* @param {boolean} showLoader
* @param {boolean} hideLoader
* @param {object} globals
* @return {PROMISE}
*/
function executeInterfaceApi(showLoader, hideLoader, globals){
}


/**
* Hides the loader.
* @return {PROMISE}
*/
function hideLoader() {
}


/**
* @name invokeJourneyDropOffByParam
* @param {string} mobileNumber
* @param {string} leadProfileId
* @param {string} journeyId
* @return {PROMISE}
*/
function invokeJourneyDropOffByParam(mobileNumber, leadProfileId, journeyId){
}

/**
 * @name invokeJourneyDropOffUpdate
 * @param {string} state
 * @param {string} mobileNumber
 * @param {string} leadProfileId
 * @param {string} journeyId
 * @param {Object} globals - globals variables object containing form configurations.
 * @return {PROMISE}
 */
function invokeJourneyDropOffUpdate(state, mobileNumber, leadProfileId, journeyId){
}

/**
 * @name invokeJourneyDropOff
 * @param {string} state
 * @param {string} mobileNumber
 * @return {PROMISE}
 */
function invokeJourneyDropOff(state, mobileNumber){
}


/**
* sendAnalytics
* @param {string} payload
*/
function sendAnalytics(payload){
}

/**
 * @name invokeRestAPIWithDataSecurity
 */
function initRestAPIDataSecurityServiceES6() {
}
