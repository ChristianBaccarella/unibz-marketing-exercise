/**
 * unibz Marketing Exercise - Teacher Dashboard Logic
 */

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────────────────────
  let currentSession = null;
  let refreshInterval = null;
  let chart = null;

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    bindCreateSession();
    bindExportButtons();

    // Check for existing session
    const stored = Storage.loadSessionCode();
    if (stored) {
      const session = Storage.getTeacherSession(stored);
      if (session) {
        currentSession = session;
        showDashboard(stored);
        startAutoRefresh();
      }
    }
  });

  // ── Session creation ──────────────────────────────────────────────────────

  function bindCreateSession() {
    const form = document.getElementById('create-session-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const nameInput = document.getElementById('teacher-name-input');
      const teacherName = nameInput ? nameInput.value.trim() : 'Lehrperson';
      createSession(teacherName);
    });
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function createSession(teacherName) {
    const code = generateCode();
    currentSession = {
      code: code,
      teacherName: teacherName,
      createdAt: Date.now(),
      students: {}
    };
    Storage.saveTeacherSession(code, currentSession);
    Storage.saveSessionCode(code);
    showDashboard(code);
    generateSessionQr(code);
    startAutoRefresh();
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  function showDashboard(code) {
    const setup = document.getElementById('session-setup');
    const dashboard = document.getElementById('dashboard');
    if (setup) setup.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');

    const codeEl = document.getElementById('session-code-display');
    if (codeEl) codeEl.textContent = code;

    const studentLink = window.location.origin +
      window.location.pathname.replace('teacher.html', 'index.html') +
      '?session=' + code;
    const linkEl = document.getElementById('student-link');
    if (linkEl) linkEl.textContent = studentLink;

    generateSessionQr(code);
    refreshDashboard();
  }

  function refreshDashboard() {
    if (!currentSession) return;
    const freshSession = Storage.getTeacherSession(currentSession.code);
    if (freshSession) currentSession = freshSession;

    const students = currentSession.students || {};
    const studentList = Object.values(students);

    updateStats(studentList);
    updateStudentTable(studentList);
    updateChart(studentList);
  }

  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(refreshDashboard, CONFIG.REFRESH_INTERVAL);
  }

  // ── Statistics ────────────────────────────────────────────────────────────

  function updateStats(students) {
    const totalEl = document.getElementById('stat-total');
    const completedEl = document.getElementById('stat-completed');
    const avgScoreEl = document.getElementById('stat-avg-score');

    if (totalEl) totalEl.textContent = students.length;

    const completed = students.filter(function (s) {
      return s.exercisesCompleted && s.exercisesCompleted.length === 3;
    }).length;
    if (completedEl) completedEl.textContent = completed;

    const avgScore = students.length > 0
      ? Math.round(students.reduce(function (acc, s) { return acc + (s.points || 0); }, 0) / students.length)
      : 0;
    if (avgScoreEl) avgScoreEl.textContent = avgScore;
  }

  // ── Student table ─────────────────────────────────────────────────────────

  function updateStudentTable(students) {
    const tbody = document.getElementById('student-tbody');
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;">Noch keine Studierenden verbunden</td></tr>';
      return;
    }

    tbody.innerHTML = students.map(function (s, i) {
      const status = getStatus(s);
      const lastSeen = s.lastSeen ? timeAgo(s.lastSeen) : '-';
      return '<tr>' +
        '<td>' + (i + 1) + '. ' + escapeHtml(s.name || 'Anonym') + '</td>' +
        '<td><div class="progress-mini"><div class="progress-mini__fill" style="width:' + (s.progress || 0) + '%"></div></div>' +
        '<span>' + (s.progress || 0) + '%</span></td>' +
        '<td>' + (s.points || 0) + ' Punkte</td>' +
        '<td><span class="status-badge status-badge--' + status.cls + '">' + status.label + '</span></td>' +
        '<td>' + lastSeen + '</td>' +
        '</tr>';
    }).join('');
  }

  function getStatus(student) {
    const done = (student.exercisesCompleted || []).length;
    if (done === 3) return { label: 'Fertig', cls: 'done' };
    if (done > 0) return { label: 'In Arbeit', cls: 'active' };
    if (student.answersCount > 0) return { label: 'Aktiv', cls: 'active' };
    return { label: 'Bereit', cls: 'waiting' };
  }

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Gerade eben';
    if (diff < 3600) return Math.floor(diff / 60) + ' Min.';
    return Math.floor(diff / 3600) + ' Std.';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Simple Chart (no external library) ───────────────────────────────────

  function updateChart(students) {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Distribution: 0-33%, 34-66%, 67-100%
    const buckets = [0, 0, 0];
    students.forEach(function (s) {
      const p = s.progress || 0;
      if (p <= 33) buckets[0]++;
      else if (p <= 66) buckets[1]++;
      else buckets[2]++;
    });

    const labels = ['0-33%', '34-66%', '67-100%'];
    const colors = ['#e74c3c', '#f39c12', '#27ae60'];
    const maxVal = Math.max(...buckets, 1);
    const barWidth = (w - 80) / 3;
    const chartH = h - 60;

    buckets.forEach(function (val, i) {
      const x = 40 + i * barWidth + barWidth * 0.1;
      const bw = barWidth * 0.8;
      const bh = (val / maxVal) * chartH;
      const y = chartH - bh + 10;

      ctx.fillStyle = colors[i];
      ctx.fillRect(x, y, bw, bh);

      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + bw / 2, h - 10);
      ctx.fillText(val, x + bw / 2, y - 5);
    });

    // Axis
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(35, 10);
    ctx.lineTo(35, chartH + 10);
    ctx.lineTo(w - 5, chartH + 10);
    ctx.stroke();
  }

  // ── QR Code for session ───────────────────────────────────────────────────

  function generateSessionQr(code) {
    const container = document.getElementById('session-qr');
    if (!container) return;
    const studentLink = window.location.origin +
      window.location.pathname.replace('teacher.html', 'index.html') +
      '?session=' + code;
    const url = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(studentLink);
    const img = document.createElement('img');
    img.alt = 'Session QR Code';
    img.style.cssText = 'width:180px;height:180px;';
    img.onerror = function () {
      container.innerHTML = '<div style="width:180px;height:180px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#999;font-size:.8rem;text-align:center;padding:.5rem;">QR-Code nicht verfügbar.<br>Bitte Link manuell teilen.</div>';
    };
    img.src = url;
    container.innerHTML = '';
    container.appendChild(img);
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function bindExportButtons() {
    const exportCsvBtn = document.getElementById('export-csv');
    const exportJsonBtn = document.getElementById('export-json-teacher');
    const newSessionBtn = document.getElementById('new-session-btn');
    const copyLinkBtn = document.getElementById('copy-student-link');

    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCsv);
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportJson);
    if (newSessionBtn) newSessionBtn.addEventListener('click', function () {
      if (confirm('Neue Sitzung erstellen? Die aktuelle Sitzung wird beendet.')) {
        Storage.deleteTeacherSession(currentSession.code);
        currentSession = null;
        const dashboard = document.getElementById('dashboard');
        const setup = document.getElementById('session-setup');
        if (dashboard) dashboard.classList.add('hidden');
        if (setup) setup.classList.remove('hidden');
      }
    });
    if (copyLinkBtn) copyLinkBtn.addEventListener('click', function () {
      const linkEl = document.getElementById('student-link');
      if (!linkEl) return;
      navigator.clipboard.writeText(linkEl.textContent).then(function () {
        showToast('Link kopiert!');
      }).catch(function () {
        showToast('Link konnte nicht kopiert werden. Bitte manuell kopieren.');
      });
    });
  }

  function exportCsv() {
    if (!currentSession) return;
    const students = Object.values(currentSession.students || {});
    const headers = ['Name', 'Punkte', 'Fortschritt (%)', 'Abgeschlossene Übungen', 'Badges', 'Status'];
    const rows = students.map(function (s) {
      return [
        s.name || 'Anonym',
        s.points || 0,
        s.progress || 0,
        (s.exercisesCompleted || []).length,
        s.badges || 0,
        getStatus(s).label
      ].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    });
    const csv = [headers.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'klasse-' + currentSession.code + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    if (!currentSession) return;
    const blob = new Blob([JSON.stringify(currentSession, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-' + currentSession.code + '.json';
    a.click();
    URL.revokeObjectURL(url);
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
