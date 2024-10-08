import { attachRedirectOnClick } from '../../common/formutils.js';

export default function decorate(block) {
  // Logo Clickable
  attachRedirectOnClick('header .cmp-container > div:nth-child(1) > div > picture > img', 'https://www.hdfcbank.com/', '_blank');
  const image = block.querySelector('picture');
  if (image) {
    document.querySelector('header').append(block);
  } else {
    block.parentElement.parentElement.remove();
    document.querySelector('footer').append(block);
  }
}
