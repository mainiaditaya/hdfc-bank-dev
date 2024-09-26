/**
 * Displays a loader with optional loading text.
 * @param {string} loadingText - The loading text to display (optional).
 */

function displayLoader(loadingText) {
  const bodyContainer = document.querySelector('.appear');
  bodyContainer.classList.add('preloader');
  if (loadingText) {
    bodyContainer.setAttribute('loader-text', loadingText);
  }
}

/**
 * Hides the loader.
 */
function hideLoaderGif() {
  const bodyContainer = document.querySelector('.appear');
  bodyContainer.classList.remove('preloader');
  if (bodyContainer.hasAttribute('loader-text')) {
    bodyContainer.removeAttribute('loader-text');
  }
}

/**
* Initiates an http call with JSON payload to the specified URL using the specified method.
*
* @param {string} url - The URL to which the request is sent.
* @param {string} [method='POST'] - The HTTP method to use for the request (default is 'POST').
* @param {object} payload - The data payload to send with the request.
* @returns {*} - The JSON response from the server.
*/
function fetchJsonResponse(url, payload, method, loader = false) {
  // apiCall-fetch
  return fetch(url, {
    method,
    body: payload ? JSON.stringify(payload) : null,
    mode: 'cors',
    headers: {
      'Content-type': 'text/plain',
      Accept: 'application/json',
    },
  })
    .then((res) => {
      if (loader) hideLoaderGif();
      return res.json();
    });
}

/**
* Initiates an http call with JSON payload to the specified URL using the specified method.
*
* @param {string} url - The URL to which the request is sent.
* @param {string} [method='POST'] - The HTTP method to use for the request (default is 'POST').
* @param {object} payload - The data payload to send with the request.
* @returns {*} - The JSON response from the server.
*/
// eslint-disable-next-line no-unused-vars
function fetchIPAResponse(url, payload, method, ipaDuration, ipaTimer, loader = false, startTime = Date.now()) {
  return fetch(url, {
    method,
    body: payload ? JSON.stringify(payload) : null,
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain',
      Accept: 'application/json',
    },
  })
    .then((res) => res.json())
    .then((response) => {
      const ipaResult = response?.ipa?.ipaResult;
      if (ipaResult && ipaResult !== '' && ipaResult !== 'null' && ipaResult !== 'undefined') {
        if (loader) hideLoaderGif();
        return response;
      }
      return response;
    });
}

/**
 * Initiates an http call with JSON payload to the specified URL using the specified method.
 *
 * @param {string} url - The URL to which the request is sent.
 * @param {string} [method='POST'] - The HTTP method to use for the request (default is 'POST').
 * @param {object} payload - The data payload to send with the request.
 * @returns {*} - The JSON response from the server.
 */
function getJsonResponse(url, payload, method = 'POST') {
  // apiCall-fetch
  return fetch(url, {
    method,
    body: payload ? JSON.stringify(payload) : null,
    mode: 'cors',
    headers: {
      'Content-type': 'text/plain',
      Accept: 'application/json',
    },
  })
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });
}

/**
 * Makes a REST API call with the provided parameters.
 *
 * @param {object} globals - The global object containing necessary globals form data.
 * @param {string} method - The HTTP method to use for the request (e.g., 'GET', 'POST').
 * @param {object} payload - The data payload to send with the request.
 * @param {string} path - The endpoint or path for the API call.
 * @param {string} loadingText - The loading text during the API call.
 * @callback successCallback - The callback function to handle after successful API response.
 * @callback errorCallback - The callback function to handle after errors during the API call.
 */
function restAPICall(globals, method, payload, path, successCallback, errorCallback, loadingText) {
  if (loadingText) displayLoader(loadingText);
  getJsonResponse(path, payload, method)
    .then((res) => {
      if (res) {
        if (loadingText) hideLoaderGif();
        successCallback(res, globals);
      }
    })
    .catch((err) => {
      // errorMethod
      if (loadingText) hideLoaderGif();
      errorCallback(err, globals);
    });
}

/**
 * Executes a series of chained asynchronous fetch requests.
 *
 * @param {string} apiUrl - The URL endpoint for the API.
 * @param {string} method - The HTTP method for the requests (e.g., 'POST', 'PUT').
 * @param {Array<any>} payloadArray - Array of payloads to send in the requests.
 * @param {string} payloadType - Type of payload, accepts'formData' to send as FormData (without stringify) or 'json'(with stringify).
 * @returns {Promise<Array<{ status: 'fulfilled' | 'rejected', value?: any, reason?: any }>>}
 * A promise that resolves to an array of promise settlement records.
 */
const chainedFetchAsyncCall = async (apiUrl, method, payloadArray, payloadType) => {
  const promises = payloadArray?.map(async (dataLoad) => {
    const jsonContentType = {
      mode: 'cors',
      headers: {
        'Content-type': 'text/plain', // Adjusted content-type based on payloadType,
        Accept: 'application/json',
      },
    };
    const typeFormData = (payloadType === 'formData');
    const formDataContentType = {
      method,
      body: typeFormData ? dataLoad : JSON.stringify(dataLoad),
    };
    const contentType = typeFormData ? formDataContentType : ({ ...formDataContentType, ...jsonContentType });
    try {
      const response = await fetch(apiUrl, contentType);
      const data = await response.json();
      return data;
    } catch (error) {
      return error;
    }
  });
  const fileResponses = await Promise.allSettled(promises);
  return fileResponses;
};

const fetchRecursiveResponse = async (
  source,
  url,
  payload,
  method,
  duration,
  timer,
  fieldName,
  loader = false,
  startTime = Date.now(),
) => {
  const getFieldValue = (obj, fieldArray) => fieldArray.reduce((acc, curr) => (acc && acc[curr] !== undefined ? acc[curr] : undefined), obj);

  try {
    const res = await fetch(url, {
      method,
      body: payload ? JSON.stringify(payload) : null,
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain',
        Accept: 'application/json',
      },
    });
    const response = await res.json();
    const fieldValue = getFieldValue(response, fieldName);
    switch (source) {
      case 'ipa':
        if ((fieldValue && fieldValue !== '' && fieldValue !== 'null' && fieldValue !== 'undefined' && fieldValue?.length !== 0)) {
          if (loader) hideLoaderGif();
          return response;
        }
        break;
      case 'customerId':
        if (fieldValue === 'SUCCESS' || fieldValue === 'FAILURE') {
          if (loader) hideLoaderGif();
          return response;
        }
        break;
      default:
    }

    const elapsedTime = (Date.now() - startTime) / 1000;
    if (elapsedTime >= duration) {
      if (loader) hideLoaderGif();
      return response;
    }

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, timer * 1000);
    });

    return await fetchRecursiveResponse(source, url, payload, method, duration, timer, fieldName, loader, startTime);
  } catch (error) {
    if (loader) hideLoaderGif();
    console.error('Error fetching data:', error);
    throw error;
  }
};

export {
  restAPICall,
  getJsonResponse,
  displayLoader,
  hideLoaderGif,
  fetchJsonResponse,
  fetchIPAResponse,
  chainedFetchAsyncCall,
  fetchRecursiveResponse,
};
