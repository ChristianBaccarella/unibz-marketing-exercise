/**
 * unibz Marketing Exercise - Configuration
 */

const CONFIG = {
  APP_NAME: 'unibz Marketing Fundamentals',
  VERSION: '1.0.0',

  // Timer settings (in seconds)
  EXAM_DURATION: 90 * 60,

  // Points per answer
  POINTS: {
    SHORT_ANSWER: 10,
    LONG_ANSWER: 20,
    COMPLETION_BONUS: 50,
    LONG_ANSWER_THRESHOLD: 60
  },

  // Badge definitions
  BADGES: [
    {
      id: 'first_answer',
      name: 'Erster Schritt',
      description: 'Erste Antwort gegeben',
      icon: '🌟',
      threshold: 1,
      type: 'answers'
    },
    {
      id: 'five_answers',
      name: 'Fleißig',
      description: '5 Antworten gegeben',
      icon: '📝',
      threshold: 5,
      type: 'answers'
    },
    {
      id: 'ten_answers',
      name: 'Engagiert',
      description: '10 Antworten gegeben',
      icon: '💪',
      threshold: 10,
      type: 'answers'
    },
    {
      id: 'hundred_points',
      name: 'Hundert Punkte',
      description: '100 Punkte erreicht',
      icon: '🏅',
      threshold: 100,
      type: 'points'
    },
    {
      id: 'two_fifty_points',
      name: 'Highscorer',
      description: '250 Punkte erreicht',
      icon: '🥇',
      threshold: 250,
      type: 'points'
    },
    {
      id: 'exercise1_complete',
      name: 'Nutzenversprechen-Experte',
      description: 'Übung 1 abgeschlossen',
      icon: '✅',
      threshold: 1,
      type: 'exercise1'
    },
    {
      id: 'exercise2_complete',
      name: 'IKEA-Kenner',
      description: 'Übung 2 abgeschlossen',
      icon: '🛒',
      threshold: 1,
      type: 'exercise2'
    },
    {
      id: 'exercise3_complete',
      name: 'Starbucks-Stratege',
      description: 'Übung 3 abgeschlossen',
      icon: '☕',
      threshold: 1,
      type: 'exercise3'
    },
    {
      id: 'all_complete',
      name: 'Marketing-Meister',
      description: 'Alle Übungen abgeschlossen',
      icon: '🎓',
      threshold: 3,
      type: 'exercises_done'
    }
  ],

  // Storage keys
  STORAGE: {
    STUDENT_DATA: 'unibz_student_data',
    SESSION_CODE: 'unibz_session_code',
    TEACHER_SESSIONS: 'unibz_teacher_sessions'
  },

  // Total question count for progress calculation
  TOTAL_QUESTIONS: 20,

  // Dashboard auto-refresh interval (ms)
  REFRESH_INTERVAL: 5000,
  FIREBASE: {
    enabled: false,
    apiKey: '',
    authDomain: '',
    projectId: '',
    databaseURL: ''
  },

  // Exercise definitions
  EXERCISES: {
    1: {
      title: 'Übung 1: Nutzenversprechen',
      companies: ['Apple', 'Spotify', 'dm', 'Ryanair', 'Airbnb', 'IKEA']
    },
    2: {
      title: 'Übung 2: IKEA Mini-Fallstudie'
    },
    3: {
      title: 'Übung 3: Starbucks Fallanalyse'
    }
  }
};

// Freeze to prevent accidental mutation
Object.freeze(CONFIG);
