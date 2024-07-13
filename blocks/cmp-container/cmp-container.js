export default function decorate(block) {
  const image = block.querySelector('picture');
  if (image) {
    document.querySelector('header').append(block);
  } else {
    block.parentElement.parentElement.remove();
    document.querySelector('footer').append(block);
  }
}
