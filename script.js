const progressBar = document.getElementById('progressBar');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');

function updateProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const value = max > 0 ? (doc.scrollTop / max) * 100 : 0;
  progressBar.style.width = `${value}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

document.querySelectorAll('[data-image]').forEach((button) => {
  button.addEventListener('click', () => {
    const source = button.getAttribute('data-image');
    const thumbnail = button.querySelector('img');
    lightboxImage.src = source;
    lightboxImage.alt = thumbnail?.alt || 'Case study artifact';
    lightbox.showModal();
  });
});

closeLightbox.addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
