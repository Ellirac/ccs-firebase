// src/config/seedFirestore.js
// ─── Run this ONCE to populate Firestore with initial data ────────────────────
// Usage: node src/config/seedFirestore.js
// Prerequisites: Install firebase-admin → npm install firebase-admin
// Download your service account key from Firebase Console → Project Settings
//   → Service Accounts → Generate new private key → save as serviceAccountKey.json

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // <-- put your key here

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db   = admin.firestore();
const auth = admin.auth();

// ─── DATA ────────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { id: "CS", deptName: "Computer Science",       abbr: "CS", colorHex: "#3B82F6" },
  { id: "IT", deptName: "Information Technology", abbr: "IT", colorHex: "#10B981" },
  { id: "IS", deptName: "Information Systems",    abbr: "IS", colorHex: "#F59E0B" },
  { id: "DS", deptName: "Data Science",           abbr: "DS", colorHex: "#8B5CF6" },
];

const FACULTY = [
  { id:"FAC-001", lastName:"Montecillo",    firstName:"Gima",              middleInitial:"B.", title:"Dr.",        position:"dean",       deptId:"CS", email:"gbmontecillo@pnc.edu.ph", specialization:"Computer Science & Administration",  publications:15, yearsInService:20 },
  { id:"FAC-002", lastName:"Magaling",      firstName:"Evangelina",        middleInitial:"A.", title:"Asst. Prof.",position:"dept_chair", deptId:"CS", email:"eamagaling@pnc.edu.ph",   specialization:"Software Engineering",               publications:8,  yearsInService:14 },
  { id:"FAC-003", lastName:"Quiatchon",     firstName:"Arcelito",          middleInitial:"C.", title:"Asst. Prof.",position:"dept_chair", deptId:"IT", email:"acquiatchon@pnc.edu.ph",  specialization:"Network Administration",             publications:6,  yearsInService:12 },
  { id:"FAC-004", lastName:"Gaviola",       firstName:"Gia Mae",           middleInitial:"L.", title:"",           position:"secretary",  deptId:"CS", email:"gmlgaviola@pnc.edu.ph",   specialization:"College Administration",             publications:0,  yearsInService:8  },
  { id:"FAC-005", lastName:"Aquino",        firstName:"Angelica",          middleInitial:"M.", title:"Asst. Prof.",position:"permanent",  deptId:"IT", email:"amaquino@pnc.edu.ph",     specialization:"Web Technologies",                   publications:4,  yearsInService:9  },
  { id:"FAC-006", lastName:"Bana",          firstName:"Christian",         middleInitial:"M.", title:"Asst. Prof.",position:"permanent",  deptId:"CS", email:"cmbana@pnc.edu.ph",       specialization:"Algorithms & Data Structures",       publications:3,  yearsInService:7  },
  { id:"FAC-007", lastName:"Cartagenas",    firstName:"Joseph",            middleInitial:"D.", title:"Asst. Prof.",position:"permanent",  deptId:"IT", email:"jdcartagenas@pnc.edu.ph", specialization:"Database Systems",                   publications:5,  yearsInService:10 },
  { id:"FAC-008", lastName:"Dela Cruz",     firstName:"Ramiro",            middleInitial:"Z.", title:"Asst. Prof.",position:"permanent",  deptId:"CS", email:"ramdcz@pnc.edu.ph",       specialization:"Operating Systems",                  publications:3,  yearsInService:8  },
  { id:"FAC-009", lastName:"Dimaculangan",  firstName:"Melissa",           middleInitial:"A.", title:"Asst. Prof.",position:"permanent",  deptId:"IT", email:"madimaculangan@pnc.edu.ph",specialization:"Human-Computer Interaction",         publications:4,  yearsInService:9  },
  { id:"FAC-010", lastName:"Eusebio",       firstName:"Luvim",             middleInitial:"M.", title:"Asst. Prof.",position:"permanent",  deptId:"CS", email:"lmeusebio@pnc.edu.ph",    specialization:"Artificial Intelligence",            publications:6,  yearsInService:11 },
  { id:"FAC-011", lastName:"Hablanida",     firstName:"Fe",                middleInitial:"L.", title:"Asst. Prof.",position:"permanent",  deptId:"IT", email:"fhablanida@pnc.edu.ph",   specialization:"Network Security",                   publications:5,  yearsInService:10 },
  { id:"FAC-012", lastName:"Ogalesco",      firstName:"John Patrick",      middleInitial:"M.", title:"Asst. Prof.",position:"permanent",  deptId:"CS", email:"jpmogalesco@pnc.edu.ph",  specialization:"Software Development",               publications:4,  yearsInService:8  },
  { id:"FAC-013", lastName:"Tan",           firstName:"Janus Raymond",     middleInitial:"C.", title:"Asst. Prof.",position:"permanent",  deptId:"IT", email:"jrtan@pnc.edu.ph",        specialization:"Mobile Development",                 publications:3,  yearsInService:7  },
  { id:"FAC-014", lastName:"Alforja",       firstName:"Albert",            middleInitial:"",   title:"Instr.",     position:"ft_cos",     deptId:"IT", email:"aqalforja@pnc.edu.ph",    specialization:"Information Technology",             publications:1,  yearsInService:4  },
  { id:"FAC-015", lastName:"Bicua",         firstName:"Marvin",            middleInitial:"H.", title:"Instr.",     position:"ft_cos",     deptId:"CS", email:"MBicua66@pnc.edu.ph",     specialization:"Computer Science",                   publications:1,  yearsInService:3  },
  { id:"FAC-016", lastName:"Pregonero",     firstName:"Sairine",           middleInitial:"C.", title:"Instr.",     position:"ft_cos",     deptId:"IT", email:"scpregonero@pnc.edu.ph",  specialization:"Information Technology",             publications:0,  yearsInService:3  },
  { id:"FAC-017", lastName:"Rebana",        firstName:"Kristel",           middleInitial:"O.", title:"Instr.",     position:"ft_cos",     deptId:"CS", email:"korebana@pnc.edu.ph",     specialization:"Computer Science",                   publications:0,  yearsInService:2  },
  { id:"FAC-018", lastName:"Benco",         firstName:"Roselle",           middleInitial:"R.", title:"Instr.",     position:"part_time",  deptId:"IT", email:"rosebenco@pnc.edu.ph",    specialization:"Information Technology",             publications:0,  yearsInService:2  },
  { id:"FAC-019", lastName:"Capuno",        firstName:"Ma. Emmalyn Asuncion",middleInitial:"",title:"Instr.",     position:"part_time",  deptId:"CS", email:"meacapuno@pnc.edu.ph",    specialization:"Computer Science",                   publications:0,  yearsInService:2  },
  { id:"FAC-020", lastName:"Evangelista",   firstName:"Renzo",             middleInitial:"F.", title:"Instr.",     position:"part_time",  deptId:"IT", email:"rfevangelista@pnc.edu.ph",specialization:"Information Technology",             publications:0,  yearsInService:1  },
  { id:"FAC-021", lastName:"Morano",        firstName:"Carissa",           middleInitial:"C.", title:"Instr.",     position:"part_time",  deptId:"CS", email:"ccmorano@pnc.edu.ph",     specialization:"Computer Science",                   publications:0,  yearsInService:2  },
  { id:"FAC-022", lastName:"Orozco",        firstName:"Mc Austine Philip", middleInitial:"M.", title:"Instr.",     position:"part_time",  deptId:"IT", email:"mcorozco@pnc.edu.ph",     specialization:"Information Technology",             publications:0,  yearsInService:1  },
  { id:"FAC-023", lastName:"Rodriguez",     firstName:"Mildred De",        middleInitial:"O.", title:"Instr.",     position:"part_time",  deptId:"CS", email:"mdrodriguez@pnc.edu.ph",  specialization:"Computer Science",                   publications:0,  yearsInService:2  },
  { id:"FAC-024", lastName:"Virtucio",      firstName:"Ronnel",            middleInitial:"",   title:"Instr.",     position:"part_time",  deptId:"IT", email:"rvirtucio@pnc.edu.ph",    specialization:"Information Technology",             publications:0,  yearsInService:1  },
];

