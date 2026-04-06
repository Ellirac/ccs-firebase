// src/services/firebase.services.js
// ─── All Firebase CRUD operations used throughout the app ─────────────────────
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, writeBatch,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, signOut, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, auth, storage } from "../config/firebase";

// ─── helpers ──────────────────────────────────────────────────────────────────
const col   = (name)       => collection(db, name);
const docRef= (name, id)   => doc(db, name, id);
const snap  = async (q)    => { const s = await getDocs(q); return s.docs.map(d => ({ id: d.id, ...d.data() })); };
const one   = async (ref)  => { const s = await getDoc(ref); return s.exists() ? { id: s.id, ...s.data() } : null; };

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SERVICES
// ═══════════════════════════════════════════════════════════════════════════════
export const AuthService = {
  // Login — returns Firebase user + custom claims (role, linkedId)
  login: async (email, password) => {
    const cred    = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdTokenResult(true); // force refresh to get custom claims
    const claims  = idToken.claims;
    // Fetch linked profile
    const profileCol = claims.role === "student" ? "students" : "faculty";
    const profile = await one(docRef(profileCol, claims.linkedId));
    return { user: cred.user, role: claims.role, linkedId: claims.linkedId, profile };
  },

  logout: () => signOut(auth),

  changePassword: async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
  },

  // Get fresh token with custom claims
  getRole: async () => {
    const token = await auth.currentUser?.getIdTokenResult(true);
    return token?.claims?.role || null;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const StorageService = {
  // Upload file and return download URL
  upload: (path, file, onProgress) =>
    new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const task       = uploadBytesResumable(storageRef, file);
      task.on(
        "state_changed",
        snap => onProgress && onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => { const url = await getDownloadURL(task.snapshot.ref); resolve(url); }
      );
    }),

  delete: async (url) => {
    try { await deleteObject(ref(storage, url)); } catch {}
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENT SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const DepartmentService = {
  getAll: () => snap(query(col("departments"), orderBy("abbr"))),
};

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTY SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const FacultyService = {
  getAll: (filters = {}) => {
    let q = query(col("faculty"), orderBy("lastName"));
    if (filters.deptId)   q = query(col("faculty"), where("deptId","==",filters.deptId), orderBy("lastName"));
    if (filters.position) q = query(col("faculty"), where("position","==",filters.position), orderBy("lastName"));
    return snap(q);
  },

  getById: (id) => one(docRef("faculty", id)),

  // CS and IT only (for org structure)
  getCSandIT: () => snap(query(col("faculty"), where("deptId","in",["CS","IT"]), orderBy("lastName"))),

  update: (id, data) => updateDoc(docRef("faculty", id), { ...data, updatedAt: serverTimestamp() }),

  getSchedules: (facultyId, schoolYear = "2024-2025") =>
    snap(query(col("schedules"), where("facultyId","==",facultyId), where("schoolYear","==",schoolYear))),

  getResearch: (facultyId) =>
    snap(query(col("research"), where("facultyId","==",facultyId), orderBy("publishYear","desc"))),

  getAwards: (facultyId) =>
    snap(query(col("facultyAwards"), where("facultyId","==",facultyId))),
};

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const StudentService = {
  getAll: async (filters = {}) => {
    let constraints = [];
    if (filters.deptId)           constraints.push(where("deptId","==",filters.deptId));
    if (filters.yearLevel)        constraints.push(where("yearLevel","==",parseInt(filters.yearLevel)));
    if (filters.isAthlete)        constraints.push(where("isAthlete","==",true));
    if (filters.isBeautyCandidate)constraints.push(where("isBeautyCandidate","==",true));
    if (filters.isOfficer)        constraints.push(where("isOfficer","==",true));
    const q = constraints.length
      ? query(col("students"), ...constraints, orderBy("lastName"))
      : query(col("students"), orderBy("lastName"));
    const results = await snap(q);
    // Client-side search filter
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return results.filter(st =>
        `${st.firstName} ${st.lastName} ${st.studentId || ""} ${st.section}`.toLowerCase().includes(s)
      );
    }
    if (filters.scholarship) return results.filter(s => s.scholarship && s.scholarship !== "None");
    return results;
  },

  getById: (id) => one(docRef("students", id)),

  update: (id, data) => updateDoc(docRef("students", id), { ...data, updatedAt: serverTimestamp() }),

  // Activities (sports, pageants, orgs)
  getActivities: (studentId) =>
    snap(query(col("studentActivities"), where("studentId","==",studentId))),

  addActivity: (data) =>
    addDoc(col("studentActivities"), { ...data, createdAt: serverTimestamp() }),

  // Awards
  getAwards: (studentId) =>
    snap(query(col("awards"), where("studentId","==",studentId), orderBy("awardDate","desc"))),

  addAward: (data) => addDoc(col("awards"), { ...data, createdAt: serverTimestamp() }),

  // Violations (admin only reads these)
  getViolations: (studentId) =>
    snap(query(col("violations"), where("studentId","==",studentId), orderBy("dateFiled","desc"))),

  addViolation: (data) => addDoc(col("violations"), { ...data, createdAt: serverTimestamp() }),

  // Organizations
  getOrgs: (studentId) =>
    snap(query(col("studentOrganizations"), where("studentId","==",studentId))),

  // Schedule (via enrollments → schedules)
  getSchedule: async (studentId, schoolYear = "2024-2025", semester = "1st") => {
    const enrollments = await snap(query(
      col("enrollments"),
      where("studentId","==",studentId),
      where("schoolYear","==",schoolYear),
      where("semester","==",semester)
    ));
    if (!enrollments.length) return [];
    const schedIds = enrollments.map(e => e.schedId);
    // Fetch each schedule (Firestore "in" supports up to 30 items)
    const schedules = await Promise.all(schedIds.map(id => one(docRef("schedules", id))));
    // Enrich with subject + faculty data
    const enriched = await Promise.all(schedules.filter(Boolean).map(async sc => {
      const subject = await one(docRef("subjects", sc.subjectId));
      const faculty = await one(docRef("faculty",  sc.facultyId));
      return { ...sc, subject, faculty };
    }));
    return enriched;
  },

  // Grades
  getGrades: async (studentId, schoolYear, semester, all = false) => {
    let q = query(col("grades"), where("studentId","==",studentId), orderBy("schoolYear","desc"));
    if (!all && schoolYear) q = query(col("grades"),
      where("studentId","==",studentId),
      where("schoolYear","==",schoolYear),
      where("semester","==",semester)
    );
    const grades = await snap(q);
    // Enrich with subject info
    return Promise.all(grades.map(async g => {
      const sched   = await one(docRef("schedules", g.schedId));
      const subject = sched ? await one(docRef("subjects", sched.subjectId)) : null;
      const faculty = sched ? await one(docRef("faculty",  sched.facultyId)) : null;
      return { ...g, schedule: sched, subject, faculty };
    }));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADES SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const GradesService = {
  getBySchedule: (schedId, schoolYear = "2024-2025", semester = "1st") =>
    snap(query(col("grades"),
      where("schedId","==",schedId),
      where("schoolYear","==",schoolYear),
      where("semester","==",semester)
    )),

  upsert: async (data) => {
    // Compute final grade: Prelim(30%) + Midterm(30%) + Finals(40%)
    const { prelim, midterm, finals } = data;
    let finalGrade = null, remarks = null;
    if (prelim != null && midterm != null && finals != null) {
      finalGrade = parseFloat((prelim * 0.30 + midterm * 0.30 + finals * 0.40).toFixed(2));
      remarks    = finalGrade >= 75 ? "Passed" : "Failed";
    }
    // Check if grade doc already exists
    const existing = await snap(query(col("grades"),
      where("studentId","==",data.studentId),
      where("schedId","==",data.schedId),
      where("schoolYear","==",data.schoolYear),
      where("semester","==",data.semester)
    ));
    const payload = { ...data, finalGrade, remarks, updatedAt: serverTimestamp() };
    if (existing.length) {
      await updateDoc(docRef("grades", existing[0].id), payload);
    } else {
      await addDoc(col("grades"), { ...payload, createdAt: serverTimestamp() });
    }
  },

  // Bulk upsert for saving entire class at once
  bulkUpsert: async (gradesArray) => {
    for (const g of gradesArray) await GradesService.upsert(g);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODULES SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const ModulesService = {
  getBySchedule: (schedId, visibleOnly = false) => {
    const constraints = [where("schedId","==",schedId), orderBy("weekNumber"), orderBy("createdAt")];
    if (visibleOnly) constraints.splice(1, 0, where("isVisible","==",true));
    return snap(query(col("modules"), ...constraints));
  },

  upload: async ({ schedId, title, moduleType, description, weekNumber, file, uploadedBy, onProgress }) => {
    let fileUrl = null, fileType = null, fileSize = null;
    if (file) {
      const path = `modules/${schedId}/${Date.now()}_${file.name}`;
      fileUrl    = await StorageService.upload(path, file, onProgress);
      fileType   = file.name.split(".").pop().toUpperCase();
      fileSize   = `${(file.size / 1024).toFixed(1)} KB`;
    }
    return addDoc(col("modules"), {
      schedId, title, moduleType: moduleType || "lesson",
      description, weekNumber: weekNumber || null,
      fileUrl, fileType, fileSize,
      isVisible: true, uploadedBy,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
  },

  toggleVisibility: async (id) => {
    const m = await one(docRef("modules", id));
    if (m) await updateDoc(docRef("modules", id), { isVisible: !m.isVisible, updatedAt: serverTimestamp() });
  },

  delete: async (id) => {
    const m = await one(docRef("modules", id));
    if (m?.fileUrl) await StorageService.delete(m.fileUrl);
    await deleteDoc(docRef("modules", id));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULE SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const ScheduleService = {
  getAll: async (filters = {}) => {
    let constraints = [];
    if (filters.deptId)    constraints.push(where("deptId","==",filters.deptId));
    if (filters.facultyId) constraints.push(where("facultyId","==",filters.facultyId));
    if (filters.section)   constraints.push(where("section","==",filters.section));
    constraints.push(where("schoolYear","==",filters.schoolYear || "2024-2025"));
    constraints.push(where("semester","==",filters.semester || "1st"));
    const schedules = await snap(query(col("schedules"), ...constraints));
    // Enrich with subject + faculty
    return Promise.all(schedules.map(async sc => {
      const subject = await one(docRef("subjects", sc.subjectId));
      const faculty = await one(docRef("faculty",  sc.facultyId));
      return { ...sc, subject, faculty };
    }));
  },

  create: (data) => addDoc(col("schedules"), { ...data, createdAt: serverTimestamp() }),

  update: (id, data) => updateDoc(docRef("schedules", id), { ...data, updatedAt: serverTimestamp() }),

  delete: (id) => deleteDoc(docRef("schedules", id)),

  // Get students enrolled in a specific schedule
  getEnrolledStudents: async (schedId) => {
    const enrollments = await snap(query(col("enrollments"), where("schedId","==",schedId)));
    return Promise.all(enrollments.map(e => one(docRef("students", e.studentId))));
  },

  enrollStudent: (studentId, schedId, schoolYear, semester) =>
    addDoc(col("enrollments"), { studentId, schedId, schoolYear, semester, createdAt: serverTimestamp() }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const EventsService = {
  getAll: (filters = {}) => {
    let q = query(col("events"), orderBy("eventDate", "desc"));
    if (filters.status)    q = query(col("events"), where("status","==",filters.status), orderBy("eventDate"));
    if (filters.eventType) q = query(col("events"), where("eventType","==",filters.eventType), orderBy("eventDate","desc"));
    return snap(q);
  },

  getById: (id) => one(docRef("events", id)),

  create: async ({ posterFile, ...data }) => {
    let posterUrl = null;
    if (posterFile) {
      const path = `events/${Date.now()}_${posterFile.name}`;
      posterUrl  = await StorageService.upload(path, posterFile);
    }
    return addDoc(col("events"), { ...data, posterUrl, createdAt: serverTimestamp() });
  },

  update: (id, data) => updateDoc(docRef("events", id), { ...data, updatedAt: serverTimestamp() }),

  getParticipants: async (eventId) => {
    const parts = await snap(query(col("eventParticipants"), where("eventId","==",eventId)));
    return Promise.all(parts.map(async p => {
      const student = await one(docRef("students", p.studentId));
      return { ...p, student };
    }));
  },

  addParticipant: (eventId, studentId, role = "Participant") =>
    addDoc(col("eventParticipants"), { eventId, studentId, role, registeredAt: serverTimestamp() }),

  removeParticipant: (id) => deleteDoc(docRef("eventParticipants", id)),
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const ResearchService = {
  getAll: async (filters = {}) => {
    let q = query(col("research"), orderBy("publishYear","desc"));
    if (filters.facultyId) q = query(col("research"), where("facultyId","==",filters.facultyId), orderBy("publishYear","desc"));
    if (filters.status)    q = query(col("research"), where("status","==",filters.status), orderBy("publishYear","desc"));
    const results = await snap(q);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return results.filter(r => r.title.toLowerCase().includes(s));
    }
    return results;
  },

  create: async ({ file, ...data }) => {
    let fileUrl = null;
    if (file) {
      const path = `research/${Date.now()}_${file.name}`;
      fileUrl    = await StorageService.upload(path, file);
    }
    const ref = await addDoc(col("research"), { ...data, fileUrl, createdAt: serverTimestamp() });
    // Increment faculty publication count if published
    if (data.status === "published" && data.facultyId) {
      const fac = await one(docRef("faculty", data.facultyId));
      if (fac) await updateDoc(docRef("faculty", data.facultyId), { publications: (fac.publications || 0) + 1 });
    }
    return ref;
  },

  update: (id, data) => updateDoc(docRef("research", id), { ...data, updatedAt: serverTimestamp() }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURRICULUM SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const CurriculumService = {
  getSubjects: async (filters = {}) => {
    let q = query(col("subjects"), orderBy("subjectCode"));
    if (filters.deptId) q = query(col("subjects"), where("deptId","==",filters.deptId), orderBy("subjectCode"));
    const results = await snap(q);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return results.filter(sub => sub.subjectTitle.toLowerCase().includes(s) || sub.subjectCode.toLowerCase().includes(s));
    }
    return results;
  },

  getCurriculum: (filters = {}) => {
    let constraints = [];
    if (filters.courseProgram) constraints.push(where("courseProgram","==",filters.courseProgram));
    if (filters.yearLevel)     constraints.push(where("yearLevel","==",parseInt(filters.yearLevel)));
    if (filters.semester)      constraints.push(where("semester","==",filters.semester));
    return snap(constraints.length ? query(col("curriculum"), ...constraints) : query(col("curriculum")));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
export const AdminService = {
  getDashboardStats: async () => {
    const [students, faculty, events, research] = await Promise.all([
      snap(query(col("students"), where("status","==","active"))),
      snap(col("faculty")), 
      snap(query(col("events"), where("status","==","upcoming"))),
      snap(query(col("research"), where("status","==","published"))),
    ]);
    return {
      totalStudents:  students.length,
      totalFaculty:   faculty.length,
      upcomingEvents: events.length,
      totalResearch:  research.length,
      athletes:       students.filter(s => s.isAthlete).length,
      beauty:         students.filter(s => s.isBeautyCandidate).length,
      officers:       students.filter(s => s.isOfficer).length,
      scholars:       students.filter(s => s.scholarship && s.scholarship !== "None").length,
      byDept: ["CS","IT","IS","DS"].map(d => ({
        deptId: d,
        count:  students.filter(s => s.deptId === d).length,
      })),
      byYear: [1,2,3,4].map(y => ({
        yearLevel: y,
        count:     students.filter(s => s.yearLevel === y).length,
      })),
    };
  },

  // Real-time listener for admin dashboard stats
  onStatsChange: (callback) =>
    onSnapshot(query(col("students"), where("status","==","active")), () => {
      AdminService.getDashboardStats().then(callback);
    }),

  // Upload faculty profile pic
  updateProfilePic: async (userId, file) => {
    const path = `profiles/${userId}/${Date.now()}_${file.name}`;
    const url  = await StorageService.upload(path, file);
    await updateDoc(docRef("users", userId), { profilePic: url });
    return url;
  },
};
