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

function setText(selector, value, root = document) {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
  return element;
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

function applyPlainTechnicalCopy() {
  document.title = 'N80FP Search Workflow and Field Software';

  setText('.brand-text', 'N80FP TECHNICAL RECORD');
  setText('nav a[href="#workflow"]', 'Workflow');
  setText('nav a[href="#system"]', 'Software');
  setText('nav a[href="#evidence"]', 'Evidence');
  setText('nav .nav-cta', 'Demo');

  setText('.hero-copy h1', 'N80FP Search Workflow and Field Software');
  setText(
    '.hero-copy .hero-deck',
    'Technical record of search modeling, geospatial interfaces, field deployment, and supporting documentation produced during the November 2025 N80FP operation.'
  );

  const heroButtons = document.querySelectorAll('.hero-actions a');
  if (heroButtons[0]) heroButtons[0].textContent = 'Software details';
  if (heroButtons[1]) heroButtons[1].textContent = 'Open demo';
  if (heroButtons[2]) heroButtons[2].textContent = 'Source files';

  const missionLines = document.querySelectorAll('.mission-panel .mission-line');
  if (missionLines[0]) missionLines[0].querySelector('strong').textContent = 'N80FP';
  if (missionLines[1]) missionLines[1].querySelector('strong').textContent = 'Lake Pontchartrain';
  if (missionLines[2]) missionLines[2].querySelector('strong').textContent = 'Mobile browser';
  if (missionLines[3]) missionLines[3].querySelector('strong').textContent = 'React / TypeScript / Three.js';
  if (missionLines[4]) missionLines[4].querySelector('strong').textContent = 'Human review required';
  setText('.mission-status', 'ARCHIVED TECHNICAL RECORD');

  setText('.integrity-note strong', 'Scope');
  setText(
    '.integrity-note p',
    "This page documents Ryan Hall's software and analysis work within a multi-team recovery operation. It does not assign the aircraft's recovery to one person, one model, or one application."
  );

  setText('#context h2', 'Incident context');
  const contextParagraphs = document.querySelectorAll('#context .body-copy > p');
  if (contextParagraphs[1]) {
    contextParagraphs[1].textContent = 'The work combined flight information, candidate areas, debris observations, eliminated locations, and field-position data in a common search workflow.';
  }

  setText('#workflow h2', 'Workflow');
  const steps = document.querySelectorAll('#workflow .step-card');
  const stepCopy = [
    ['Input review', 'Organize flight data, aircraft constraints, candidate sectors, last-known information, debris reports, and previously searched locations.'],
    ['Constraint checks', 'Compare calculations, retain uncertainty, and reject outputs that do not satisfy the available flight and geographic constraints.'],
    ['Interface development', 'Convert model outputs into browser-based maps and three-dimensional views with live GPS and standardized markers.'],
    ['Field use', 'Provide the interfaces to boat crews for location review, search-path recording, and consistent marker entry.']
  ];
  steps.forEach((step, index) => {
    const copy = stepCopy[index];
    if (!copy) return;
    setText('h3', copy[0], step);
    setText('p', copy[1], step);
  });

  setText('#system h2', 'Recovered applications');
  setText(
    '#system .heading-note',
    'The repository contains the recovered live 3D boat tracker and the recovered search-sector application. The applications are documented separately because they performed different functions.'
  );

  const systemFigures = document.querySelectorAll('#system .artifact');
  if (systemFigures[0]) {
    setText('figcaption span', 'APPLICATION 1', systemFigures[0]);
    setText('figcaption strong', 'Search-sector application', systemFigures[0]);
    setText('figcaption p', 'Displays the modeled point, last-known position, debris reference, search ellipse, live GPS position, search trail, and Clear / Debris / Crash markers.', systemFigures[0]);
  }
  if (systemFigures[1]) {
    setText('figcaption span', 'APPLICATION 2', systemFigures[1]);
    setText('figcaption strong', 'Live 3D boat tracker', systemFigures[1]);
    setText('figcaption p', 'Reads browser geolocation, displays boat position and heading, records movement history and markers, and exports field records to CSV.', systemFigures[1]);
  }

  setText('.coordinate-copy h3', 'Coordinates stored in the recovered application');
  setText(
    '.coordinate-copy > p:not(.micro-label)',
    'The diagram reproduces the modeled point, last-known-position reference, and debris reference stored in the application source. It is not an official wreckage-location map.'
  );

  setText('.technical-copy h3', 'Implemented functions');
  const technicalButtons = document.querySelectorAll('.technical-copy .inline-actions a');
  if (technicalButtons[0]) technicalButtons[0].textContent = 'Open demo';
  if (technicalButtons[1]) technicalButtons[1].textContent = 'Tracker source';

  const deployment = document.getElementById('deployment');
  setText('.field-copy h2', 'Field deployment', deployment);
  setText(
    '.field-copy > p:not(.section-index)',
    'Ryan used the tracker during the operation and provided it to other boats. The marker categories allowed crews to record cleared locations, debris observations, and possible aircraft evidence using the same labels.',
    deployment
  );
  deployment?.querySelector('blockquote')?.remove();
  deployment?.querySelector('.field-identification')?.remove();
  const fieldImage = deployment?.querySelector('img');
  if (fieldImage) fieldImage.alt = 'Search personnel aboard a boat on Lake Pontchartrain during the N80FP field operation.';

  setText('.safety-section h2', 'Human review and operating limits');
  setText(
    '.safety-grid > div:first-child p',
    'The applications organized coordinates, movement records, and marker entries. Search personnel and incident command retained responsibility for navigation, safety, evidence classification, and recovery decisions.'
  );

  const outcome = document.getElementById('outcome');
  setText('.outcome-copy h2', 'Operation outcome', outcome);
  const outcomeParagraphs = outcome?.querySelectorAll('.outcome-copy > p');
  if (outcomeParagraphs?.[0]) {
    outcomeParagraphs[0].textContent = 'The United Cajun Navy later published an update stating that the missing Cessna 172 had been located. The archived screenshot records that public announcement.';
  }
  if (outcomeParagraphs?.[1]) {
    outcomeParagraphs[1].textContent = 'The recovered applications document the trajectory-model implementation, geospatial display, live GPS functions, search-marker workflow, and field deployment described on this page.';
  }
  outcome?.querySelector('.pending-box')?.remove();

  const recoveryArtifact = outcome?.querySelector('.recovery-artifact');
  setText('figcaption span', 'PUBLIC RECORD', recoveryArtifact);
  setText('figcaption strong', 'United Cajun Navy recovery update', recoveryArtifact);
  setText('figcaption p', 'Archived social-media screenshot. Ryan Hall is visible at the far left in a plaid shirt and glasses.', recoveryArtifact);
  const recoveryImage = recoveryArtifact?.querySelector('img');
  if (recoveryImage) {
    recoveryImage.alt = 'United Cajun Navy recovery update reading Missing Cessna 172 plane located; Ryan Hall is visible at the far left in a plaid shirt and glasses.';
  }

  const recognition = document.querySelector('.recognition-section:not(#role-confirmation)');
  setText('.recognition-copy h2', 'Post-operation documentation', recognition);
  const recognitionParagraphs = recognition?.querySelectorAll('.recognition-copy > p:not(.section-index)');
  if (recognitionParagraphs?.[0]) {
    recognitionParagraphs[0].textContent = 'A handwritten letter and K-9 forensic investigation challenge coin were presented after the operation. The original items are retained privately.';
  }
  if (recognitionParagraphs?.[1]) {
    recognitionParagraphs[1].textContent = 'The photograph is included as documentation of post-operation recognition. It is not used as technical verification of the model or software.';
  }
  setText('figcaption span', 'POST-OPERATION RECORD', recognition);
  setText('figcaption strong', 'Letter and challenge coin', recognition);
  setText('figcaption p', 'Photograph of the dated letter and K-9 forensic investigation challenge coin.', recognition);

  setText('#evidence > h2', 'Evidence register');

  const closing = document.querySelector('.closing-section');
  setText('h2', 'Summary', closing);
  setText(
    ':scope > p:not(.section-index)',
    'The repository contains source code, equations, screenshots, field photographs, operational correspondence, public records, and post-operation documentation associated with the N80FP search workflow.',
    closing
  );
}

function installRecoveredSearchSimulation() {
  const systemSection = document.getElementById('system');
  const evidenceSection = document.getElementById('evidence');

  const inlineActions = systemSection?.querySelector('.inline-actions');
  if (inlineActions && !inlineActions.querySelector('[href="source/search-simulation/README.md"]')) {
    const link = document.createElement('a');
    link.className = 'button secondary';
    link.href = 'source/search-simulation/README.md';
    link.textContent = 'Simulation source';
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
    if (title) title.textContent = 'Search-simulation source';
    if (copy) copy.textContent = 'Recovered React and Three.js source for the modeled point, reference coordinates, search ellipse, GPS display, search path, and marker controls.';
  }
}

function installOpenAICorrespondence() {
  const evidenceSection = document.getElementById('evidence');
  if (!evidenceSection || document.getElementById('correspondence')) return;

  const section = document.createElement('section');
  section.className = 'section-shell evidence-section';
  section.id = 'correspondence';
  section.innerHTML = `
    <p class="section-index">09 / SUPPORT CORRESPONDENCE</p>
    <div class="section-heading-row">
      <div><h2>OpenAI Support records</h2></div>
      <div class="body-copy">
        <p>Ryan submitted the N80FP methodology, selected ChatGPT threads, search-grid information, and the reported operation outcome under support case 03361518.</p>
        <p>OpenAI Support confirmed receipt and stated that the material would be reviewed internally.</p>
      </div>
    </div>

    <div class="integrity-note" style="margin-top: 30px;">
      <strong>Record scope</strong>
      <p>The correspondence confirms receipt of the submitted material. It is not an independent engineering audit or an endorsement of every statement in the submission.</p>
    </div>

    <div class="artifact-grid">
      <figure class="artifact">
        <button class="image-button" data-image="assets/Screenshot%202026-07-30%20224632.png" aria-label="Open initial OpenAI Support correspondence screenshot">
          <img src="assets/Screenshot%202026-07-30%20224632.png" alt="OpenAI Support case 03361518 initial response" loading="lazy" />
        </button>
        <figcaption>
          <span>CASE 03361518</span>
          <strong>Initial response</strong>
          <p>Support acknowledged the submission and stated that it would be reviewed internally.</p>
        </figcaption>
      </figure>
      <figure class="artifact">
        <button class="image-button" data-image="assets/Screenshot%202026-07-30%20224612.png" aria-label="Open OpenAI Support follow-up correspondence screenshot">
          <img src="assets/Screenshot%202026-07-30%20224612.png" alt="OpenAI Support follow-up confirming receipt of selected N80FP materials" loading="lazy" />
        </button>
        <figcaption>
          <span>CASE 03361518</span>
          <strong>Follow-up response</strong>
          <p>Support confirmed receipt of the selected investigation threads and related records.</p>
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
      <h3>OpenAI Support records</h3>
      <p>Case 03361518 records receipt of the submitted methodology, selected threads, contextual material, and stated outcome.</p>
    `,
    'Precision claim'
  );
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
        <img src="assets/Screenshot%202026-07-31%20001724.png" alt="United Cajun Navy planning email dated November 28, 2025, listing Ryan Hall as Special Marine Envoy" loading="lazy" />
      </button>
      <figcaption>
        <span>MISSION RECORD</span>
        <strong>Special Marine Envoy listing</strong>
        <p>The planning email includes Ryan Hall among the recipients and lists him as Special Marine Envoy (SME).</p>
      </figcaption>
    </figure>
    <div class="recognition-copy">
      <p class="micro-label">05 / MISSION ROLE</p>
      <h2>Mission role record</h2>
      <p>The November 28, 2025 email distributed the incident overview, operational plan, and IAP for the United Cajun Navy mission. It lists Ryan Hall as Special Marine Envoy (SME).</p>
      <p>The email documents participation in the mission structure. The software source, interface records, and field photographs document the work described elsewhere on this page.</p>
    </div>
  `;

  deployment.after(section);

  addEvidenceCard(
    evidenceSection,
    'role-confirmation',
    `
      <span class="evidence-status verified">ARCHIVED</span>
      <h3>Mission-role email</h3>
      <p>A November 28 planning email lists Ryan Hall as Special Marine Envoy (SME) in the United Cajun Navy mission structure.</p>
    `,
    'Incident and recovery'
  );
}

function installTrajectoryModelStatus() {
  const evidenceSection = document.getElementById('evidence');
  const precisionCard = findEvidenceCard(evidenceSection, 'Precision claim');
  if (!precisionCard) return;

  const status = precisionCard.querySelector('.evidence-status');
  const title = precisionCard.querySelector('h3');
  const copy = precisionCard.querySelector('p');
  if (status) {
    status.className = 'evidence-status verified';
    status.textContent = 'RECOVERED';
  }
  if (title) title.textContent = 'Trajectory-model documentation';
  if (copy) copy.textContent = 'The repository includes the recovered application source and the documented fixed-wing constraint and trajectory equation stack.';
}

function renumberSections() {
  setText('.safety-section .section-index', '06 / OPERATING LIMITS');
  setText('#outcome .section-index', '07 / OUTCOME');
  setText('.recognition-section:not(#role-confirmation) .section-index', '08 / POST-OPERATION RECORD');
  setText('#correspondence .section-index', '09 / SUPPORT CORRESPONDENCE');
  setText('#evidence .section-index', '10 / EVIDENCE REGISTER');
}

installRecoveredSearchSimulation();
installOpenAICorrespondence();
installOperationalRoleConfirmation();
installTrajectoryModelStatus();
applyPlainTechnicalCopy();
renumberSections();

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-image]');
  if (!button || !lightbox || !lightboxImage) return;

  const source = button.getAttribute('data-image');
  const thumbnail = button.querySelector('img');
  lightboxImage.src = source;
  lightboxImage.alt = thumbnail?.alt || 'Case-study artifact';
  lightbox.showModal();
});

closeLightbox?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