const STUDENTS = [
  { id:"STU-001", lastName:"Santos",     firstName:"Miguel",  middleName:"Reyes",  deptId:"CS", course:"BS CS", yearLevel:4, section:"3CS-A", email:"2021-00001@pnc.edu.ph", birthday:"2002-03-15", gender:"Male",   bloodType:"O+",  scholarship:"Academic Scholar", isOfficer:false, isAthlete:true,  isBeautyCandidate:false, guardian:"Maria Santos",   guardianContact:"0917-100-1000" },
  { id:"STU-002", lastName:"Cruz",       firstName:"Angela",  middleName:"Dela",   deptId:"IT", course:"BS IT", yearLevel:3, section:"2IT-A", email:"2021-00002@pnc.edu.ph", birthday:"2003-07-22", gender:"Female", bloodType:"A+",  scholarship:"DOST Scholar",     isOfficer:true,  isAthlete:true,  isBeautyCandidate:true,  guardian:"Pedro Cruz",     guardianContact:"0917-100-1003" },
  { id:"STU-003", lastName:"Reyes",      firstName:"Julio",   middleName:"Santos", deptId:"IS", course:"BS IS", yearLevel:2, section:"2IS-A", email:"2021-00003@pnc.edu.ph", birthday:"2004-11-05", gender:"Male",   bloodType:"B+",  scholarship:"None",             isOfficer:false, isAthlete:true,  isBeautyCandidate:false, guardian:"Elena Reyes",    guardianContact:"0917-100-1005" },
  { id:"STU-004", lastName:"Lim",        firstName:"Bianca",  middleName:"Garcia", deptId:"CS", course:"BS CS", yearLevel:4, section:"3CS-B", email:"2021-00004@pnc.edu.ph", birthday:"2002-01-30", gender:"Female", bloodType:"AB+", scholarship:"Full Merit",       isOfficer:true,  isAthlete:true,  isBeautyCandidate:true,  guardian:"Henry Lim",      guardianContact:"0917-100-1007" },
  { id:"STU-005", lastName:"Villanueva", firstName:"Renz",    middleName:"Ocampo", deptId:"CS", course:"BS CS", yearLevel:1, section:"1CS-A", email:"2021-00005@pnc.edu.ph", birthday:"2005-09-14", gender:"Male",   bloodType:"O-",  scholarship:"None",             isOfficer:false, isAthlete:true,  isBeautyCandidate:false, guardian:"Lita Villanueva",guardianContact:"0917-100-1009" },
  { id:"STU-006", lastName:"Tan",        firstName:"Sophia",  middleName:"Chua",   deptId:"IT", course:"BS IT", yearLevel:4, section:"3IT-A", email:"2021-00006@pnc.edu.ph", birthday:"2002-05-18", gender:"Female", bloodType:"A-",  scholarship:"Academic Scholar", isOfficer:true,  isAthlete:false, isBeautyCandidate:true,  guardian:"Cynthia Tan",    guardianContact:"0917-100-1011" },
  { id:"STU-007", lastName:"Bautista",   firstName:"Nico",    middleName:"Marco",  deptId:"CS", course:"BS CS", yearLevel:3, section:"2CS-A", email:"2021-00007@pnc.edu.ph", birthday:"2003-12-01", gender:"Male",   bloodType:"B-",  scholarship:"Indigent Scholar", isOfficer:false, isAthlete:true,  isBeautyCandidate:false, guardian:"Perla Bautista", guardianContact:"0917-100-1013" },
  { id:"STU-008", lastName:"Mendoza",    firstName:"Kayla",   middleName:"Flores", deptId:"CS", course:"BS CS", yearLevel:2, section:"1CS-B", email:"2021-00008@pnc.edu.ph", birthday:"2004-08-27", gender:"Female", bloodType:"AB-", scholarship:"None",             isOfficer:false, isAthlete:true,  isBeautyCandidate:true,  guardian:"Roy Mendoza",    guardianContact:"0917-100-1015" },
];

