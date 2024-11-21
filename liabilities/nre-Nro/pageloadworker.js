const thanks = document?.querySelector('[name="thankYouPanel"]');

function setBodyPage(thanks) {
  if (thanks) {
    if (window && document) {
      thanks = document.querySelector('[name="thankYouPanel"]');
      const errorPanel = document.querySelector('[name="itsNotYouPanel"]');
      const errorConnectionPanel = document.querySelector('[name="errorConnection"]');
      if (!thanks?.dataset?.visible) {
        document.body.classList.add('nreThankYouPage');
        document.body.classList.remove('errorPageBody');
      }
      if (!errorPanel?.dataset?.visible) {
        document.body.classList.remove('nreThankYouPage');
        document.body.classList.add('errorPageBody');
      }
      if (!errorConnectionPanel?.dataset?.visible) {
        document.body.classList.remove('nreThankYouPage');
        document.body.classList.add('errorPageBody');
      }

      // document.body.classList.add('preloader');
      const mutationCallback = (mutationsList) => {
        for (const mutation of mutationsList) {
          const dataVisibileValue = mutation.target.getAttribute('data-visible');
          const currTarget = mutation.target.name;
          if (!dataVisibileValue) {
            document.body.classList.remove('preloader');
            switch (currTarget) {
              case 'thankYouPanel':
                document.body.classList.add('nreThankYouPage');
                document.body.classList.remove('errorPageBody');
                break;
              case 'itsNotYouPanel':
                document.body.classList.add('errorPageBody');
                document.body.classList.remove('nreThankYouPage');
                break;
              case 'errorConnection':
                document.body.classList.add('errorPageBody');
                document.body.classList.remove('nreThankYouPage');
                break;
              default:
                break;
            }
          }
        }
      };
      const observer = new MutationObserver(mutationCallback);
      if (thanks) {
        observer.observe(thanks, { attributes: true });
      }
      if (errorPanel) {
        observer.observe(errorPanel, { attributes: true });
      }
      if (errorConnectionPanel) {
        observer.observe(errorConnectionPanel, { attributes: true });
      }
    }
  } else {
    setTimeout(() => {
      if (window && document) {
        thanks = document.querySelector('[name="thankYouPanel"]');
        setBodyPage(thanks);
      }
    }, 500);
  }
}

function removeIDCOMQueryParameter() {
  const url = new URL(window.location.href);
  url.searchParams.delete('success');
  url.searchParams.delete('authcode');
  url.searchParams.delete('journeyId');
  url.searchParams.delete('authmode');
  url.searchParams.delete('errorCode');
  url.searchParams.delete('errorMessage');
  window.history.pushState({}, '', url);
}

setBodyPage();
removeIDCOMQueryParameter();
