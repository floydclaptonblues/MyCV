const progressBar = document.getElementById('progressBar');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');

function updateProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const value = max > 0 ? (doc.scrollTop / max) * 100 : 0;
  if (progressBar) progressBar.style.width = `${value}%`;
}

function findEvidenceCard(evidenceSection, text) {
  return [...(evidenceSection?.querySelectorAll('.evidence-grid article') || [])]
    .find((item) => item.textContent.includes(text));
}

function addEvidenceCard(evidenceSection, key, html, beforeText = null) {
  const grid = evidenceSection?.querySelector('.evidence-grid');
  if (!grid || grid.querySelector(`[data-evidence-key="${key}"]`)) return;

  const card = document.createElement('article');
  card.dataset.evidenceKey = key;
  card.innerHTML = html;

  const before = beforeText
    ? [...grid.children].find((item) => item.textContent.includes(beforeText))
    : null;
  grid.insertBefore(card, before || null);
}

function installRecoveredSearchSimulation() {
  const systemSection = document.getElementById('system');
  const evidenceSection = document.getElementById('evidence');

  const headingNote = systemSection?.querySelector('.heading-note');
  if (headingNote) {
    headingNote.textContent = 'Both the live 3D tracker and the specialized search simulation were recovered and archived. Together they show how the model was translated into field-useful interfaces during the operation.';
  }

  const inlineActions = systemSection?.querySelector('.inline-actions');
  if (inlineActions && !inlineActions.querySelector('[href="source/search-simulation/README.md"]')) {
    const link = document.createElement('a');
    link.className = 'button secondary';
    link.href = 'source/search-simulation/README.md';
    link.textContent = 'Inspect search simulation';
    inlineActions.appendChild(link);
  }

  const sourceCard = findEvidenceCard(evidenceSection, 'Advanced interface source');
  if (sourceCard) {
    const status = sourceCard.querySelector('.evidence-status');
    const title = sourceCard.querySelector('h3');
    const copy = sourceCard.querySelector('p');
    if (status) {
      status.className = 'evidence-status verified';
      status.textContent = 'RECOVERED';
    }
    if (title) title.textContent = 'Search simulation source';
    if (copy) {
      copy.textContent = 'The recovered React and Three.js source stores the modeled POI, LKP, debris reference, search ellipse, live GPS workflow, path tracking, and Clear / Debris / Crash marker system.';
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
    <p class="section-index">09 / OPENAI CORRESPONDENCE</p>
    <div class="section-heading-row">
      <div><h2>OpenAI Support correspondence.</h2></div>
      <div class="body-copy">
        <p>Under support case 03361518, Ryan submitted a curated account of the N80FP work, including primary ChatGPT investigation threads, methodology, search-grid context, and public confirmation that the aircraft had been located.</p>
        <p>OpenAI Support confirmed receipt of the materials and stated that they would be reviewed internally.</p>
      </div>
    </div>

    <div class="integrity-note" style="margin-top: 30px;">
      <strong>What this correspondence establishes.</strong>
      <p>It documents that OpenAI received the case materials and recognized them as a notable real-world use case. It is not presented as an independent engineering audit or institutional endorsement of every assertion in the submission.</p>
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

  addEvidenceCard(
    evidenceSection,
    'openai-correspondence',
    `
      <span class="evidence-status verified">ARCHIVED</span>
      <h3>OpenAI correspondence</h3>
      <p>Support case 03361518 documents receipt of the methodology, investigation threads, contextual materials, and stated outcome for internal review.</p>
    `,
    'Precision claim'
  );
}

function installEditorialRevisions() {
  const heroHeading = document.querySelector('.hero-copy h1');
  if (heroHeading) heroHeading.textContent = 'AI-assisted search modeling used in a live field operation.';

  const heroDeck = document.querySelector('.hero-copy .hero-deck');
  if (heroDeck) {
    heroDeck.textContent = 'I developed a search workflow, translated it into mobile GPS interfaces, and shared a marker-based coordination system with boat crews during the human-led search for aircraft N80FP.';
  }

  const contextCopy = document.querySelector('#context .body-copy');
  const contextParagraphs = contextCopy?.querySelectorAll(':scope > p');
  if (contextParagraphs?.[1]) {
    contextParagraphs[1].textContent = 'The practical problem was not just generating another coordinate. It was organizing scattered flight data, candidate areas, debris observations, and eliminated locations into a workflow that people on boats could understand and use.';
  }

  const workflowHeading = document.querySelector('#workflow h2');
  if (workflowHeading) workflowHeading.textContent = 'From model output to a usable field workflow.';

  const deployment = document.getElementById('deployment');
  const deploymentHeading = deployment?.querySelector('.field-copy h2');
  if (deploymentHeading) deploymentHeading.textContent = 'The main task was making the tool usable in the field.';

  const deploymentParagraph = deployment?.querySelector('.field-copy > p:not(.section-index)');
  if (deploymentParagraph) {
    deploymentParagraph.textContent = "I used the tracker in the field and shared it with other boats so crews could use the same marker vocabulary. That reduced the chance that one crew's checked location, another crew's possible debris, and a third crew's handwritten coordinates would become disconnected records.";
  }

  deployment?.querySelector('blockquote')?.remove();
  deployment?.querySelector('.field-identification')?.remove();

  const fieldImage = deployment?.querySelector('img');
  if (fieldImage) {
    fieldImage.alt = 'Search personnel aboard a boat on Lake Pontchartrain during the N80FP field operation.';
  }

  const oversightHeading = document.querySelector('.safety-section h2');
  if (oversightHeading) oversightHeading.textContent = 'Human review remained in control.';

  const outcome = document.getElementById('outcome');
  const outcomeHeading = outcome?.querySelector('.outcome-copy h2');
  if (outcomeHeading) outcomeHeading.textContent = 'Outcome and attribution.';

  const outcomeParagraphs = outcome?.querySelectorAll('.outcome-copy > p');
  if (outcomeParagraphs?.[1]) {
    outcomeParagraphs[1].textContent = 'The recovered applications document the live implementation of the trajectory model and the field workflow. The system combined configured flight conditions, fixed-wing operating constraints, geospatial projection, live GPS, and standardized search markers in an interface used during the operation.';
  }

  const recoveryArtifact = outcome?.querySelector('.recovery-artifact');
  const recoveryImage = recoveryArtifact?.querySelector('img');
  if (recoveryImage) {
    recoveryImage.alt = 'United Cajun Navy recovery update reading Missing Cessna 172 plane located; Ryan Hall is visible at the far left in a plaid shirt and glasses, identifiable by his red hair.';
  }

  const recoveryCaption = recoveryArtifact?.querySelector('figcaption p');
  if (recoveryCaption) {
    recoveryCaption.textContent = 'Archived United Cajun Navy recovery update. Ryan Hall is visible at the far left in a plaid shirt and glasses, identifiable by his red hair.';
  }

  const recognitionHeading = document.querySelector('.recognition-copy h2');
  if (recognitionHeading) recognitionHeading.textContent = 'Post-operation recognition.';

  const evidenceHeading = document.querySelector('#evidence > h2');
  if (evidenceHeading) evidenceHeading.textContent = 'Verified evidence and documented source artifacts.';

  const closing = document.querySelector('.closing-section');
  const closingHeading = closing?.querySelector('h2');
  if (closingHeading) closingHeading.textContent = 'Why this case study is relevant.';

  const closingParagraph = closing?.querySelector(':scope > p:not(.section-index)');
  if (closingParagraph) {
    closingParagraph.textContent = 'This project shows how an LLM-assisted process can be turned into a usable workflow: identify the information problem, build a practical tool, preserve human control, and leave behind something other people can use and evaluate.';
  }
}

function installOperationalRoleConfirmation() {
  const deployment = document.getElementById('deployment');
  const evidenceSection = document.getElementById('evidence');
  if (!deployment || document.getElementById('role-confirmation')) return;

  const section = document.createElement('section');
  section.className = 'section-shell recognition-section';
  section.id = 'role-confirmation';
  section.innerHTML = `
    <figure class="artifact recognition-artifact">
      <button class="image-button" data-image="assets/Screenshot%202026-07-31%20001724.png" aria-label="Open United Cajun Navy operational planning email">
        <img src="assets/Screenshot%202026-07-31%20001724.png" alt="United Cajun Navy operational planning email dated November 28, 2025, listing Ryan Hall as an SME in the mission's ICS structure" loading="lazy" />
      </button>
      <figcaption>
        <span>OPERATIONAL ROLE CONFIRMATION</span>
        <strong>Listed as SME in the mission structure</strong>
        <p>A mission-planning email from Incident Commander Josh Gill included Ryan Hall among the recipients and listed him as an SME.</p>
      </figcaption>
    </figure>
    <div class="recognition-copy">
      <p class="micro-label">05 / OPERATIONAL ROLE CONFIRMATION</p>
      <h2>Formal inclusion in the mission structure.</h2>
      <p>The November 28, 2025 operational email distributed the incident overview, operational plan, and IAP for the United Cajun Navy mission. Ryan Hall appears in the ICS structure as an SME and was included among the mission recipients.</p>
      <p>SME is commonly used for subject-matter expert. The email confirms formal involvement in the operation; the recovered source code, tracker artifacts, and field records document the modeling and software contribution described in this case study.</p>
    </div>
  `;

  deployment.after(section);

  addEvidenceCard(
    evidenceSection,
    'role-confirmation',
    `
      <span class="evidence-status verified">ARCHIVED</span>
      <h3>Operational role confirmation</h3>
      <p>A November 28 mission-planning email includes Ryan Hall among the recipients and lists him as an SME in the United Cajun Navy ICS structure.</p>
    `,
    'Incident and recovery'
  );
}

function installTrajectoryModelStatus() {
  const outcome = document.getElementById('outcome');
  outcome?.querySelector('.pending-box')?.remove();

  const evidenceSection = document.getElementById('evidence');
  const precisionCard = findEvidenceCard(evidenceSection, 'Precision claim');
  if (precisionCard) {
    const status = precisionCard.querySelector('.evidence-status');
    const title = precisionCard.querySelector('h3');
    const copy = precisionCard.querySelector('p');
    if (status) {
      status.className = 'evidence-status verified';
      status.textContent = 'RECOVERED';
    }
    if (title) title.textContent = 'Trajectory model implementation';
    if (copy) {
      copy.textContent = 'The recovered Google/Gemini application demonstrates the model running on a three-dimensional surface with configured altitude, speed, heading, geospatial position, and fixed-wing flight constraints.';
    }
  }
}

function renumberSections() {
  const safetyIndex = document.querySelector('.safety-section .section-index');
  if (safetyIndex) safetyIndex.textContent = '06 / HUMAN OVERSIGHT';

  const outcomeIndex = document.querySelector('#outcome .section-index');
  if (outcomeIndex) outcomeIndex.textContent = '07 / OUTCOME';

  const recognitionIndex = document.querySelector('.recognition-section:not(#role-confirmation) .section-index');
  if (recognitionIndex) recognitionIndex.textContent = '08 / RECOGNITION';

  const correspondenceIndex = document.querySelector('#correspondence .section-index');
  if (correspondenceIndex) correspondenceIndex.textContent = '09 / OPENAI CORRESPONDENCE';

  const evidenceIndex = document.querySelector('#evidence .section-index');
  if (evidenceIndex) evidenceIndex.textContent = '10 / EVIDENCE REGISTER';
}

installRecoveredSearchSimulation();
installOpenAICorrespondence();
installEditorialRevisions();
installOperationalRoleConfirmation();
installTrajectoryModelStatus();
renumberSections();

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-image]');
  if (!button || !lightbox || !lightboxImage) return;

  const source = button.getAttribute('data-image');
  const thumbnail = button.querySelector('img');
  lightboxImage.src = source;
  lightboxImage.alt = thumbnail?.alt || 'Case study artifact';
  lightbox.showModal();
});

closeLightbox?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
