(function () {
  const pairs = CONFIG.pairs;
  const likertStatements = CONFIG.likertStatements;
  const LIKERT_SCALE_SIZE = 7;

  const consentScreen = document.getElementById('consent-screen');
  const welcomeScreen = document.getElementById('welcome-screen');
  const pairScreen = document.getElementById('pair-screen');
  const finishScreen = document.getElementById('finish-screen');

  const consentBtn = document.getElementById('consent-btn');
  const consentNameInput = document.getElementById('consent-name');
  const consentDateInput = document.getElementById('consent-date');

  const pairCountEl = document.getElementById('pair-count');
  const startBtn = document.getElementById('start-btn');

  const progressFill = document.getElementById('progress-fill');
  const pairIndexEl = document.getElementById('pair-index');
  const pairTotalEl = document.getElementById('pair-total');

  const video1 = document.getElementById('video-1');
  const video2 = document.getElementById('video-2');
  const likertContainer1 = document.getElementById('likert-1');
  const likertContainer2 = document.getElementById('likert-2');
  const response1 = document.getElementById('response-1');
  const response2 = document.getElementById('response-2');
  const comparisonQuestionText = document.getElementById('comparison-question-text');
  const comparisonOptions = document.getElementById('comparison-options');
  const nextBtn = document.getElementById('next-btn');

  const downloadBtn = document.getElementById('download-btn');

  let currentIndex = 0;
  const collectedResponses = [];
  let startedAt = null;
  let consentedAt = null;

  pairCountEl.textContent = pairs.length;
  pairTotalEl.textContent = pairs.length;

  consentDateInput.value = new Date().toISOString().slice(0, 10);

  function getParticipantId() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('pid') || params.get('PROLIFIC_PID') || params.get('participant_id');
    if (fromUrl) return fromUrl;
    return 'anon-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  const participantId = getParticipantId();

  function showScreen(screen) {
    [consentScreen, welcomeScreen, pairScreen, finishScreen].forEach((s) => { s.hidden = s !== screen; });
  }

  function buildLikertBlock(container, clipNum) {
    const instructions = document.createElement('p');
    instructions.className = 'likert-instructions';
    instructions.textContent = 'Please rate the following statements about this audio (1 = Strongly Disagree, 7 = Strongly Agree):';
    container.appendChild(instructions);

    likertStatements.forEach((statement) => {
      const item = document.createElement('div');
      item.className = 'likert-item';

      const text = document.createElement('p');
      text.className = 'likert-statement';
      text.textContent = statement.text;
      item.appendChild(text);

      const scale = document.createElement('div');
      scale.className = 'likert-scale';
      scale.setAttribute('role', 'radiogroup');
      scale.setAttribute('aria-label', statement.text);

      for (let value = 1; value <= LIKERT_SCALE_SIZE; value += 1) {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'likert-option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `clip${clipNum}-${statement.key}`;
        input.value = String(value);

        optionLabel.appendChild(input);
        optionLabel.appendChild(document.createTextNode(String(value)));
        scale.appendChild(optionLabel);
      }

      item.appendChild(scale);

      const endpoints = document.createElement('div');
      endpoints.className = 'likert-endpoints';
      endpoints.innerHTML = '<span>Strongly Disagree</span><span>Strongly Agree</span>';
      item.appendChild(endpoints);

      container.appendChild(item);
    });
  }

  buildLikertBlock(likertContainer1, 1);
  buildLikertBlock(likertContainer2, 2);

  function resetLikert(container) {
    container.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
  }

  function buildComparisonOptions() {
    comparisonOptions.innerHTML = '';
    ['1', '2'].forEach((clipNum) => {
      const optionLabel = document.createElement('label');
      optionLabel.className = 'comparison-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'comparison-choice';
      input.value = clipNum;

      optionLabel.appendChild(input);
      optionLabel.appendChild(document.createTextNode(`Clip ${clipNum}`));
      comparisonOptions.appendChild(optionLabel);
    });
  }

  buildComparisonOptions();

  function resetComparison() {
    comparisonOptions.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
  }

  function getComparisonAnswer() {
    const checked = comparisonOptions.querySelector('input[name="comparison-choice"]:checked');
    return checked ? checked.value : '';
  }

  function comparisonAnswered() {
    return Boolean(comparisonOptions.querySelector('input[name="comparison-choice"]:checked'));
  }

  function getLikertAnswers(clipNum) {
    const answers = {};
    likertStatements.forEach((statement) => {
      const checked = document.querySelector(`input[name="clip${clipNum}-${statement.key}"]:checked`);
      answers[statement.key] = checked ? checked.value : '';
    });
    return answers;
  }

  function allLikertAnswered(clipNum) {
    return likertStatements.every((statement) => (
      document.querySelector(`input[name="clip${clipNum}-${statement.key}"]:checked`)
    ));
  }

  function updateNextEnabled() {
    if (!CONFIG.requireResponses) {
      nextBtn.disabled = false;
      return;
    }
    nextBtn.disabled = !(
      response1.value.trim() && response2.value.trim() &&
      allLikertAnswered(1) && allLikertAnswered(2) &&
      comparisonAnswered()
    );
  }

  function loadPair(index) {
    const pair = pairs[index];
    video1.src = pair.clip1;
    video2.src = pair.clip2;
    video1.load();
    video2.load();
    response1.value = '';
    response2.value = '';
    resetLikert(likertContainer1);
    resetLikert(likertContainer2);
    comparisonQuestionText.textContent = `Which clip would you describe as "${pair.comparisonWord}"?`;
    resetComparison();
    pairIndexEl.textContent = index + 1;
    progressFill.style.width = `${((index) / pairs.length) * 100}%`;
    nextBtn.textContent = index === pairs.length - 1 ? 'Finish' : 'Next';
    updateNextEnabled();
  }

  function updateConsentEnabled() {
    consentBtn.disabled = !(consentNameInput.value.trim() && consentDateInput.value);
  }

  consentNameInput.addEventListener('input', updateConsentEnabled);
  consentDateInput.addEventListener('input', updateConsentEnabled);

  consentBtn.addEventListener('click', () => {
    consentedAt = new Date().toISOString();
    showScreen(welcomeScreen);
  });

  startBtn.addEventListener('click', () => {
    startedAt = new Date().toISOString();
    currentIndex = 0;
    loadPair(currentIndex);
    showScreen(pairScreen);
  });

  response1.addEventListener('input', updateNextEnabled);
  response2.addEventListener('input', updateNextEnabled);
  likertContainer1.addEventListener('change', updateNextEnabled);
  likertContainer2.addEventListener('change', updateNextEnabled);
  comparisonOptions.addEventListener('change', updateNextEnabled);

  nextBtn.addEventListener('click', () => {
    const pair = pairs[currentIndex];
    collectedResponses.push({
      pairId: pair.id,
      clip1: pair.clip1,
      clip2: pair.clip2,
      likert1: getLikertAnswers(1),
      likert2: getLikertAnswers(2),
      response1: response1.value.trim(),
      response2: response2.value.trim(),
      comparisonWord: pair.comparisonWord,
      comparisonAnswer: getComparisonAnswer(),
      answeredAt: new Date().toISOString(),
    });

    if (currentIndex < pairs.length - 1) {
      currentIndex += 1;
      loadPair(currentIndex);
    } else {
      progressFill.style.width = '100%';
      showScreen(finishScreen);
    }
  });

  function csvEscape(value) {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function buildCsv() {
    const finishedAt = new Date().toISOString();
    const consentName = consentNameInput.value.trim();
    const consentDate = consentDateInput.value;

    const likertHeaders = [];
    likertStatements.forEach((s) => { likertHeaders.push(`clip1_${s.key}`); });
    likertStatements.forEach((s) => { likertHeaders.push(`clip2_${s.key}`); });

    const header = [
      'participantId', 'consentName', 'consentDate', 'consentedAt',
      'startedAt', 'finishedAt',
      'pairId', 'clip1', 'clip2',
      ...likertHeaders,
      'response1', 'response2',
      'comparisonWord', 'comparisonAnswer', 'answeredAt',
    ];

    const rows = collectedResponses.map((r) => {
      const likertValues = [
        ...likertStatements.map((s) => r.likert1[s.key]),
        ...likertStatements.map((s) => r.likert2[s.key]),
      ];
      return [
        participantId, consentName, consentDate, consentedAt,
        startedAt, finishedAt,
        r.pairId, r.clip1, r.clip2,
        ...likertValues,
        r.response1, r.response2,
        r.comparisonWord, r.comparisonAnswer, r.answeredAt,
      ];
    });

    return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  }

  downloadBtn.addEventListener('click', () => {
    const csv = buildCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `responses-${participantId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
})();
