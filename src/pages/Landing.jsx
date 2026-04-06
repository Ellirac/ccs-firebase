// src/pages/Landing.jsx
// ─── Public Landing Page — shown before login ─────────────────────────────────
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MANDATORY_MODULES = [
  { icon:"👤", label:"Student Profile",   desc:"Complete student records — personal info, dept, year, section, activities, violations, awards" },
  { icon:"👨‍🏫", label:"Faculty Profile",   desc:"Faculty records — specialization, research, schedules, office hours. Violations excluded." },
  { icon:"📅", label:"Events",             desc:"Sportsfest, Pageants, Miss & Mr. CCS, Tech Summit, Foundation Week and more" },
  { icon:"🗓️", label:"Scheduling",         desc:"Weekly class schedules per section, faculty, department and semester" },
  { icon:"🔬", label:"College Research",   desc:"Faculty publications, ongoing studies, conference papers and thesis outputs" },
  { icon:"📚", label:"Instructions",       desc:"Syllabus, Curriculum, Lessons — modules, activities, quizzes uploaded per subject" },
];

const ADMIN_FEATURES = [
  "Dashboard with college-wide statistics and analytics",
  "Profile settings — change details, password, upload profile picture",
  "Organizational Structure — all IT and CS faculty members",
  "Student Profiles — Dept, Officers, Athletes, Pageants, Events suitability, Violations",
  "Faculty Profiles — full details (violations excluded from view)",
  "Events & Coming Up — create and manage college events",
  "Schedule Management — full class schedule administration",
  "Curriculum & Courses — program of study per course",
];

const FACULTY_FEATURES = [
  "Dashboard — personal overview with class and student summary",
  "Profile settings — change details, password, upload profile picture",
  "My Students — view students by subject and section (e.g. 2IT-A, 2IT-B, 2IT-C, 2IT-D for HCI)",
  "Upload Modules — post discussions, activities, quizzes per subject",
  "Upload Grades — encode Prelim, Midterm and Finals per student",
  "Schedules — personal weekly schedule view",
  "Research — add and track publications and ongoing research",
  "Events — view upcoming college events",
];

const STUDENT_FEATURES = [
  "Dashboard — personal academic summary",
  "Profile settings — change details, password, upload profile picture",
  "Class Schedule — view subjects with faculty contact info",
  "Current Grades — Prelim, Midterm, Finals per subject",
  "Grade History — all past subjects and grades",
  "Extra-Curricular Form — register for Basketball, Chess, Badminton, Track & Field, Pageants (CCS Week), etc.",
  "Modules & Lessons — download materials uploaded by faculty",
  "Awards — academic and sports recognitions",
  "Other Details — guardian info, medical, emergency contacts",
];

