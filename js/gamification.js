/**
 * unibz Marketing Exercise - Gamification System
 * Manages points, badges, and progress visualization
 */

const Gamification = (function () {
  // ── Internal state ────────────────────────────────────────────────────────
  let _data = null;
  let _onUpdate = null; // callback(data)

  function init(studentData, onUpdateCallback) {
    _data = studentData;
    _onUpdate = onUpdateCallback || function () {};
  }

  // ── Points ────────────────────────────────────────────────────────────────

  function addPoints(questionId, value) {
    if (!_data) return;

    // Only award points once per question
    if (_data.answers[questionId] && _data.answers[questionId].pointsAwarded) return;

    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return;

    const pts = text.length > CONFIG.POINTS.LONG_ANSWER_THRESHOLD ? CONFIG.POINTS.LONG_ANSWER : CONFIG.POINTS.SHORT_ANSWER;
    _data.points = (_data.points || 0) + pts;
    _data.answersCount = (_data.answersCount || 0) + 1;

    if (_data.answers[questionId]) {
      _data.answers[questionId].pointsAwarded = pts;
    }

    _checkBadges();
    Storage.saveStudentData(_data);
    _onUpdate(_data);

    return pts;
  }

  function getPoints() {
    return _data ? _data.points : 0;
  }

  // ── Exercise completion ───────────────────────────────────────────────────

  function markExerciseComplete(exerciseNumber) {
    if (!_data) return;
    const key = 'exercise' + exerciseNumber + 'Done';
    if (_data[key]) return; // already done

    _data[key] = true;
    if (!_data.exercisesCompleted.includes(exerciseNumber)) {
      _data.exercisesCompleted.push(exerciseNumber);
    }
    _data.points = (_data.points || 0) + CONFIG.POINTS.COMPLETION_BONUS;

    _checkBadges();
    Storage.saveStudentData(_data);
    _onUpdate(_data);
  }

  function getCompletedExercises() {
    return _data ? _data.exercisesCompleted : [];
  }

  // ── Badge checking ────────────────────────────────────────────────────────

  function _checkBadges() {
    if (!_data) return;

    CONFIG.BADGES.forEach(function (badge) {
      if (_data.badges.includes(badge.id)) return; // already earned

      let earned = false;
      switch (badge.type) {
        case 'answers':
          earned = _data.answersCount >= badge.threshold;
          break;
        case 'points':
          earned = _data.points >= badge.threshold;
          break;
        case 'exercise1':
          earned = !!_data.exercise1Done;
          break;
        case 'exercise2':
          earned = !!_data.exercise2Done;
          break;
        case 'exercise3':
          earned = !!_data.exercise3Done;
          break;
        case 'exercises_done':
          earned = _data.exercisesCompleted.length >= badge.threshold;
          break;
      }

      if (earned) {
        _data.badges.push(badge.id);
        _showBadgeNotification(badge);
      }
    });
  }

  function _showBadgeNotification(badge) {
    const toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML =
      '<span class="badge-toast-icon">' + badge.icon + '</span>' +
      '<div><strong>Badge freigeschaltet!</strong><br>' + badge.name + '</div>';
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('badge-toast--visible');
    }, 50);
    setTimeout(function () {
      toast.classList.remove('badge-toast--visible');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3000);
  }

  // ── Progress calculation ──────────────────────────────────────────────────

  function calculateOverallProgress(studentData) {
    const answered = Object.keys(studentData.answers || {}).length;
    return Math.min(100, Math.round((answered / CONFIG.TOTAL_QUESTIONS) * 100));
  }

  // ── Render badge wall ─────────────────────────────────────────────────────

  function renderBadges(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !_data) return;

    container.innerHTML = CONFIG.BADGES.map(function (badge) {
      const earned = _data.badges.includes(badge.id);
      return '<div class="badge-item' + (earned ? ' badge-item--earned' : ' badge-item--locked') + '" title="' + badge.description + '">' +
        '<span class="badge-icon">' + badge.icon + '</span>' +
        '<span class="badge-name">' + badge.name + '</span>' +
        '</div>';
    }).join('');
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    init: init,
    addPoints: addPoints,
    getPoints: getPoints,
    markExerciseComplete: markExerciseComplete,
    getCompletedExercises: getCompletedExercises,
    calculateOverallProgress: calculateOverallProgress,
    renderBadges: renderBadges
  };
})();
