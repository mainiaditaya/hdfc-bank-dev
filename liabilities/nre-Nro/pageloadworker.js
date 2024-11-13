if(window && document){
    let thanks = document.querySelector('[name="thankYouPanel"]');
    let errorPanel = document.querySelector('[name="itsNotYouPanel"]');
    const mutationCallback = (mutationsList) => {
        for (const mutation of mutationsList) {
        let dataVisibileValue = mutation.target.getAttribute("data-visible");
        let currTarget = mutation.target.name;
          if(dataVisibileValue && dataVisibileValue === 'true'){
            switch(currTarget){
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
    }
    const observer = new MutationObserver(mutationCallback);
    observer.observe(thanks, { attributes: true });
    observer.observe(errorPanel, { attributes: true });
}