const FACULTY_LIST = {
  leadership: [
    { role: "Dean", name: "Dr. Gima B. Montecillo",             email: "gbmontecillo@pnc.edu.ph" },
    { role: "Dep. Chair — CS", name: "Asst. Prof. Evangelina A. Magaling",  email: "eamagaling@pnc.edu.ph"   },
    { role: "Dep. Chair — IT", name: "Asst. Prof. Arcelito C. Quiatchon",   email: "acquiatchon@pnc.edu.ph"  },
    { role: "Secretary",       name: "Gia Mae L. Gaviola",                   email: "gmlgaviola@pnc.edu.ph"   },
  ],
  permanent: [
    { name:"Aquino, Angelica M.",          email:"amaquino@pnc.edu.ph"      },
    { name:"Bana, Christian M.",           email:"cmbana@pnc.edu.ph"        },
    { name:"Cartagenas, Joseph D.",        email:"jdcartagenas@pnc.edu.ph"  },
    { name:"Dela Cruz, Ramiro Z.",         email:"ramdcz@pnc.edu.ph"        },
    { name:"Dimaculangan, Melissa A.",     email:"madimaculangan@pnc.edu.ph"},
    { name:"Eusebio, Luvim M.",            email:"lmeusebio@pnc.edu.ph"     },
    { name:"Hablanida, Fe L.",             email:"fhablanida@pnc.edu.ph"    },
    { name:"Magaling, Evangelina A.",      email:"eamagaling@pnc.edu.ph"    },
    { name:"Montecillo, Gima B.",          email:"gbmontecillo@pnc.edu.ph"  },
    { name:"Ogalesco, John Patrick M.",    email:"jpmogalesco@pnc.edu.ph"   },
    { name:"Quiatchon, Arcelito C.",       email:"acquiatchon@pnc.edu.ph"   },
    { name:"Tan, Janus Raymond C.",        email:"jrtan@pnc.edu.ph"         },
  ],
  ftcos: [
    { name:"Alforja, Albert",              email:"aqalforja@pnc.edu.ph"     },
    { name:"Bicua, Marvin H.",             email:"MBicua66@pnc.edu.ph"      },
    { name:"Pregonero, Sairine C.",        email:"scpregonero@pnc.edu.ph"   },
    { name:"Rebana, Kristel O.",           email:"korebana@pnc.edu.ph"      },
  ],
  parttime: [
    { name:"Benco, Roselle R.",            email:"rosebenco@pnc.edu.ph"     },
    { name:"Capuno, Ma. Emmalyn Asuncion", email:"meacapuno@pnc.edu.ph"     },
    { name:"Evangelista, Renzo F.",        email:"rfevangelista@pnc.edu.ph" },
    { name:"Morano, Carissa C.",           email:"ccmorano@pnc.edu.ph"      },
    { name:"Orozco, Mc Austine Philip M.", email:"mcorozco@pnc.edu.ph"      },
    { name:"Rodriguez, Mildred De O.",     email:"mdrodriguez@pnc.edu.ph"   },
    { name:"Virtucio, Ronnel",             email:"rvirtucio@pnc.edu.ph"     },
  ],
};

const DELIVERABLES = [
  { icon:"🖥️", label:"UI",                        desc:"Responsive dark-themed web interface for all three roles" },
  { icon:"🗄️", label:"Database",                  desc:"Firebase Firestore with 18 collections and security rules" },
  { icon:"🔍", label:"Comprehensive Search & Filtering", desc:"Search by name, dept, year, athlete, pageant, officer, scholar" },
  { icon:"🚀", label:"Deployed",                  desc:"Firebase Hosting — live at your project URL" },
];