const SUBJECTS = [
  { id:"CS201", subjectCode:"CS 201", subjectTitle:"Data Structures & Algorithms", units:3, deptId:"CS", yearLevel:2, semester:"1st" },
  { id:"CS301", subjectCode:"CS 301", subjectTitle:"Software Engineering",         units:3, deptId:"CS", yearLevel:3, semester:"1st" },
  { id:"CS405", subjectCode:"CS 405", subjectTitle:"Artificial Intelligence",      units:3, deptId:"CS", yearLevel:4, semester:"2nd" },
  { id:"IT201", subjectCode:"IT 201", subjectTitle:"Web Development",              units:3, deptId:"IT", yearLevel:2, semester:"1st" },
  { id:"IT211", subjectCode:"IT 211", subjectTitle:"Human Computer Interaction",   units:3, deptId:"IT", yearLevel:2, semester:"2nd" },
  { id:"IT401", subjectCode:"IT 401", subjectTitle:"Cybersecurity Fundamentals",   units:3, deptId:"IT", yearLevel:4, semester:"1st" },
  { id:"IS302", subjectCode:"IS 302", subjectTitle:"Database Management",          units:3, deptId:"IS", yearLevel:3, semester:"1st" },
  { id:"DS401", subjectCode:"DS 401", subjectTitle:"Machine Learning",             units:3, deptId:"DS", yearLevel:4, semester:"1st" },
];

