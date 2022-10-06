const imgEl = document.querySelector('img');

document.addEventListener('click', () => {
  imgEl.hidden = true;
  gallery.closeModal();
});

gallery.displayImage((src) => {
  imgEl.hidden = false;
  imgEl.src = src;
});