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

function installOpenAICorrespondence() {
  const evidenceSection = document.getElementById('evidence');
  if (!evidenceSection || document.getElementById('correspondence')) return;

  const section = document.createElement('section');
  section.className = 'section-shell evidence-section';
  section.id = 'correspondence';
  section.innerHTML = `
    <p class="section-index">08 / OPENAI CORRESPONDENCE</p>
    <div class="section-heading-row">
      <div>
        <h2>The investigation record was submitted to OpenAI and acknowledged for internal review.</h2>
      </div>
      <div class="body-copy">
        <p>Under support case 03361518, Ryan submitted a curated account of the N80FP work, including primary ChatGPT investigation threads, methodology, search-grid context, and public confirmation that the aircraft had been located.</p>
        <p>OpenAI Support replied that the material offered meaningful insight into ChatGPT's practical impact in a real-world application and confirmed that the submission would be reviewed internally.</p>
      </div>
    </div>

    <div class="integrity-note" style="margin-top: 30px;">
      <strong>What this correspondence establishes.</strong>
      <p>It documents that OpenAI received the case materials and recognized them as a notable real-world use case. It does not establish that OpenAI independently audited the calculations, verified the pending distance-to-impact claim, or endorsed every factual assertion in the submission.</p>
    </div>

    <div class="artifact-grid">
      <figure class="artifact">
        <button class="image-button" data-image="assets/Screenshot%202026-07-30%20224632.png" aria-label="Open initial OpenAI Support correspondence screenshot">
          <img src="assets/Screenshot%202026-07-30%20224632.png" alt="OpenAI Support case 03361518 acknowledging Ryan Hall's report about the N80FP search workflow" loading="lazy" />
        </button>
        <figcaption>
          <span>OPENAI SUPPORT / CASE 03361518</span>
          <strong>Initial acknowledgement</strong>
          <p>Support acknowledged the described methodology and outcome, characterized the submission as a notable high-stakes real-world use case, and said the report would be reviewed internally.</p>
        </figcaption>
      </figure>
      <figure class="artifact">
        <button class="image-button" data-image="assets/Screenshot%202026-07-30%20224612.png" aria-label="Open OpenAI Support follow-up correspondence screenshot">
          <img src="assets/Screenshot%202026-07-30%20224612.png" alt="OpenAI Support follow-up confirming receipt of curated N80FP investigation threads and contextual materials" loading="lazy" />
        </button>
        <figcaption>
          <span>OPENAI SUPPORT / FOLLOW-UP</span>
          <strong>Curated materials received</strong>
          <p>After Ryan supplied the primary investigation threads and contextual records, Support confirmed receipt and stated that the material would be reviewed accordingly.</p>
        </figcaption>
      </figure>
    </div>
  `;

  evidenceSection.before(section);

  const evidenceIndex = evidenceSection.querySelector('.section-index');
  if (evidenceIndex) evidenceIndex.textContent = '09 / EVIDENCE REGISTER';

  const evidenceGrid = evidenceSection.querySelector('.evidence-grid');
  if (evidenceGrid) {
    const card = document.createElement('article');
    card.innerHTML = `
      <span class="evidence-status verified">ARCHIVED</span>
      <h3>OpenAI correspondence</h3>
      <p>Support case 03361518 documents receipt of the methodology, investigation threads, contextual materials, and stated outcome for internal review.</p>
    `;
    const pendingCard = [...evidenceGrid.children].find((item) => item.textContent.includes('Advanced interface source'));
    evidenceGrid.insertBefore(card, pendingCard || null);
  }
}

installOpenAICorrespondence();

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-image]');
  if (!button) return;
  const source = button.getAttribute('data-image');
  const thumbnail = button.querySelector('img');
  lightboxImage.src = source;
  lightboxImage.alt = thumbnail?.alt || 'Case study artifact';
  lightbox.showModal();
});

closeLightbox.addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