const SCHEDULES = [
  { id:"SCHED-001", subjectId:"IT211", facultyId:"FAC-009", section:"2IT-A", deptId:"IT", dayOfWeek:"Mon,Wed,Fri", timeStart:"08:00", timeEnd:"09:00",   room:"CCS-101", schoolYear:"2024-2025", semester:"1st" },
  { id:"SCHED-002", subjectId:"IT211", facultyId:"FAC-009", section:"2IT-B", deptId:"IT", dayOfWeek:"Mon,Wed,Fri", timeStart:"09:00", timeEnd:"10:00",   room:"CCS-102", schoolYear:"2024-2025", semester:"1st" },
  { id:"SCHED-003", subjectId:"IT211", facultyId:"FAC-009", section:"2IT-C", deptId:"IT", dayOfWeek:"Tue,Thu",     timeStart:"10:00", timeEnd:"11:30",   room:"CCS-103", schoolYear:"2024-2025", semester:"1st" },
  { id:"SCHED-004", subjectId:"IT211", facultyId:"FAC-009", section:"2IT-D", deptId:"IT", dayOfWeek:"Tue,Thu",     timeStart:"13:00", timeEnd:"14:30",   room:"CCS-101", schoolYear:"2024-2025", semester:"1st" },
  { id:"SCHED-005", subjectId:"CS301", facultyId:"FAC-002", section:"3CS-A", deptId:"CS", dayOfWeek:"Mon,Wed,Fri", timeStart:"10:00", timeEnd:"11:00",   room:"CCS-201", schoolYear:"2024-2025", semester:"1st" },
  { id:"SCHED-006", subjectId:"CS301", facultyId:"FAC-002", section:"3CS-B", deptId:"CS", dayOfWeek:"Tue,Thu",     timeStart:"08:00", timeEnd:"09:30",   room:"CCS-202", schoolYear:"2024-2025", semester:"1st" },
  { id:"SCHED-007", subjectId:"IT401", facultyId:"FAC-011", section:"3IT-A", deptId:"IT", dayOfWeek:"Mon,Wed,Fri", timeStart:"13:00", timeEnd:"14:00",   room:"CCS-Lab1",schoolYear:"2024-2025", semester:"1st" },
  { id:"SCHED-008", subjectId:"CS405", facultyId:"FAC-010", section:"4CS-A", deptId:"CS", dayOfWeek:"Tue,Thu",     timeStart:"14:00", timeEnd:"15:30",   room:"CCS-301", schoolYear:"2024-2025", semester:"1st" },
];

const EVENTS = [
  { id:"EVT-001", title:"CCS Sportsfest 2024",    description:"Annual sports competition.",   eventType:"sports",         eventDate:"2024-03-15", venue:"University Gymnasium",  organizer:"CCS Student Council", status:"upcoming" },
  { id:"EVT-002", title:"Miss & Mr. CCS 2024",    description:"Annual beauty pageant.",       eventType:"pageant",        eventDate:"2024-03-20", venue:"University Auditorium", organizer:"CCS Student Council", status:"upcoming" },
  { id:"EVT-003", title:"CCS Research Congress",  description:"Faculty & student research.",  eventType:"academic",       eventDate:"2024-02-20", venue:"CCS Auditorium",        organizer:"CCS Research Office", status:"completed" },
  { id:"EVT-004", title:"Tech Innovation Summit", description:"Industry tech talks.",         eventType:"seminar",        eventDate:"2024-04-10", venue:"CCS Building A",        organizer:"Dean's Office",       status:"upcoming" },
  { id:"EVT-005", title:"CCS Foundation Week",    description:"CCS founding anniversary.",    eventType:"cultural",       eventDate:"2024-01-22", venue:"Campus Wide",           organizer:"CCS Administration",  status:"completed" },
];

