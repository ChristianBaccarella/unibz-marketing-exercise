/**
 * unibz Marketing Exercise - Storage Manager
 * Handles all localStorage operations with optional Firebase sync
 */

const Storage = (function () {
  // ── Private helpers ──────────────────────────────────────────────────────

  function _key(k) {
    return CONFIG.STORAGE[k] || k;
  }

  function _save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage: could not save', key, e);
    }
  }

  function _load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // ── Student data ─────────────────────────────────────────────────────────

  function getDefaultStudentData() {
    return {
      studentId: 'student_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      studentName: '',
      sessionCode: '',
      startTime: null,
      lastSaved: null,
      timerRemaining: CONFIG.EXAM_DURATION,
      timerRunning: false,
      answers: {},
      points: 0,
      badges: [],
      answersCount: 0,
      exercisesCompleted: [],
      exercise1Done: false,
      exercise2Done: false,
      exercise3Done: false
    };
  }

  function loadStudentData() {
    return _load(_key('STUDENT_DATA'), getDefaultStudentData());
  }

  function saveStudentData(data) {
    data.lastSaved = Date.now();
    _save(_key('STUDENT_DATA'), data);
  }

  function clearStudentData() {
    localStorage.removeItem(_key('STUDENT_DATA'));
  }

  // ── Answer helpers ────────────────────────────────────────────────────────

  function saveAnswer(questionId, value, studentData) {
    studentData.answers[questionId] = {
      value: value,
      savedAt: Date.now()
    };
    saveStudentData(studentData);
    return studentData;
  }

  function loadAnswer(questionId, studentData) {
    return studentData.answers[questionId] ? studentData.answers[questionId].value : '';
  }

  // ── Session code ──────────────────────────────────────────────────────────

  function saveSessionCode(code) {
    _save(_key('SESSION_CODE'), code);
  }

  function loadSessionCode() {
    return _load(_key('SESSION_CODE'), null);
  }

  // ── Teacher sessions ──────────────────────────────────────────────────────

  function loadTeacherSessions() {
    return _load(_key('TEACHER_SESSIONS'), {});
  }

  function saveTeacherSession(sessionCode, sessionData) {
    const sessions = loadTeacherSessions();
    sessions[sessionCode] = sessionData;
    _save(_key('TEACHER_SESSIONS'), sessions);
  }

  function getTeacherSession(sessionCode) {
    const sessions = loadTeacherSessions();
    return sessions[sessionCode] || null;
  }

  function deleteTeacherSession(sessionCode) {
    const sessions = loadTeacherSessions();
    delete sessions[sessionCode];
    _save(_key('TEACHER_SESSIONS'), sessions);
  }

  // ── Student registry in a session ────────────────────────────────────────

  function registerStudentInSession(sessionCode, studentData) {
    const session = getTeacherSession(sessionCode);
    if (!session) return;

    if (!session.students) session.students = {};
    // Use a stable unique key (stored in studentData) to avoid collisions with same-name students
    const key = studentData.studentId || studentData.studentName || 'Anonym_' + Date.now();
    session.students[key] = {
      name: studentData.studentName,
      points: studentData.points,
      answersCount: studentData.answersCount,
      exercisesCompleted: studentData.exercisesCompleted,
      progress: calculateProgress(studentData),
      lastSeen: Date.now(),
      badges: studentData.badges.length
    };
    saveTeacherSession(sessionCode, session);
  }

  function calculateProgress(studentData) {
    const answered = Object.keys(studentData.answers || {}).length;
    return Math.min(100, Math.round((answered / CONFIG.TOTAL_QUESTIONS) * 100));
  }

  // ── Export ────────────────────────────────────────────────────────────────

  return {
    getDefaultStudentData,
    loadStudentData,
    saveStudentData,
    clearStudentData,
    saveAnswer,
    loadAnswer,
    saveSessionCode,
    loadSessionCode,
    loadTeacherSessions,
    saveTeacherSession,
    getTeacherSession,
    deleteTeacherSession,
    registerStudentInSession,
    calculateProgress
  };
})();
