let thanks = document?.querySelector('[name="thankYouPanel"]');

function setBodyPage(thanks){
  if(thanks){
    if (window && document) {
      thanks = document.querySelector('[name="thankYouPanel"]');
      console.log(thanks);
      let errorPanel = document.querySelector('[name="itsNotYouPanel"]');
      console.log(thanks?.dataset?.visible);
      if(!thanks?.dataset?.visible){
        document.body.classList.add('nreThankYouPage');
        document.body.classList.remove('errorPageBody');
      }
      if(!errorPanel?.dataset?.visible){
        document.body.classList.remove('nreThankYouPage');
        document.body.classList.add('errorPageBody');
      }
      
      //document.body.classList.add('preloader');
      const mutationCallback = (mutationsList) => {
        for (const mutation of mutationsList) {
          console.log(mutation);
          let dataVisibileValue = mutation.target.getAttribute("data-visible");
          console.log(dataVisibileValue);
          let currTarget = mutation.target.name;
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
              default:
                break;
            }
  
          }
        }
      }
      const observer = new MutationObserver(mutationCallback);
      if (thanks) {
        observer.observe(thanks, { attributes: true });
      }
      if (errorPanel) {
        observer.observe(errorPanel, { attributes: true });
      }
    }
  }else{
    setTimeout(() => {
      if (window && document) {
        thanks = document.querySelector('[name="thankYouPanel"]');
        setBodyPage(thanks); 
      } 
    }, 500);
  }
}

setBodyPage();


  
  


