# CCS Profiling System — Firebase Setup Guide
**Pamantasan ng Cabuyao · College of Computing Studies**
**Stack: React + Firebase (Auth + Firestore + Storage + Hosting)**

---

## What's Included

| Service | Purpose |
|---|---|
| **Firebase Authentication** | Role-based login (Admin, Faculty, Student) |
| **Firestore** | NoSQL database — replaces MySQL entirely |
| **Firebase Storage** | Profile pics, module uploads, research files |
| **Firebase Hosting** | Free global CDN hosting for the React app |

---

## Step 1 — Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `ccs-profiling-pnc` (or anything you like)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

## Step 2 — Enable Firebase Services

### Authentication
1. In Firebase Console → **Build → Authentication → Get started**
2. Under **Sign-in method** → Enable **Email/Password**
3. Click Save

### Firestore Database
1. **Build → Firestore Database → Create database**
2. Choose **"Start in production mode"**
3. Select a region close to you (e.g. `asia-southeast1` for Philippines)
4. Click **"Enable"**

### Storage
1. **Build → Storage → Get started**
2. Start in **production mode**
3. Same region as Firestore
4. Click **Done**

---

## Step 3 — Get Your Firebase Config

1. In Firebase Console → **Project Settings** (gear icon)
2. Under **"Your apps"** → Click **"</>"** (Web)
3. Register app name: `CCS Web App`
4. **Copy the config object**

Open `src/config/firebase.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey:            "YOUR_ACTUAL_API_KEY",
  authDomain:        "ccs-profiling-pnc.firebaseapp.com",
  projectId:         "ccs-profiling-pnc",
  storageBucket:     "ccs-profiling-pnc.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

---

## Step 4 — Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

---

## Step 5 — Initialize Firebase in Your Project

```bash
cd ccs-firebase
firebase init
```

When prompted:
- Select: **Firestore**, **Storage**, **Hosting**
- Use existing project → select your project
- Firestore rules: use `firestore.rules` ✅
- Firestore indexes: use `firestore.indexes.json` ✅
- Storage rules: use `storage.rules` ✅
- Hosting public directory: **`build`**
- Single-page app: **Yes**
- Overwrite index.html: **No**

---

## Step 6 — Install Dependencies & Seed the Database

```bash
npm install

# Install firebase-admin for seeding (one-time setup)
npm install --save-dev firebase-admin
```

### Get your Service Account Key
1. Firebase Console → **Project Settings → Service Accounts**
2. Click **"Generate new private key"**
3. Save the downloaded file as:
   ```
   src/config/serviceAccountKey.json
   ```
   ⚠️ This file is in `.gitignore` — never commit it!

### Run the seed script
```bash
node src/config/seedFirestore.js
```

This will:
- Create **4 departments** (CS, IT, IS, DS)
- Create all **24 CCS faculty members** with real emails
- Create **8 sample students**
- Create **8 subjects**, **8 schedules**, **5 events**
- Create **Firebase Auth accounts** for all demo users
- Set **custom claims** (role + linkedId) on each account

---

## Step 7 — Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## Step 8 — Run Locally

```bash
npm start
```

Open **http://localhost:3000**

---

## Step 9 — Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at:
`https://ccs-profiling-pnc.web.app`

Or deploy everything at once:
```bash
npm run deploy
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin (Dean)** | gbmontecillo@pnc.edu.ph | Admin@2024 |
| **Faculty (Dept Chair CS)** | eamagaling@pnc.edu.ph | Faculty@2024 |
| **Faculty (Dept Chair IT)** | acquiatchon@pnc.edu.ph | Faculty@2024 |
| **Faculty (HCI)** | madimaculangan@pnc.edu.ph | Faculty@2024 |
| **Faculty (AI)** | lmeusebio@pnc.edu.ph | Faculty@2024 |
| **Student** | 2021-00001@pnc.edu.ph | Student@2024 |
| **Student** | 2021-00002@pnc.edu.ph | Student@2024 |
| **Student** | 2021-00006@pnc.edu.ph | Student@2024 |

---

## How Firebase Replaces the Express Backend

| Old (Express + MySQL) | New (Firebase) |
|---|---|
| `POST /api/auth/login` | `signInWithEmailAndPassword()` |
| `GET /api/students` | `getDocs(query(collection…))` |
| `PUT /api/students/:id` | `updateDoc(docRef…)` |
| `POST /api/modules` (file upload) | `uploadBytesResumable()` + `addDoc()` |
| `GET /api/grades/schedule/:id` | `getDocs(where("schedId","==",id))` |
| Role guards (JWT middleware) | Firebase Custom Claims (role, linkedId) |
| MySQL schema | Firestore collections (schema-less) |
| Multer file uploads | Firebase Storage |
| MySQL seed.sql | `seedFirestore.js` (Admin SDK) |

---

## Firestore Collections

| Collection | Description |
|---|---|
| `users` | Auth user profiles (uid → role + linkedId) |
| `departments` | CS, IT, IS, DS |
| `faculty` | All 24 CCS faculty members |
| `students` | Student records |
| `studentActivities` | Sports, pageants, org memberships |
| `awards` | Student awards |
| `violations` | Student violations (admin-only) |
| `organizations` | Student orgs |
| `subjects` | Subject catalog |
| `curriculum` | Program of study per course |
| `schedules` | Class schedules |
| `enrollments` | Student ↔ schedule enrollment |
| `grades` | Prelim / Midterm / Finals per student per subject |
| `modules` | Uploaded course materials |
| `research` | Faculty publications |
| `events` | College events |
| `eventParticipants` | Event registration |
| `facultyAwards` | Faculty recognitions |

---

## Security Rules Summary

- **Admin** — full read/write on all collections
- **Faculty** — read all, write their own profile + students' grades + their own modules
- **Student** — read their own profile/grades/schedule only, write their own activities
- **Violations** — admin-only read and write
- **Unauthenticated** — no access to any collection

---

## Firebase Free Tier (Spark Plan) Limits

| Resource | Free Limit |
|---|---|
| Firestore reads | 50,000 / day |
| Firestore writes | 20,000 / day |
| Storage | 5 GB |
| Hosting bandwidth | 10 GB / month |
| Authentication | Unlimited |

For a college system, the free tier is more than enough. Upgrade to **Blaze (pay-as-you-go)** only when needed.

---

## Troubleshooting

**"Missing or insufficient permissions"**
→ Run `firebase deploy --only firestore:rules` to deploy the security rules.

**Login works but role is undefined**
→ Run the seed script again — it sets custom claims via Admin SDK. Claims take effect on next login or token refresh.

**Seeding fails with "auth/email-already-exists"**
→ That's fine — the script skips existing accounts. Your data was already seeded.

**React app shows blank page after deploy**
→ Make sure `firebase.json` has `"rewrites": [{"source":"**","destination":"/index.html"}]`. This is already set.

**Storage upload fails**
→ Check that Storage rules are deployed: `firebase deploy --only storage`

**Firestore indexes error**
→ Run `firebase deploy --only firestore:indexes`
