(function () {
  const pairs = CONFIG.pairs;

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
  const response1 = document.getElementById('response-1');
  const response2 = document.getElementById('response-2');
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

  function updateNextEnabled() {
    if (!CONFIG.requireResponses) {
      nextBtn.disabled = false;
      return;
    }
    nextBtn.disabled = !(response1.value.trim() && response2.value.trim());
  }

  function loadPair(index) {
    const pair = pairs[index];
    video1.src = pair.clip1;
    video2.src = pair.clip2;
    video1.load();
    video2.load();
    response1.value = '';
    response2.value = '';
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

  nextBtn.addEventListener('click', () => {
    const pair = pairs[currentIndex];
    collectedResponses.push({
      pairId: pair.id,
      clip1: pair.clip1,
      clip2: pair.clip2,
      response1: response1.value.trim(),
      response2: response2.value.trim(),
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
    const header = [
      'participantId', 'consentName', 'consentDate', 'consentedAt',
      'startedAt', 'finishedAt',
      'pairId', 'clip1', 'clip2', 'response1', 'response2', 'answeredAt',
    ];
    const rows = collectedResponses.map((r) => [
      participantId, consentName, consentDate, consentedAt,
      startedAt, finishedAt,
      r.pairId, r.clip1, r.clip2, r.response1, r.response2, r.answeredAt,
    ]);
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