// ─── AUTH ACCOUNTS ────────────────────────────────────────────────────────────
const AUTH_ACCOUNTS = [
  { email:"gbmontecillo@pnc.edu.ph", password:"Admin@2024",   role:"admin",   linkedId:"FAC-001", displayName:"Dr. Gima B. Montecillo"   },
  { email:"eamagaling@pnc.edu.ph",   password:"Faculty@2024", role:"faculty", linkedId:"FAC-002", displayName:"Asst. Prof. Evangelina A. Magaling" },
  { email:"acquiatchon@pnc.edu.ph",  password:"Faculty@2024", role:"faculty", linkedId:"FAC-003", displayName:"Asst. Prof. Arcelito C. Quiatchon"  },
  { email:"madimaculangan@pnc.edu.ph",password:"Faculty@2024",role:"faculty", linkedId:"FAC-009", displayName:"Asst. Prof. Melissa A. Dimaculangan" },
  { email:"lmeusebio@pnc.edu.ph",    password:"Faculty@2024", role:"faculty", linkedId:"FAC-010", displayName:"Asst. Prof. Luvim M. Eusebio"       },
  { email:"2021-00001@pnc.edu.ph",   password:"Student@2024", role:"student", linkedId:"STU-001", displayName:"Miguel Santos"  },
  { email:"2021-00002@pnc.edu.ph",   password:"Student@2024", role:"student", linkedId:"STU-002", displayName:"Angela Cruz"    },
  { email:"2021-00003@pnc.edu.ph",   password:"Student@2024", role:"student", linkedId:"STU-003", displayName:"Julio Reyes"    },
  { email:"2021-00004@pnc.edu.ph",   password:"Student@2024", role:"student", linkedId:"STU-004", displayName:"Bianca Lim"     },
  { email:"2021-00005@pnc.edu.ph",   password:"Student@2024", role:"student", linkedId:"STU-005", displayName:"Renz Villanueva"},
  { email:"2021-00006@pnc.edu.ph",   password:"Student@2024", role:"student", linkedId:"STU-006", displayName:"Sophia Tan"     },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🔥 Seeding CCS Firestore...\n");
  const batch = () => db.batch();
  let b = batch(); let count = 0;

  const commit = async () => { await b.commit(); b = batch(); count = 0; };
  const set = async (ref, data) => { b.set(ref, data); count++; if (count >= 400) await commit(); };

  // Departments
  console.log("📦 Seeding departments...");
  for (const d of DEPARTMENTS) await set(db.collection("departments").doc(d.id), d);
  await commit();

  // Faculty
  console.log("👨‍🏫 Seeding faculty...");
  for (const f of FACULTY) await set(db.collection("faculty").doc(f.id), { ...f, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  await commit();

  // Students
  console.log("🎓 Seeding students...");
  for (const s of STUDENTS) await set(db.collection("students").doc(s.id), { ...s, status:"active", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  await commit();

  // Subjects
  console.log("📚 Seeding subjects...");
  for (const sub of SUBJECTS) await set(db.collection("subjects").doc(sub.id), sub);
  await commit();

  // Schedules
  console.log("🗓️ Seeding schedules...");
  for (const sc of SCHEDULES) await set(db.collection("schedules").doc(sc.id), sc);
  await commit();

  // Events
  console.log("📅 Seeding events...");
  for (const ev of EVENTS) await set(db.collection("events").doc(ev.id), ev);
  await commit();

  // Auth accounts
  console.log("\n🔐 Creating Firebase Auth users...");
  for (const acc of AUTH_ACCOUNTS) {
    try {
      const userRecord = await auth.createUser({
        email:       acc.email,
        password:    acc.password,
        displayName: acc.displayName,
      });
      // Set custom claims for role-based access
      await auth.setCustomUserClaims(userRecord.uid, { role: acc.role, linkedId: acc.linkedId });
      // Create user doc in Firestore
      await db.collection("users").doc(userRecord.uid).set({
        email:      acc.email,
        role:       acc.role,
        linkedId:   acc.linkedId,
        displayName:acc.displayName,
        createdAt:  admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ ${acc.email} [${acc.role}]`);
    } catch (err) {
      if (err.code === "auth/email-already-exists") {
        console.log(`  ⚠️  Already exists: ${acc.email}`);
      } else {
        console.error(`  ❌ Failed: ${acc.email} —`, err.message);
      }
    }
  }

  console.log("\n✅ Seeding complete! CCS Firebase is ready.\n");
  process.exit(0);
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
