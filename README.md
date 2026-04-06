# CCS Comprehensive Profiling System — Firebase Edition
**Pamantasan ng Cabuyao · College of Computing Studies**

> Full React SPA powered entirely by Firebase — no backend server required.

---

## Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v6 |
| Auth | Firebase Authentication (Email/Password + Custom Claims) |
| Database | Cloud Firestore (NoSQL) |
| File Storage | Firebase Storage |
| Hosting | Firebase Hosting (free CDN) |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Firebase config to src/config/firebase.js

# 3. Seed Firestore with all faculty + sample data
node src/config/seedFirestore.js

# 4. Deploy security rules
firebase deploy --only firestore:rules,firestore:indexes,storage

# 5. Run locally
npm start

# 6. Deploy to Firebase Hosting
npm run deploy
```

See **SETUP_GUIDE.md** for full step-by-step instructions.

---

## Demo Login

| Role | Email | Password |
|---|---|---|
| Admin | gbmontecillo@pnc.edu.ph | Admin@2024 |
| Faculty | eamagaling@pnc.edu.ph | Faculty@2024 |
| Student | 2021-00001@pnc.edu.ph | Student@2024 |

---

## File Structure
```
ccs-firebase/
├── public/index.html
├── src/
│   ├── App.jsx                         ← Root router
│   ├── index.js / index.css
│   ├── config/
│   │   ├── firebase.js                 ← Firebase SDK init ⚠️ Add your config here
│   │   └── seedFirestore.js            ← Run once to populate Firestore
│   ├── context/AuthContext.jsx         ← Firebase Auth state
│   ├── hooks/useFirestore.js           ← Data-fetching hook
│   ├── services/firebase.services.js  ← All Firestore + Storage operations
│   ├── components/
│   │   ├── common/index.jsx            ← Shared UI components
│   │   └── layout/Sidebar + AppLayout
│   └── pages/
│       ├── auth/Login.jsx
│       ├── AllPages.jsx                ← All Admin/Faculty/Student pages
│       └── shared/Schedule.jsx
├── firestore.rules                     ← Security rules
├── firestore.indexes.json              ← Composite indexes
├── storage.rules                       ← Storage security rules
├── firebase.json                       ← Hosting + Firestore + Storage config
└── SETUP_GUIDE.md
```
