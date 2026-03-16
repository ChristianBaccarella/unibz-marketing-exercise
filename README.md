# unibz Marketing Fundamentals Exercise App

Interactive Marketing Fundamentals learning application for students at unibz.

## Features

### Student Interface (`index.html`)
- 90-minute countdown timer with pause/resume
- Three interactive exercises in German:
  1. **Nutzenversprechen** – Analyse Apple, Spotify, dm, Ryanair, Airbnb, IKEA
  2. **IKEA Mini-Fallstudie** – Business model and customer orientation
  3. **Starbucks Fallanalyse** – Experience marketing and CRM
- Auto-save progress to browser localStorage
- Gamification: points, achievement badges
- Export: PDF print, JSON download, QR code, shareable links
- Fully responsive (mobile, tablet, desktop)
- All text in German, unibz branding

### Teacher Dashboard (`teacher.html`)
- Create unique class sessions with session codes
- Live real-time monitoring of student progress
- Statistics: total students, completed exercises, average scores
- Individual student tracking: name, progress, points, status
- Progress distribution chart
- Session QR code generation
- Export class data as CSV/JSON
- Auto-refreshes every 5 seconds

## File Structure

```
unibz-marketing-exercise/
├── index.html                  ← Student interface
├── teacher.html                ← Teacher dashboard
├── assets/
│   ├── styles.css              ← Global styles (unibz branding)
│   └── teacher-dashboard.css  ← Teacher-specific styles
├── js/
│   ├── config.js               ← Configuration & badge definitions
│   ├── storage.js              ← LocalStorage management
│   ├── gamification.js         ← Points & badge system
│   ├── app.js                  ← Student app logic
│   └── teacher.js              ← Teacher dashboard logic
├── README.md
├── SETUP.md                    ← German setup guide
└── package.json
```

## Quick Start

1. Enable GitHub Pages (Settings → Pages → Deploy from branch: main)
2. Open student link: `https://christianbaccarella.github.io/unibz-marketing-exercise/`
3. Open teacher link: `https://christianbaccarella.github.io/unibz-marketing-exercise/teacher.html`

See [SETUP.md](SETUP.md) for detailed German setup instructions.

## Important Limitation

> **Note:** The teacher dashboard uses `localStorage` for data storage. This means students and the teacher must use **the same browser on the same device** for the live monitoring to work. For a real classroom with multiple devices, Firebase integration (described in `SETUP.md`) would be needed.

## Colors

- Blue: `#007BE2`
- Gray: `#393939`
- White: `#FFFFFF`

## Tech Stack

- Vanilla HTML/CSS/JavaScript — no build tools required
- Works offline after initial page load
- localStorage for data persistence
- No login or authentication required
