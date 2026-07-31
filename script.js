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

function installRecoveredSearchSimulation() {
  const systemSection = document.getElementById('system');
  const evidenceSection = document.getElementById('evidence');

  if (systemSection) {
    const headingNote = systemSection.querySelector('.heading-note');
    if (headingNote) {
      headingNote.textContent = 'Both the live 3D tracker and the specialized search simulation were recovered and archived. Together they show how the model was translated into field-useful interfaces during the operation.';
    }

    const inlineActions = systemSection.querySelector('.inline-actions');
    if (inlineActions && !inlineActions.querySelector('[href="source/search-simulation/README.md"]')) {
      const link = document.createElement('a');
      link.className = 'button secondary';
      link.href = 'source/search-simulation/README.md';
      link.textContent = 'Inspect search simulation';
      inlineActions.appendChild(link);
    }
  }

  if (evidenceSection) {
    const advancedSourceCard = [...evidenceSection.querySelectorAll('.evidence-grid article')]
      .find((item) => item.textContent.includes('Advanced interface source'));

    if (advancedSourceCard) {
      const status = advancedSourceCard.querySelector('.evidence-status');
      const title = advancedSourceCard.querySelector('h3');
      const copy = advancedSourceCard.querySelector('p');
      if (status) {
        status.className = 'evidence-status verified';
        status.textContent = 'RECOVERED';
      }
      if (title) title.textContent = 'Search simulation source';
      if (copy) copy.textContent = 'The recovered React and Three.js source stores the modeled POI, LKP, debris reference, search ellipse, live GPS workflow, path tracking, and Clear / Debris / Crash marker system.';
    }
  }
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
        <h2>OpenAI Support correspondence.</h2>
      </div>
      <div class="body-copy">
        <p>Under support case 03361518, Ryan submitted a curated account of the N80FP work, including primary ChatGPT investigation threads, methodology, search-grid context, and public confirmation that the aircraft had been located.</p>
        <p>OpenAI Support confirmed receipt of the materials and stated that they would be reviewed internally.</p>
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
          <p>Support acknowledged the described methodology and outcome and stated that the report would be reviewed internally.</p>
        </figcaption>
      </figure>
      <figure class="artifact">
        <button class="image-button" data-image="assets/Screenshot%202026-07-30%20224612.png" aria-label="Open OpenAI Support follow-up correspondence screenshot">
          <img src="assets/Screenshot%202026-07-30%20224612.png" alt="OpenAI Support follow-up confirming receipt of curated N80FP investigation threads and contextual materials" loading="lazy" />
        </button>
        <figcaption>
          <span>OPENAI SUPPORT / FOLLOW-UP</span>
          <strong>Curated materials received</strong>
          <p>After Ryan supplied the primary investigation threads and contextual records, Support confirmed receipt and said the material would be reviewed.</p>
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
    const precisionCard = [...evidenceGrid.children].find((item) => item.textContent.includes('Precision claim'));
    evidenceGrid.insertBefore(card, precisionCard || null);
  }
}

function installEditorialRevisions() {
  const heroHeading = document.querySelector('.hero-copy h1');
  if (heroHeading) heroHeading.textContent = 'AI-assisted search modeling used in a live field operation.';

  const heroDeck = document.querySelector('.hero-copy .hero-deck');
  if (heroDeck) {
    heroDeck.textContent = 'I developed a search workflow, translated it into mobile GPS interfaces, and shared a marker-based coordination system with boat crews during the human-led search for aircraft N80FP.';
  }

  const contextCopy = document.querySelector('#context .body-copy');
  if (contextCopy) {
    const paragraphs = contextCopy.querySelectorAll(':scope > p');
    if (paragraphs[1]) {
      paragraphs[1].textContent = 'The practical problem was not just generating another coordinate. It was organizing scattered flight data, candidate areas, debris observations, and eliminated locations into a workflow that people on boats could understand and use.';
    }
  }

  const workflowHeading = document.querySelector('#workflow h2');
  if (workflowHeading) workflowHeading.textContent = 'From model output to a usable field workflow.';

  const deployment = document.getElementById('deployment');
  if (deployment) {
    const heading = deployment.querySelector('.field-copy h2');
    if (heading) heading.textContent = 'The main task was making the tool usable in the field.';

    const paragraph = deployment.querySelector('.field-copy > p:not(.section-index)');
    if (paragraph) {
      paragraph.textContent = "I used the tracker in the field and shared it with other boats so crews could use the same marker vocabulary. That reduced the chance that one crew's checked location, another crew's possible debris, and a third crew's handwritten coordinates would become disconnected records.";
    }

    const quote = deployment.querySelector('blockquote');
    if (quote) quote.remove();

    const markerKey = deployment.querySelector('.marker-key');
    if (markerKey && !deployment.querySelector('.field-identification')) {
      const identification = document.createElement('p');
      identification.className = 'field-identification';
      identification.textContent = 'Ryan Hall is visible at the far left in a plaid shirt and glasses.';
      markerKey.before(identification);
    }

    const fieldImage = deployment.querySelector('img');
    if (fieldImage) {
      fieldImage.alt = 'Search personnel aboard a boat on Lake Pontchartrain during the N80FP field operation; Ryan Hall is visible at the far left, identifiable by his red hair, plaid shirt, and glasses.';
    }
  }

  const oversightHeading = document.querySelector('.safety-section h2');
  if (oversightHeading) oversightHeading.textContent = 'Human review remained in control.';

  const outcome = document.getElementById('outcome');
  if (outcome) {
    const heading = outcome.querySelector('.outcome-copy h2');
    if (heading) heading.textContent = 'Outcome and attribution.';

    const paragraphs = outcome.querySelectorAll('.outcome-copy > p');
    if (paragraphs[1]) {
      paragraphs[1].textContent = 'The strongest verified result of this project is that an AI-assisted analysis was translated into a real mobile coordination tool, deployed in a live search environment, and used by people other than its creator.';
    }
  }

  const recognitionHeading = document.querySelector('.recognition-copy h2');
  if (recognitionHeading) recognitionHeading.textContent = 'Post-operation recognition.';

  const evidenceHeading = document.querySelector('#evidence > h2');
  if (evidenceHeading) evidenceHeading.textContent = 'Verified evidence, personal testimony, and open items.';

  const closing = document.querySelector('.closing-section');
  if (closing) {
    const heading = closing.querySelector('h2');
    if (heading) heading.textContent = 'Why this case study is relevant.';

    const paragraph = closing.querySelector(':scope > p:not(.section-index)');
    if (paragraph) {
      paragraph.textContent = 'This project shows how an LLM-assisted process can be turned into a usable workflow: identify the information problem, build a practical tool, preserve human control, and leave behind something other people can use and evaluate.';
    }
  }
}

installRecoveredSearchSimulation();
installOpenAICorrespondence();
installEditorialRevisions();

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