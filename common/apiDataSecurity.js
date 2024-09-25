/* eslint-disable no-console */
// eslint-disable-next-line no-use-before-define

const restAPIDataSecurityServiceContext = {
  SEC_KEY_HEADER: 'X-ENCKEY',
  SEC_SECRET_HEADER: 'X-ENCSECRET',
  crypto,
  supportsES6: (typeof window !== 'undefined') ? (!window.msCrypto) : false,
  symmetricAlgo: 'AES-GCM',
  symmetricKeyLength: 256,
  secretLength: 12, // IV length
  secretTagLength: 128, // GCM tag length
  aSymmetricAlgo: 'RSA-OAEP',
  digestAlgo: 'SHA-256',
  initStatus: false,
  symmetricKey: null,
  encSymmetricKey: null,
  aSymmetricPublicKey: null,
};

/*
       * Convert a string into an array buffer
       */
function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  // eslint-disable-next-line no-plusplus
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
/*
       * convert array buffer to string
       */
function arrayBufferToString(str) {
  const byteArray = new Uint8Array(str);
  let byteString = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i]);
  }
  return byteString;
}

/**
       * Prepares the request headers
       */
function getDataEncRequestHeaders(encDataPack) {
  const requestHeaders = {};
  requestHeaders[restAPIDataSecurityServiceContext.SEC_KEY_HEADER] = encDataPack.keyEnc;
  requestHeaders[restAPIDataSecurityServiceContext.SEC_SECRET_HEADER] = encDataPack.secretEnc;
  return requestHeaders;
}

/**
     * Encrypts data
     */
async function encryptDataES6(data) {
  const dataStr = JSON.stringify(data);
  const secret = restAPIDataSecurityServiceContext.crypto.getRandomValues(new Uint8Array(restAPIDataSecurityServiceContext.secretLength));
  const dataBuf = stringToArrayBuffer(dataStr);

  const dataEncBuf = await restAPIDataSecurityServiceContext.crypto.subtle.encrypt({
    name: restAPIDataSecurityServiceContext.symmetricAlgo,
    iv: secret,
    tagLength: restAPIDataSecurityServiceContext.secretTagLength,
  }, restAPIDataSecurityServiceContext.symmetricKey, dataBuf);

  const dataEnc = btoa(arrayBufferToString(dataEncBuf));

  const encSecretBuf = await restAPIDataSecurityServiceContext.crypto.subtle.encrypt({
    name: restAPIDataSecurityServiceContext.aSymmetricAlgo,
    hash: {
      name: restAPIDataSecurityServiceContext.digestAlgo,
    },
  }, restAPIDataSecurityServiceContext.aSymmetricPublicKey, secret);

  const encSecret = btoa(arrayBufferToString(encSecretBuf));

  return {
    dataEnc,
    secret,
    secretEnc: encSecret,
    keyEnc: restAPIDataSecurityServiceContext.encSymmetricKey,
    requestHeader: getDataEncRequestHeaders(restAPIDataSecurityServiceContext.encSymmetricKey, encSecret),
  };
}

/**
 * Initialization in browsers where ES6 is supported
 * @param {object} globals - globals form object
 */
async function initRestAPIDataSecurityServiceES6() {
  // eslint-disable-next-line max-len
  const publicKeyPemContent = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAocLO0ZabqWBbhb/cpaHTZf53LfEymcRMuAHRpUh3yhwPROgY2u3FTEsFJSKdQAbA4205njlXq3A1ICCd1ZrEQBA7Vc60eL0suO/0Qu5U/8vtYNCPsvMX+Pd7cUcMMM6JmLxacvlThOwAxc0ChSrFhlGRHQFZbg44y0Xy0B2bvxOnEjSAtV7kLjht/EKkiPXc3wptsLEMu2qK34Djucp5AllsbxJdWFogHTcJ1vizxAge9KwxA/2GSKYr5c9Wt8EAn7kqC0t43vnhtZuhgShJEbeV7VgF2GXGQBCxbbDravhltrGI+YKnAEd/RK0P0SJx+BXR7TcEv7zDg1QgXqfTewIDAQAB';
  // const publicKeyPemContent = globals.functions.exportData().data.dataSecurityPublicKey;
  // Base64 decode
  const binaryDerString = atob(publicKeyPemContent);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = stringToArrayBuffer(binaryDerString);
  // Import asymmetric public key
  restAPIDataSecurityServiceContext.crypto.subtle.importKey('spki', binaryDer, {
    name: restAPIDataSecurityServiceContext.aSymmetricAlgo,
    hash: restAPIDataSecurityServiceContext.digestAlgo,
  }, true, ['encrypt']).then((publicKey) => {
    restAPIDataSecurityServiceContext.aSymmetricPublicKey = publicKey;
    // Creates the symmteric key
    restAPIDataSecurityServiceContext.crypto.subtle.generateKey({
      name: restAPIDataSecurityServiceContext.symmetricAlgo,
      length: restAPIDataSecurityServiceContext.symmetricKeyLength,
    }, true, ['encrypt', 'decrypt']).then((symKey) => {
      restAPIDataSecurityServiceContext.symmetricKey = symKey;
      // Export the symmetric key for further use
      restAPIDataSecurityServiceContext.crypto.subtle.exportKey('raw', restAPIDataSecurityServiceContext.symmetricKey).then((symKeyData) => {
        const symmetricKeyData = symKeyData;
        // Encrypting the symmetric key with assymetric key
        restAPIDataSecurityServiceContext.crypto.subtle.encrypt({
          name: restAPIDataSecurityServiceContext.aSymmetricAlgo,
          hash: {
            name: restAPIDataSecurityServiceContext.digestAlgo,
          },
        }, restAPIDataSecurityServiceContext.aSymmetricPublicKey, symmetricKeyData).then((encSymmetricKeyBuf) => {
          restAPIDataSecurityServiceContext.encSymmetricKey = btoa(arrayBufferToString(encSymmetricKeyBuf));
          // Mark the initialization status
          restAPIDataSecurityServiceContext.initStatus = true;
        }); // Encrypt symmetric key with asymmetric public key
      }); // Export symmetric key
    }); // Generate symmetric key
  }); // Import asymmetric public key
  return Promise.resolve(true);
}

/**
       * @name invokeRestAPIWithDataSecurity
       */
async function invokeRestAPIWithDataSecurity(data) {
  try {
    const response = await encryptDataES6(data);
    return response;
  } catch (error) {
    console.error('Error in invoking REST API with data security:', error);
    throw error;
  }
}

async function decryptDataES6(encData, secret) {
  try {
    const encDataBuf = stringToArrayBuffer(atob(encData));
    const dataEncBuf = await restAPIDataSecurityServiceContext.crypto.subtle.decrypt({
      name: restAPIDataSecurityServiceContext.symmetricAlgo,
      iv: secret,
      tagLength: restAPIDataSecurityServiceContext.secretTagLength,
    }, restAPIDataSecurityServiceContext.symmetricKey, encDataBuf);
    const decData = arrayBufferToString(dataEncBuf);
    return decData;
  } catch (error) {
    console.error(error);
    return null; // Ensure the function always returns a value
  }
}
// initRestAPIDataSecurityServiceES6();
export {
  getDataEncRequestHeaders,
  invokeRestAPIWithDataSecurity,
  initRestAPIDataSecurityServiceES6,
  decryptDataES6,
};
