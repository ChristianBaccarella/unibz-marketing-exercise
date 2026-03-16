/**
 * unibz Marketing Exercise - Student Application Logic
 */

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────────────────────
  let state = null;
  let timerInterval = null;

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    state = Storage.loadStudentData();

    // Check for session code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlSession = urlParams.get('session');
    if (urlSession) {
      state.sessionCode = urlSession;
      Storage.saveStudentData(state);
    }

    if (!state.studentName) {
      showNameModal();
    } else {
      initApp();
    }
  });

  // ── Name modal ────────────────────────────────────────────────────────────

  function showNameModal() {
    const modal = document.getElementById('name-modal');
    if (modal) modal.classList.remove('hidden');

    const form = document.getElementById('name-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nameInput = document.getElementById('student-name-input');
        const sessionInput = document.getElementById('session-code-input');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) return;

        state.studentName = name;
        if (sessionInput && sessionInput.value.trim()) {
          state.sessionCode = sessionInput.value.trim().toUpperCase();
        }
        state.startTime = state.startTime || Date.now();
        Storage.saveStudentData(state);
        if (modal) modal.classList.add('hidden');
        initApp();
      });
    }
  }

  // ── App initialization ────────────────────────────────────────────────────

  function initApp() {
    // Initialize gamification
    Gamification.init(state, function (updatedData) {
      state = updatedData;
      updateUI();
    });

    // Show student name in header
    const nameHeader = document.getElementById('student-name-header');
    if (nameHeader && state.studentName) nameHeader.textContent = state.studentName;

    // Restore saved answers
    restoreAnswers();

    // Update UI
    updateUI();

    // Start timer (restore from saved remaining time)
    startTimer();

    // Bind event handlers
    bindAnswerHandlers();
    bindExportHandlers();
    bindTimerControls();
    bindExerciseNavigation();

    // Show first exercise
    showExercise(1);

    // Sync to session if applicable
    if (state.sessionCode) {
      syncToSession();
    }
  }

  // ── Timer ─────────────────────────────────────────────────────────────────

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    if (state.timerRemaining <= 0) {
      onTimerEnd();
      return;
    }
    state.timerRunning = true;
    timerInterval = setInterval(tick, 1000);
    updateTimerDisplay();
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    state.timerRunning = false;
    Storage.saveStudentData(state);
    updateTimerDisplay();
  }

  function tick() {
    if (state.timerRemaining > 0) {
      state.timerRemaining--;
      Storage.saveStudentData(state);
      updateTimerDisplay();
      if (state.timerRemaining <= 300) { // 5 min warning
        const timerEl = document.getElementById('timer-display');
        if (timerEl) timerEl.classList.add('timer--warning');
      }
      if (state.timerRemaining <= 60) {
        const timerEl = document.getElementById('timer-display');
        if (timerEl) timerEl.classList.add('timer--critical');
      }
    } else {
      onTimerEnd();
    }
  }

  function onTimerEnd() {
    clearInterval(timerInterval);
    timerInterval = null;
    state.timerRunning = false;
    state.timerRemaining = 0;
    Storage.saveStudentData(state);
    updateTimerDisplay();
    showTimerEndModal();
  }

  function updateTimerDisplay() {
    const el = document.getElementById('timer-display');
    if (!el) return;
    const m = Math.floor(state.timerRemaining / 60);
    const s = state.timerRemaining % 60;
    el.textContent = pad(m) + ':' + pad(s);
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function bindTimerControls() {
    const pauseBtn = document.getElementById('timer-pause');
    const resumeBtn = document.getElementById('timer-resume');
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      pauseTimer();
      pauseBtn.classList.add('hidden');
      if (resumeBtn) resumeBtn.classList.remove('hidden');
    });
    if (resumeBtn) resumeBtn.addEventListener('click', function () {
      startTimer();
      resumeBtn.classList.add('hidden');
      if (pauseBtn) pauseBtn.classList.remove('hidden');
    });
  }

  function showTimerEndModal() {
    const modal = document.getElementById('timer-end-modal');
    if (modal) modal.classList.remove('hidden');
  }

  // ── Exercise navigation ───────────────────────────────────────────────────

  function showExercise(num) {
    document.querySelectorAll('.exercise-panel').forEach(function (p) {
      p.classList.add('hidden');
    });
    const panel = document.getElementById('exercise-' + num);
    if (panel) panel.classList.remove('hidden');

    document.querySelectorAll('[data-exercise]').forEach(function (btn) {
      btn.classList.toggle('nav-btn--active', parseInt(btn.dataset.exercise, 10) === num);
    });
  }

  // ── Answer handling ───────────────────────────────────────────────────────

  function restoreAnswers() {
    document.querySelectorAll('[data-question]').forEach(function (el) {
      const qid = el.dataset.question;
      const saved = Storage.loadAnswer(qid, state);
      if (saved) el.value = saved;
    });
  }

  function bindAnswerHandlers() {
    document.querySelectorAll('[data-question]').forEach(function (el) {
      el.addEventListener('input', function () {
        const qid = el.dataset.question;
        const val = el.value;
        state = Storage.saveAnswer(qid, val, state);
        const pts = Gamification.addPoints(qid, val);
        if (pts) updateUI();
        syncToSession();
      });
    });
  }

  // ── Exercise completion buttons ───────────────────────────────────────────

  function bindExerciseNavigation() {
    document.querySelectorAll('[data-exercise]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showExercise(parseInt(btn.dataset.exercise, 10));
      });
    });

    document.querySelectorAll('[data-complete-exercise]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const num = parseInt(btn.dataset.completeExercise, 10);
        Gamification.markExerciseComplete(num);
        updateUI();
      });
    });
  }

  // ── UI update ─────────────────────────────────────────────────────────────

  function updateUI() {
    // Points
    const pointsEl = document.getElementById('points-display');
    if (pointsEl) pointsEl.textContent = state.points || 0;

    // Progress bar
    const progress = Gamification.calculateOverallProgress(state);
    const progressEl = document.getElementById('progress-bar');
    if (progressEl) progressEl.style.width = progress + '%';
    const progressTextEl = document.getElementById('progress-text');
    if (progressTextEl) progressTextEl.textContent = progress + '%';

    // Badges
    Gamification.renderBadges('badges-container');

    // Exercise status indicators
    [1, 2, 3].forEach(function (n) {
      const indicator = document.querySelector('[data-exercise-status="' + n + '"]');
      if (indicator) {
        if (state['exercise' + n + 'Done']) {
          indicator.textContent = '✅';
        }
      }
    });
  }

  // ── Session sync ──────────────────────────────────────────────────────────

  function syncToSession() {
    if (!state.sessionCode) return;
    Storage.registerStudentInSession(state.sessionCode, state);
  }

  // ── Export functions ──────────────────────────────────────────────────────

  function bindExportHandlers() {
    const exportPdf = document.getElementById('export-pdf');
    const exportJson = document.getElementById('export-json');
    const exportQr = document.getElementById('export-qr');
    const exportLink = document.getElementById('export-link');

    if (exportPdf) exportPdf.addEventListener('click', exportToPdf);
    if (exportJson) exportJson.addEventListener('click', exportToJson);
    if (exportQr) exportQr.addEventListener('click', showQrCode);
    if (exportLink) exportLink.addEventListener('click', copyShareableLink);
  }

  function exportToJson() {
    const data = {
      student: state.studentName,
      session: state.sessionCode,
      points: state.points,
      badges: state.badges,
      exercisesCompleted: state.exercisesCompleted,
      answers: state.answers,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marketing-exercise-' + (state.studentName || 'student') + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportToPdf() {
    window.print();
  }

  function showQrCode() {
    const modal = document.getElementById('qr-modal');
    const container = document.getElementById('qr-container');
    if (!modal || !container) return;

    // Encode only a minimal, non-sensitive summary
    const summary = [
      state.studentName || 'Student',
      (state.points || 0) + ' Punkte',
      Gamification.calculateOverallProgress(state) + '% Fortschritt'
    ].join(' | ');
    const url = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(summary);
    const img = document.createElement('img');
    img.alt = 'QR Code';
    img.style.cssText = 'width:200px;height:200px;';
    img.onerror = function () {
      container.innerHTML = '<p style="color:#e74c3c;">QR-Code konnte nicht geladen werden.</p>';
    };
    img.src = url;
    container.innerHTML = '';
    container.appendChild(img);
    modal.classList.remove('hidden');

    const closeBtn = document.getElementById('qr-close');
    if (closeBtn) closeBtn.onclick = function () { modal.classList.add('hidden'); };
  }

  function copyShareableLink() {
    const params = new URLSearchParams();
    if (state.sessionCode) params.set('session', state.sessionCode);
    params.set('name', state.studentName);
    const link = window.location.origin + window.location.pathname + '?' + params.toString();
    navigator.clipboard.writeText(link).then(function () {
      showToast('Link kopiert!');
    }).catch(function () {
      prompt('Link zum Kopieren:', link);
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('toast--visible'); }, 50);
    setTimeout(function () {
      toast.classList.remove('toast--visible');
      setTimeout(function () { toast.remove(); }, 400);
    }, 2500);
  }

})();
