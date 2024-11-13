if (window && document) {
  const thanks = document.querySelector('[name="thankYouPanel"]');
  const errorPanel = document.querySelector('[name="itsNotYouPanel"]');
  const mutationCallback = (mutationsList) => {
    // eslint-disable-next-line
    for (const mutation of mutationsList) {
      const dataVisibileValue = mutation.target.getAttribute('data-visible');
      const currTarget = mutation.target.name;
      if (dataVisibileValue && dataVisibileValue === 'true') {
        switch (currTarget) {
          case 'thankYouPanel':
            document.body.classList.add('nreThankYouPage');
            document.body.classList.remove('errorPageBody');
            break;
          case 'itsNotYouPanel':
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
  observer.observe(thanks, { attributes: true });
  observer.observe(errorPanel, { attributes: true });
}