export default function Landing() {
  const navigate   = useNavigate();
  const [tab, setTab] = useState("overview");

  const TABS = [
    { id:"overview",    label:"Overview"    },
    { id:"modules",     label:"Modules"     },
    { id:"roles",       label:"User Roles"  },
    { id:"faculty",     label:"Faculty List" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'DM Sans',sans-serif", color:"var(--tx)" }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{ background:"linear-gradient(180deg,rgba(234,88,12,0.12) 0%,rgba(99,102,241,0.08) 60%,transparent 100%)", borderBottom:"1px solid var(--bd)", padding:"52px 24px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>

            {/* Logo */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <img src="/ccs-logo.jpg" alt="CCS Logo"
                style={{ width:110, height:110, borderRadius:"50%", objectFit:"cover", border:"3px solid rgba(234,88,12,0.4)", boxShadow:"0 0 40px rgba(234,88,12,0.2), 0 0 80px rgba(99,102,241,0.1)" }}/>
              <div style={{ position:"absolute", bottom:2, right:2, width:18, height:18, borderRadius:"50%", background:"var(--gr)", border:"2px solid var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>✓</div>
            </div>

            {/* Title */}
            <div style={{ flex:1, minWidth:280 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:2, color:"#EA580C", fontFamily:"'Syne',sans-serif", marginBottom:6 }}>
                Pamantasan ng Cabuyao
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:28, lineHeight:1.15, letterSpacing:"-.5px", marginBottom:6 }}>
                CCS Comprehensive<br/>
                <span style={{ background:"linear-gradient(90deg,#EA580C,#F97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  Profiling System
                </span>
              </div>
              <div style={{ fontSize:14, color:"var(--mu2)", marginBottom:14, lineHeight:1.6 }}>
                College of Computing Studies Department
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["BS Computer Science","BS Information Technology","BS Information Systems"].map(c => (
                  <span key={c} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:"rgba(234,88,12,0.1)", border:"1px solid rgba(234,88,12,0.25)", color:"#F97316" }}>{c}</span>
                ))}
              </div>
            </div>

            {/* Login CTA */}
            <div style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
              <button onClick={() => navigate("/login")}
                style={{ padding:"13px 32px", background:"linear-gradient(135deg,#EA580C,#F97316)", border:"none", borderRadius:12, color:"#fff", fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px rgba(234,88,12,0.4)" }}>
                🔐 Sign In to System
              </button>
              <div style={{ fontSize:11, color:"var(--mu)", textAlign:"center" }}>Admin · Faculty · Student portals</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom:"1px solid var(--bd)", position:"sticky", top:0, background:"rgba(7,9,15,0.96)", backdropFilter:"blur(12px)", zIndex:40 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:0, overflowX:"auto", padding:"0 16px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:"14px 20px", background:"none", border:"none", borderBottom:`2px solid ${tab===t.id?"#EA580C":"transparent"}`, color:tab===t.id?"var(--tx)":"var(--mu2)", fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", transition:"all .2s" }}>
              {t.label}
            </button>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, paddingRight:4 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--gr)", animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:11, color:"var(--gr)", fontFamily:"'Syne',sans-serif", fontWeight:600 }}>System Active</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px 60px" }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="fu">
            {/* Purpose Banner */}
            <div style={{ background:"rgba(234,88,12,0.06)", border:"1px solid rgba(234,88,12,0.2)", borderRadius:16, padding:"20px 24px", marginBottom:28 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#F97316", marginBottom:8 }}>📋 About This System</div>
              <div style={{ fontSize:13, color:"var(--mu2)", lineHeight:1.8 }}>
                The <strong style={{ color:"var(--tx)" }}>CCS Comprehensive Profiling System</strong> is a centralized digital platform for the College of Computing Studies at <strong style={{ color:"var(--tx)" }}>Pamantasan ng Cabuyao</strong>.
                It manages student and faculty profiles, academic records, schedules, events, research outputs and course materials — accessible by Administrators, Faculty and Students through role-based secure portals.
              </div>
            </div>

            {/* Deliverables */}
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>🎯 Deliverables</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:12, marginBottom:32 }}>
              {DELIVERABLES.map(d => (
                <div key={d.label} style={{ background:"var(--s2)", border:"1px solid var(--bd)", borderRadius:13, padding:"16px 18px", display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ fontSize:22, flexShrink:0 }}>{d.icon}</div>
                  <div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:4 }}>{d.label}</div><div style={{ fontSize:12, color:"var(--mu2)", lineHeight:1.5 }}>{d.desc}</div></div>
                </div>
              ))}
            </div>

            {/* Security Note */}
            <div style={{ background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:13, padding:"16px 20px", marginBottom:28 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:"var(--re)", marginBottom:8 }}>🔒 Data Privacy & Access Control</div>
              <div style={{ fontSize:13, color:"var(--mu2)", lineHeight:1.7 }}>
                <strong style={{ color:"var(--tx)" }}>Students</strong> can only view and edit their own profile, grades, schedule, activities and awards. They cannot access or modify any other student's or faculty's records.
                <br/>
                <strong style={{ color:"var(--tx)" }}>Faculty</strong> can manage their own profile, their own class modules and grades only. They cannot access another faculty's personal records.
                <br/>
                <strong style={{ color:"var(--tx)" }}>Admin</strong> has full read/write access. Only Admin can record student violations.
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>⚙️ Technology Stack</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
              {[
                ["⚛️","React 18","Frontend framework"],
                ["🔥","Firebase Auth","Role-based login"],
                ["📦","Cloud Firestore","NoSQL database"],
                ["☁️","Firebase Storage","File uploads"],
                ["🌐","Firebase Hosting","Free CDN deployment"],
                ["🎨","Syne + DM Sans","Typography"],
              ].map(([icon,name,desc]) => (
                <div key={name} style={{ background:"var(--s1)", border:"1px solid var(--bd)", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12 }}>{name}</div>
                  <div style={{ fontSize:10, color:"var(--mu)", marginTop:2 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MODULES TAB ── */}
        {tab === "modules" && (
          <div className="fu">
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:6 }}>📦 Mandatory Modules</div>
            <div style={{ fontSize:13, color:"var(--mu2)", marginBottom:22 }}>All six modules are fully implemented and accessible based on user role.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14, marginBottom:40 }}>
              {MANDATORY_MODULES.map((m, i) => (
                <div key={m.label} style={{ background:"var(--s2)", border:"1px solid var(--bd)", borderRadius:15, padding:20, display:"flex", gap:14, alignItems:"flex-start", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:12, right:14, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"var(--mu)", opacity:.4 }}>M{String(i+1).padStart(2,"0")}</div>
                  <div style={{ width:44, height:44, borderRadius:11, background:"rgba(234,88,12,0.12)", border:"1px solid rgba(234,88,12,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, marginBottom:6, color:"#F97316" }}>{m.label}</div>
                    <div style={{ fontSize:12, color:"var(--mu2)", lineHeight:1.6 }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:6 }}>✨ Freewill / Additional Modules</div>
            <div style={{ fontSize:13, color:"var(--mu2)", marginBottom:18 }}>Extra modules added beyond the required deliverables.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10 }}>
              {[
                ["🎨","Custom Design","Dark theme, Syne typography, orange CCS branding"],
                ["📊","Analytics Dashboard","Student counts by dept, year level, top students"],
                ["⚠️","Violations Tracker","Admin-only incident recording per student"],
                ["🏆","Awards Registry","Academic, sports and cultural recognitions"],
                ["📱","Responsive Layout","Works on desktop, tablet and mobile"],
                ["🔐","Firebase Security","Firestore rules enforce data ownership per role"],
                ["📁","File Management","Toggle visibility, delete modules per subject"],
                ["🌐","One-click Deploy","Firebase Hosting — deployed with `npm run deploy`"],
              ].map(([icon, name, desc]) => (
                <div key={name} style={{ background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:11, padding:"14px 16px" }}>
                  <div style={{ fontSize:18, marginBottom:5 }}>{icon}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, marginBottom:3 }}>{name}</div>
                  <div style={{ fontSize:11, color:"var(--mu2)", lineHeight:1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ROLES TAB ── */}
        {tab === "roles" && (
          <div className="fu">
            {[
              { role:"Admin", color:"var(--a)", icon:"🏛️", features:ADMIN_FEATURES,
                note:"Full system access. Only Admin can record student violations. Admin cannot be a student or faculty simultaneously." },
              { role:"Faculty", color:"var(--gr)", icon:"👨‍🏫", features:FACULTY_FEATURES,
                note:"Faculty can only manage their own profile and the grades/modules of their own classes. Cannot access other faculty profiles' private data." },
              { role:"Student", color:"var(--go)", icon:"🎓", features:STUDENT_FEATURES,
                note:"Students can only view and update their own records. Cannot view other students' grades, violations, or personal info." },
            ].map(r => (
              <div key={r.role} style={{ background:"var(--s2)", border:`1px solid ${r.color}22`, borderRadius:16, padding:24, marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:`${r.color}15`, border:`1px solid ${r.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:r.color }}>{r.role} Portal</div>
                    <div style={{ fontSize:11, color:"var(--mu2)", marginTop:2 }}>Role-specific access · Enforced by Firebase Security Rules</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:8, marginBottom:14 }}>
                  {r.features.map((f, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", fontSize:13, color:"var(--mu2)", padding:"6px 0" }}>
                      <span style={{ color:r.color, flexShrink:0, marginTop:1 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:`${r.color}08`, border:`1px solid ${r.color}22`, borderRadius:9, padding:"10px 14px", fontSize:12, color:"var(--mu2)" }}>
                  🔒 <strong style={{ color:"var(--tx)" }}>Security Note:</strong> {r.note}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FACULTY TAB ── */}
        {tab === "faculty" && (
          <div className="fu">
            {/* Leadership */}
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:16 }}>👑 CCS Leadership</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12, marginBottom:32 }}>
              {FACULTY_LIST.leadership.map(f => (
                <div key={f.email} style={{ background:"rgba(234,88,12,0.05)", border:"1px solid rgba(234,88,12,0.2)", borderRadius:13, padding:18 }}>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:"linear-gradient(135deg,#EA580C,#F97316)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:"#fff", flexShrink:0 }}>
                      {f.name.split(" ").filter(w => /^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13 }}>{f.name}</div>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:"#F97316", marginTop:2 }}>{f.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"var(--mu2)", fontFamily:"'JetBrains Mono',monospace" }}>📧 {f.email}</div>
                </div>
              ))}
            </div>

            {/* Faculty Groups */}
            {[
              { title:"CCS Faculty — Permanent", color:"var(--a)", list:FACULTY_LIST.permanent },
              { title:"CCS Faculty — FT-COS",    color:"var(--pu)", list:FACULTY_LIST.ftcos },
              { title:"CCS Faculty — Part-Time",  color:"var(--go)", list:FACULTY_LIST.parttime },
            ].map(group => (
              <div key={group.title} style={{ marginBottom:32 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ width:4, height:24, borderRadius:2, background:group.color }}/>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14 }}>{group.title}</div>
                  <div style={{ fontSize:11, color:"var(--mu2)" }}>{group.list.length} members</div>
                </div>
                <div style={{ background:"var(--s2)", border:"1px solid var(--bd)", borderRadius:13, overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"rgba(255,255,255,0.02)", borderBottom:"1px solid var(--bd)" }}>
                        <th style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:.5, fontFamily:"'Syne',sans-serif" }}>#</th>
                        <th style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:.5, fontFamily:"'Syne',sans-serif" }}>Name</th>
                        <th style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:.5, fontFamily:"'Syne',sans-serif" }}>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.list.map((f, i) => (
                        <tr key={f.email} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding:"11px 16px", fontSize:11, color:"var(--mu)", fontFamily:"'JetBrains Mono',monospace" }}>{String(i+1).padStart(2,"0")}</td>
                          <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600 }}>{f.name}</td>
                          <td style={{ padding:"11px 16px", fontSize:12, color:"var(--mu2)", fontFamily:"'JetBrains Mono',monospace" }}>{f.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Total count */}
            <div style={{ textAlign:"center", padding:"20px 0", color:"var(--mu2)", fontSize:13 }}>
              Total: <strong style={{ color:"var(--tx)" }}>{FACULTY_LIST.leadership.length + FACULTY_LIST.permanent.length + FACULTY_LIST.ftcos.length + FACULTY_LIST.parttime.length}</strong> CCS Faculty Members registered in the system
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop:"1px solid var(--bd)", padding:"20px 24px", textAlign:"center", color:"var(--mu)", fontSize:12 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:6 }}>
          <img src="/ccs-logo.jpg" alt="CCS" style={{ width:24, height:24, borderRadius:"50%", objectFit:"cover", opacity:.8 }}/>
          <span className="syne" style={{ fontWeight:700, color:"var(--mu2)" }}>CCS Comprehensive Profiling System</span>
        </div>
        <div>Pamantasan ng Cabuyao · College of Computing Studies · {new Date().getFullYear()}</div>
        <div style={{ marginTop:4 }}>Powered by 🔥 Firebase · Built with React</div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}
