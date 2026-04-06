// src/pages/AllPages.jsx
// ─── All CCS pages using Firebase services ────────────────────────────────────
// Each page is a named export. Import what you need in App.jsx.

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useFirestore } from "../hooks/useFirestore";
import {
  AdminService, FacultyService, StudentService, GradesService,
  ModulesService, ScheduleService, EventsService, ResearchService,
  CurriculumService, AuthService, StorageService,
} from "../services/firebase.services";

import {
  Av, B, GWARing, StatCard, Loading, Empty, PageHeader, SearchBar,
  Modal, InfoGrid, Section, EventCard, StudentCard, FacultyCard,
  fmtDate, getAge, gwaColor, DEPT_COLORS, ProgressBar, initials,
} from "../components/common";
import toast from "react-hot-toast";

const POS_LABELS = { dean:"Dean", dept_chair:"Dept Chair", secretary:"Secretary", permanent:"Permanent", ft_cos:"FT-COS", part_time:"Part-Time" };
const POS_ORDER  = ["dean","dept_chair","secretary","permanent","ft_cos","part_time"];

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE SETTINGS (shared all roles)
// ═══════════════════════════════════════════════════════════════════════════════
export function ProfileSettings() {
  const { currentUser, userProfile:p, role, linkedId, updateProfile } = useAuth();
  const [editInfo, setEditInfo]   = useState(false);
  const [editPass, setEditPass]   = useState(false);
  const [uploading,setUploading]  = useState(false);
  const [progress, setProgress]   = useState(0);
  const [savingInfo,setSI]        = useState(false);
  const [savingPass,setSP]        = useState(false);
  const fileRef = useRef();

  const [infoForm, setInfo] = useState({
    phone:"", address:"", bloodType:"", medicalConditions:"",
    guardianName:"", guardianContact:"", emergencyContact:"",
    officeLocation:"", officeHours:"", bio:"", specialization:"",
  });
  const [passForm, setPass] = useState({ current:"", next:"", confirm:"" });

  useEffect(() => {
    if (p) setInfo(prev => ({ ...prev, ...p }));
  }, [p]);

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await StorageService.upload(`profiles/${currentUser.uid}/${Date.now()}_${file.name}`, file, setProgress);
      await AdminService.updateProfilePic(currentUser.uid, file);
      updateProfile({ profilePic: url });
      toast.success("Profile picture updated!");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); setProgress(0); }
  };

  const handleSaveInfo = async () => {
    setSI(true);
    try {
      if (role === "student") await StudentService.update(linkedId, infoForm);
      else await FacultyService.update(linkedId, infoForm);
      updateProfile(infoForm);
      toast.success("Profile updated!");
      setEditInfo(false);
    } catch { toast.error("Update failed"); }
    finally { setSI(false); }
  };

  const handleChangePass = async () => {
    if (passForm.next !== passForm.confirm) return toast.error("Passwords don't match");
    if (passForm.next.length < 8)          return toast.error("Min 8 characters");
    setSP(true);
    try {
      await AuthService.changePassword(passForm.current, passForm.next);
      toast.success("Password changed!");
      setPass({ current:"", next:"", confirm:"" });
      setEditPass(false);
    } catch (err) { toast.error(err.message || "Failed"); }
    finally { setSP(false); }
  };

  const rc = role==="admin"?"var(--a)":role==="faculty"?"var(--gr)":"var(--go)";

  return (
    <div className="page-content fu">
      <PageHeader title="My Profile" sub="Manage your information, password and profile picture" />
      <div className="dc" style={{ display:"flex", gap:20, alignItems:"flex-start", marginBottom:20 }}>
        <div style={{ position:"relative" }}>
          <Av firstName={p?.firstName} lastName={p?.lastName} pic={p?.profilePic} color={rc} size="l"/>
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ position:"absolute",bottom:-4,right:-4,width:24,height:24,borderRadius:"50%",background:"var(--a2)",border:"none",color:"#fff",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            {uploading?"…":"📷"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePicUpload}/>
        </div>
        {uploading && <ProgressBar progress={progress}/>}
        <div style={{ flex:1 }}>
          <div className="syne" style={{ fontWeight:800, fontSize:20 }}>{p?.firstName} {p?.lastName}</div>
          <div style={{ fontSize:13, color:"var(--mu2)", marginTop:2 }}>{p?.title||""} · {p?.position?.replace("_"," ")||p?.course||""} · {p?.deptId||""}</div>
          <div className="pid">{linkedId}</div>
          <div style={{ marginTop:8 }}><span style={{ background:`${rc}15`, border:`1px solid ${rc}44`, color:rc, padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:700, fontFamily:"'Syne',sans-serif", textTransform:"uppercase" }}>{role}</span></div>
        </div>
        <button className="btn btn-secondary" onClick={() => setEditInfo(!editInfo)}>{editInfo?"Cancel":"✏️ Edit"}</button>
      </div>
      <div className="d2">
        <div>
          <Section title="Personal / Contact Information">
            {editInfo ? (
              <div>
                {role==="student" && (
                  [["phone","Phone"],["address","Address"],["bloodType","Blood Type"],["medicalConditions","Medical"],["guardianName","Guardian"],["guardianContact","Guardian Contact"],["emergencyContact","Emergency Contact"]].map(([k,l]) => (
                    <div className="form-group" key={k}><label className="label">{l}</label><input className="input" value={infoForm[k]||""} onChange={e=>setInfo(p=>({...p,[k]:e.target.value}))}/></div>
                  ))
                )}
                {(role==="faculty"||role==="admin") && (
                  [["phone","Phone"],["officeLocation","Office Location"],["officeHours","Office Hours"],["specialization","Specialization"]].map(([k,l]) => (
                    <div className="form-group" key={k}><label className="label">{l}</label><input className="input" value={infoForm[k]||""} onChange={e=>setInfo(p=>({...p,[k]:e.target.value}))}/></div>
                  ))
                )}
                {(role==="faculty"||role==="admin") && <div className="form-group"><label className="label">Bio</label><textarea className="input" rows={3} value={infoForm.bio||""} onChange={e=>setInfo(p=>({...p,bio:e.target.value}))}/></div>}
                <button className="btn btn-primary" onClick={handleSaveInfo} disabled={savingInfo}>{savingInfo?"Saving…":"Save Changes"}</button>
              </div>
            ) : (
              <InfoGrid items={role==="student" ? [
                ["Birthday",`${fmtDate(p?.birthday)} (Age ${getAge(p?.birthday)})`],["Gender",p?.gender],["Blood Type",p?.bloodType],
                ["Address",p?.address],["Phone",p?.phone],["Email",currentUser?.email],["Medical",p?.medicalConditions],
                ["Guardian",p?.guardianName],["Guardian Contact",p?.guardianContact],["Emergency",p?.emergencyContact],
              ] : [
                ["Department",p?.deptId],["Position",(p?.position||"").replace("_"," ")],["Specialization",p?.specialization],
                ["Email",currentUser?.email],["Phone",p?.phone],["Office",p?.officeLocation],["Hours",p?.officeHours],
                ["Publications",p?.publications],["Yrs Service",p?.yearsInService],
              ]}/>
            )}
          </Section>
          {role==="student" && <Section title="Academic Info"><InfoGrid items={[["Course",p?.course],["Year",`Year ${p?.yearLevel}`],["Section",p?.section],["Scholarship",p?.scholarship||"None"],["Officer",p?.isOfficer?`Yes — ${p?.officerPosition||""}`:("No")]]}/></Section>}
        </div>
        <div>
          <Section title="🔒 Change Password">
            {editPass ? (
              <div>
                {[["current","Current Password"],["next","New Password"],["confirm","Confirm New"]].map(([k,l]) => (
                  <div className="form-group" key={k}><label className="label">{l}</label><input className="input" type="password" value={passForm[k]} onChange={e=>setPass(p=>({...p,[k]:e.target.value}))}/></div>
                ))}
                <div style={{display:"flex",gap:8}}><button className="btn btn-primary" onClick={handleChangePass} disabled={savingPass}>{savingPass?"Saving…":"Update"}</button><button className="btn btn-secondary" onClick={()=>setEditPass(false)}>Cancel</button></div>
              </div>
            ) : (
              <div><p style={{fontSize:13,color:"var(--mu2)",marginBottom:14}}>Keep your password secure and update it regularly.</p><button className="btn btn-secondary" onClick={()=>setEditPass(true)}>Change Password</button></div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminDashboard() {
  const { userProfile:p } = useAuth();
  const { data:stats, loading } = useFirestore(() => AdminService.getDashboardStats());
  const { data:events } = useFirestore(() => EventsService.getAll({ status:"upcoming" }));

  if (loading) return <div className="page-content"><Loading/></div>;
  const s = stats || {};
  return (
    <div className="page-content fu">
      <div style={{ background:"rgba(56,189,248,.05)", border:"1px solid rgba(56,189,248,.14)", borderRadius:14, padding:"18px 22px", marginBottom:24, display:"flex", gap:14, alignItems:"center" }}>
        <div style={{ fontSize:30 }}>🏛️</div>
        <div>
          <div className="syne" style={{ fontWeight:800, fontSize:17 }}>Welcome, {p?.title} {p?.lastName}!</div>
          <div style={{ fontSize:12, color:"var(--mu2)", marginTop:2 }}>Dean · CCS · Powered by 🔥 Firebase + Firestore</div>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard value={s.totalStudents}  label="Students"       color="var(--a)"  icon="🎓"/>
        <StatCard value={s.totalFaculty}   label="Faculty"        color="var(--gr)" icon="👨‍🏫"/>
        <StatCard value={s.upcomingEvents} label="Upcoming Events" color="var(--go)" icon="📅"/>
        <StatCard value={s.totalResearch}  label="Publications"   color="var(--pu)" icon="🔬"/>
        <StatCard value={s.athletes}       label="Athletes"        color="var(--gr)" icon="🏅"/>
        <StatCard value={s.beauty}         label="Pageant Cands." color="var(--pk)" icon="👑"/>
        <StatCard value={s.officers}       label="Officers"        color="var(--a2)" icon="⭐"/>
        <StatCard value={s.scholars}       label="Scholars"        color="var(--go)" icon="🎖️"/>
      </div>
      <div className="d2">
        <div>
          <Section title="Students by Department">
            {(s.byDept||[]).map(d => {
              const max = Math.max(...(s.byDept||[]).map(x=>x.count),1);
              const c = DEPT_COLORS[d.deptId]||"#6366F1";
              return <div key={d.deptId} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div className="syne" style={{fontWeight:700,fontSize:11,width:28,color:c}}>{d.deptId}</div>
                <div style={{flex:1,height:7,background:"rgba(255,255,255,.05)",borderRadius:4,overflow:"hidden"}}><div style={{width:`${(d.count/max)*100}%`,height:"100%",background:c,borderRadius:4}}/></div>
                <div style={{fontSize:11,color:"var(--mu2)",width:20,textAlign:"right"}}>{d.count}</div>
              </div>;
            })}
          </Section>
          <Section title="Students by Year Level">
            {(s.byYear||[]).map(y => <div key={y.yearLevel} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--bd)",fontSize:13}}><span>Year {y.yearLevel}</span><span className="syne" style={{fontWeight:700,color:"var(--a)"}}>{y.count}</span></div>)}
          </Section>
        </div>
        <div>
          <Section title="📅 Upcoming Events">
            {(events||[]).slice(0,5).map(ev => <EventCard key={ev.id} event={ev}/>)}
            {(!events||events.length===0) && <div style={{color:"var(--mu2)",fontSize:13}}>No upcoming events.</div>}
          </Section>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORG STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════
export function OrgStructure() {
  const { data:faculty, loading } = useFirestore(() => FacultyService.getCSandIT());
  const [sel, setSel] = useState(null);
  if (loading) return <div className="page-content"><Loading/></div>;
  const grouped = POS_ORDER.reduce((acc,pos) => { acc[pos]=(faculty||[]).filter(f=>f.position===pos); return acc; }, {});
  const posColor = {dean:"var(--a)",dept_chair:"var(--gr)",secretary:"var(--pu)",permanent:"var(--mu2)",ft_cos:"var(--go)",part_time:"var(--pk)"};
  return (
    <div className="page-content fu">
      <PageHeader title="Organizational Structure" sub="CCS Faculty — Computer Science & Information Technology Departments"/>
      {POS_ORDER.map(pos => {
        const members = grouped[pos];
        if (!members?.length) return null;
        const color = posColor[pos];
        return <div key={pos} style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={{width:4,height:28,borderRadius:2,background:color}}/>
            <div><div className="syne" style={{fontWeight:800,fontSize:14,color}}>{POS_LABELS[pos]}</div><div style={{fontSize:11,color:"var(--mu2)"}}>{members.length} member{members.length>1?"s":""}</div></div>
          </div>
          <div className="cards-grid">
            {members.map(f => <FacultyCard key={f.id} faculty={f} onClick={setSel}/>)}
          </div>
        </div>;
      })}
      {sel && <Modal open={!!sel} onClose={()=>setSel(null)} title={`${sel.title||""} ${sel.lastName}, ${sel.firstName}`}>
        <Section title="Faculty Info">
          <InfoGrid items={[["ID",sel.id],["Position",POS_LABELS[sel.position]],["Dept",sel.deptId],["Specialization",sel.specialization],["Email",sel.email],["Phone",sel.phone],["Office",sel.officeLocation],["Hours",sel.officeHours],["Yrs",sel.yearsInService],["Pubs",sel.publications]]}/>
        </Section>
      </Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT PROFILES (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminStudentProfiles() {
  const [query,setQ]=useState(""); const [dept,setDept]=useState(""); const [yr,setYr]=useState("");
  const [athlete,setA]=useState(false); const [beauty,setB]=useState(false); const [officer,setO]=useState(false);
  const [sel,setSel]=useState(null); const [detail,setDetail]=useState(null);
  const [vioForm,setVio]=useState({offense:"",sanction:"",dateFiled:"",remarks:""});
  const [showVio,setShowVio]=useState(false);

  const { data:students, loading, refetch } = useFirestore(() => StudentService.getAll({
    search:query||undefined, deptId:dept||undefined, yearLevel:yr||undefined,
    isAthlete:athlete||undefined, isBeautyCandidate:beauty||undefined, isOfficer:officer||undefined,
  }), [query,dept,yr,athlete,beauty,officer]);

  const openDetail = async (s) => {
    setSel(s);
    const [activities,awards,violations] = await Promise.all([
      StudentService.getActivities(s.id),
      StudentService.getAwards(s.id),
      StudentService.getViolations(s.id),
    ]);
    setDetail({ ...s, activities, awards, violations });
  };

  const submitVio = async () => {
    try {
      await StudentService.addViolation({ ...vioForm, studentId:sel.id });
      toast.success("Violation recorded");
      setShowVio(false);
      openDetail(sel);
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="page-content fu">
      <PageHeader title="Student Profiles" sub={`${(students||[]).length} students`}/>
      <SearchBar value={query} onChange={v=>{setQ(v);}} placeholder="Search name, ID, section…">
        <select className="filter-select" value={dept} onChange={e=>setDept(e.target.value)}>
          <option value="">All Depts</option>
          {["CS","IT","IS","DS"].map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" value={yr} onChange={e=>setYr(e.target.value)}>
          <option value="">All Years</option>
          {[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}
        </select>
        <button className={`filter-btn${athlete?" active":""}`} onClick={()=>setA(!athlete)}>🏅 Athletes</button>
        <button className={`filter-btn${beauty?" active":""}`}  onClick={()=>setB(!beauty)}>👑 Pageant</button>
        <button className={`filter-btn${officer?" active":""}`} onClick={()=>setO(!officer)}>⭐ Officers</button>
      </SearchBar>
      {loading?<Loading/>:(students||[]).length===0?<Empty/>:(
        <div className="cards-grid">{(students||[]).map(s=><StudentCard key={s.id} student={s} onClick={openDetail}/>)}</div>
      )}
      {sel && detail && (
        <Modal open={!!sel} onClose={()=>{setSel(null);setDetail(null);}} title={`${sel.lastName}, ${sel.firstName}`} maxWidth={760}>
          <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:18}}>
            <Av firstName={sel.firstName} lastName={sel.lastName} pic={sel.profilePic} color={DEPT_COLORS[sel.deptId]||"#6366F1"} size="l"/>
            <div style={{flex:1}}>
              <div className="syne" style={{fontWeight:800,fontSize:17}}>{sel.lastName}, {sel.firstName}</div>
              <div style={{fontSize:13,color:"var(--mu2)",marginTop:2}}>{sel.course} · Year {sel.yearLevel} · {sel.section}</div>
              <div className="pid">{sel.id}</div>
              <div className="tags" style={{marginTop:8}}>
                <B t="bl">{sel.deptId}</B>
                {sel.scholarship&&sel.scholarship!=="None"&&<B t="go">{sel.scholarship}</B>}
                {sel.isAthlete&&<B t="gr">🏅 Athlete</B>}
                {sel.isBeautyCandidate&&<B t="pk">👑 Pageant</B>}
                {sel.isOfficer&&<B t="pu">⭐ Officer</B>}
              </div>
            </div>
            <button className="btn btn-danger" onClick={()=>setShowVio(true)}>⚠️ Add Violation</button>
          </div>
          <div className="modal-section"><div className="modal-section-title">Personal Info</div>
            <InfoGrid items={[["Birthday",`${fmtDate(detail.birthday)} (Age ${getAge(detail.birthday)})`],["Gender",detail.gender],["Blood Type",detail.bloodType],["Address",detail.address],["Guardian",detail.guardianName],["Gdn Contact",detail.guardianContact]]}/>
          </div>
          {detail.activities?.length>0&&<div className="modal-section"><div className="modal-section-title">🏅 Activities</div>
            <div className="tags">{detail.activities.map((a,i)=><span key={i} className="tag" style={{color:"var(--gr)"}}>{a.activityName} — {a.positionRole}</span>)}</div>
          </div>}
          {detail.awards?.length>0&&<div className="modal-section"><div className="modal-section-title">🏆 Awards</div>
            <div className="tags">{detail.awards.map((a,i)=><span key={i} className="tag" style={{color:"var(--go)"}}>{a.awardName}</span>)}</div>
          </div>}
          {detail.violations?.length>0&&<div className="modal-section"><div className="modal-section-title" style={{color:"var(--re)"}}>⚠️ Violations</div>
            {detail.violations.map((v,i)=><div key={i} style={{background:"rgba(248,113,113,.06)",border:"1px solid rgba(248,113,113,.15)",borderRadius:10,padding:12,marginBottom:8}}>
              <div className="syne" style={{fontWeight:700,fontSize:12,color:"var(--re)"}}>{v.offense}</div>
              <div style={{fontSize:11,color:"var(--mu2)",marginTop:3}}>Sanction: {v.sanction||"—"} · {fmtDate(v.dateFiled)}</div>
            </div>)}
          </div>}
        </Modal>
      )}
      {showVio&&<Modal open={showVio} onClose={()=>setShowVio(false)} title="Record Violation" maxWidth={480}>
        {[["offense","Offense"],["sanction","Sanction"],["dateFiled","Date Filed"],["remarks","Remarks"]].map(([k,l])=>(
          <div className="form-group" key={k}><label className="label">{l}</label>
            {k==="remarks"?<textarea className="input" rows={2} value={vioForm[k]} onChange={e=>setVio(p=>({...p,[k]:e.target.value}))}/>
            :<input className="input" type={k==="dateFiled"?"date":"text"} value={vioForm[k]} onChange={e=>setVio(p=>({...p,[k]:e.target.value}))}/>}
          </div>
        ))}
        <div style={{display:"flex",gap:8}}><button className="btn btn-danger" onClick={submitVio}>Record</button><button className="btn btn-secondary" onClick={()=>setShowVio(false)}>Cancel</button></div>
      </Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTY PROFILES (admin)
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminFacultyProfiles() {
  const [query,setQ]=useState(""); const [dept,setDept]=useState(""); const [pos,setPos]=useState("");
  const [sel,setSel]=useState(null);
  const { data:faculty, loading } = useFirestore(() => FacultyService.getAll({ deptId:dept||undefined, position:pos||undefined }), [dept,pos]);
  const filtered = (faculty||[]).filter(f => !query || `${f.firstName} ${f.lastName} ${f.specialization}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="page-content fu">
      <PageHeader title="Faculty Profiles" sub="All CCS faculty — violations excluded"/>
      <SearchBar value={query} onChange={setQ} placeholder="Search name, specialization…">
        <select className="filter-select" value={dept} onChange={e=>setDept(e.target.value)}>
          <option value="">All Depts</option>{["CS","IT","IS","DS"].map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" value={pos} onChange={e=>setPos(e.target.value)}>
          <option value="">All Positions</option>{Object.entries(POS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
      </SearchBar>
      {loading?<Loading/>:filtered.length===0?<Empty icon="👨‍🏫" text="No faculty found"/>:<div className="cards-grid">{filtered.map(f=><FacultyCard key={f.id} faculty={f} onClick={setSel}/>)}</div>}
      {sel&&<Modal open={!!sel} onClose={()=>setSel(null)} title={`${sel.title||""} ${sel.lastName}, ${sel.firstName}`}>
        <InfoGrid items={[["Dept",sel.deptId],["Position",POS_LABELS[sel.position]],["Specialization",sel.specialization],["Email",sel.email],["Phone",sel.phone],["Office",sel.officeLocation],["Hours",sel.officeHours],["Pubs",sel.publications],["Yrs",sel.yearsInService]]}/>
      </Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS PAGE (all roles)
// ═══════════════════════════════════════════════════════════════════════════════
export function EventsPage() {
  const { isAdmin } = useAuth();
  const [typeF,setType]=useState(""); const [statF,setStat]=useState(""); const [search,setSrch]=useState("");
  const [sel,setSel]=useState(null); const [parts,setParts]=useState([]);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",description:"",eventType:"sports",eventDate:"",eventTime:"",venue:"",organizer:"CCS Student Council"});
  const { data:events, loading, refetch } = useFirestore(()=>EventsService.getAll({status:statF||undefined,eventType:typeF||undefined}), [typeF,statF]);
  const filtered = (events||[]).filter(ev=>!search||ev.title.toLowerCase().includes(search.toLowerCase()));

  const openDetail = async (ev) => {
    setSel(ev);
    setParts(await EventsService.getParticipants(ev.id));
  };

  const submitEvent = async () => {
    try { await EventsService.create(form); toast.success("Event created!"); setShowAdd(false); refetch(); }
    catch { toast.error("Failed"); }
  };

  const tc={sports:"gr",pageant:"pk",academic:"bl",cultural:"pu",seminar:"go"};
  return (
    <div className="page-content fu">
      <PageHeader title="Events" sub="Sportsfest, Pageants, Academic & Cultural"
        actions={isAdmin&&<button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ New Event</button>}/>
      <SearchBar value={search} onChange={setSrch} placeholder="Search events…">
        <select className="filter-select" value={typeF} onChange={e=>setType(e.target.value)}>
          <option value="">All Types</option>{["sports","pageant","academic","cultural","seminar","other"].map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={statF} onChange={e=>setStat(e.target.value)}>
          <option value="">All Status</option>{["upcoming","ongoing","completed","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </SearchBar>
      {loading?<Loading/>:filtered.length===0?<Empty icon="📅" text="No events"/>:filtered.map(ev=><EventCard key={ev.id} event={ev} onClick={openDetail}/>)}
      {sel&&<Modal open={!!sel} onClose={()=>{setSel(null);setParts([]);}} title={sel.title} maxWidth={720}>
        <div className="tags" style={{marginBottom:14}}><B t={tc[sel.eventType]||"gy"}>{sel.eventType}</B><B t={sel.status==="upcoming"?"gr":"gy"}>{sel.status}</B><span className="tag">👥 {parts.length} participants</span></div>
        <Section title="Details"><InfoGrid items={[["Date",fmtDate(sel.eventDate)],["Time",sel.eventTime||"TBA"],["Venue",sel.venue],["Organizer",sel.organizer]]}/></Section>
        {parts.length>0&&<Section title="Participants"><div style={{display:"flex",flexDirection:"column",gap:8}}>
          {parts.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"rgba(255,255,255,.03)",borderRadius:8}}>
            <Av firstName={p.student?.firstName} lastName={p.student?.lastName} color="#3B82F6" size="s"/>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{p.student?.lastName}, {p.student?.firstName}</div><div style={{fontSize:11,color:"var(--mu2)"}}>{p.student?.course} · {p.student?.section}</div></div>
            <B t="gy">{p.role}</B>
          </div>)}
        </div></Section>}
      </Modal>}
      {showAdd&&<Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Create Event" maxWidth={540}>
        {[["title","Title","text"],["eventDate","Date","date"],["eventTime","Time","time"],["venue","Venue","text"],["organizer","Organizer","text"]].map(([k,l,t])=>(
          <div className="form-group" key={k}><label className="label">{l}</label><input className="input" type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>
        ))}
        <div className="form-group"><label className="label">Type</label>
          <select className="input" value={form.eventType} onChange={e=>setForm(p=>({...p,eventType:e.target.value}))}>
            {["sports","pageant","academic","cultural","seminar","other"].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
        <div style={{display:"flex",gap:8}}><button className="btn btn-primary" onClick={submitEvent}>Create</button><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button></div>
      </Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURRICULUM
// ═══════════════════════════════════════════════════════════════════════════════
export function CurriculumPage() {
  const [search,setSrch]=useState(""); const [dept,setDept]=useState("");
  const { data:subjects, loading } = useFirestore(()=>CurriculumService.getSubjects({deptId:dept||undefined}), [dept]);
  const filtered=(subjects||[]).filter(s=>!search||`${s.subjectCode} ${s.subjectTitle}`.toLowerCase().includes(search.toLowerCase()));
  const grouped=filtered.reduce((acc,s)=>{const k=`Year ${s.yearLevel} — ${s.semester} Semester`;if(!acc[k])acc[k]=[];acc[k].push(s);return acc;},{});
  return (
    <div className="page-content fu">
      <PageHeader title="Curriculum & Courses" sub="CCS course offerings"/>
      <div className="search-bar">
        <select className="filter-select" value={dept} onChange={e=>setDept(e.target.value)}>
          <option value="">All Depts</option>{["CS","IT","IS","DS"].map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <div className="search-wrap"><span className="search-icon">🔍</span><input className="search-input" placeholder="Search subjects…" value={search} onChange={e=>setSrch(e.target.value)}/></div>
      </div>
      {loading?<Loading/>:Object.keys(grouped).length===0?<Empty icon="📚" text="No subjects found"/>:Object.entries(grouped).map(([group,items])=>(
        <div key={group} style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><div style={{width:4,height:24,borderRadius:2,background:"var(--a2)"}}/><div className="syne" style={{fontWeight:800,fontSize:14}}>{group}</div><B t="gy">{items.reduce((s,c)=>s+c.units,0)} units</B></div>
          <div className="tw"><table className="tbl"><thead><tr><th>Code</th><th>Subject Title</th><th>Units</th><th>Dept</th></tr></thead>
          <tbody>{items.map(s=><tr key={s.id}><td><span className="mono" style={{color:"var(--a2)",fontSize:12}}>{s.subjectCode}</span></td><td style={{fontWeight:600}}>{s.subjectTitle}</td><td><B t="gy">{s.units}</B></td><td><B t="bl">{s.deptId}</B></td></tr>)}</tbody></table></div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH (all roles, faculty can add)
// ═══════════════════════════════════════════════════════════════════════════════
export function ResearchPage() {
  const { isFaculty, isAdmin, linkedId } = useAuth();
  const [search,setSrch]=useState(""); const [status,setStat]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",abstract:"",journal:"",publishYear:"",researchType:"journal",status:"ongoing",doi:"",authors:[]});
  const [ai,setAi]=useState(""); const [file,setFile]=useState(null);
  const { data:research, loading, refetch } = useFirestore(()=>ResearchService.getAll({facultyId:isFaculty&&!isAdmin?linkedId:undefined,status:status||undefined,search:search||undefined}), [status,search]);

  const addAuthor = () => { if(ai.trim()){setForm(p=>({...p,authors:[...p.authors,ai.trim()]}));setAi("");} };

  const submitResearch = async () => {
    try {
      await ResearchService.create({ ...form, facultyId:linkedId, file });
      toast.success("Research added!"); setShowAdd(false); refetch();
    } catch { toast.error("Failed"); }
  };

  const sc={published:"gr",completed:"bl",ongoing:"go"};
  return (
    <div className="page-content fu">
      <PageHeader title="College Research" sub="Publications and ongoing studies"
        actions={(isFaculty||isAdmin)&&<button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Research</button>}/>
      <SearchBar value={search} onChange={setSrch} placeholder="Search by title…">
        <select className="filter-select" value={status} onChange={e=>setStat(e.target.value)}>
          <option value="">All Status</option>{["ongoing","completed","published"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </SearchBar>
      {loading?<Loading/>:(research||[]).length===0?<Empty icon="🔬" text="No research found"/>:(research||[]).map(r=>(
        <div key={r.id} style={{background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:14,padding:20,marginBottom:12}}>
          <div className="syne" style={{fontWeight:800,fontSize:14,marginBottom:6}}>{r.title}</div>
          <div style={{fontSize:12,color:"var(--mu2)",marginBottom:8}}>{r.journal||"—"} · {r.publishYear||"Ongoing"}</div>
          <div className="tags" style={{marginBottom:8}}><B t={sc[r.status]||"gy"}>{r.status}</B><B t="bl">{r.researchType}</B></div>
          {r.abstract&&<div style={{fontSize:12,color:"var(--mu2)",lineHeight:1.6}}>{r.abstract}</div>}
          {r.authors&&<div style={{marginTop:8,fontSize:12,color:"var(--mu2)"}}>👥 {(Array.isArray(r.authors)?r.authors:JSON.parse(r.authors||"[]")).join(", ")}</div>}
        </div>
      ))}
      {showAdd&&<Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Research" maxWidth={580}>
        {[["title","Title"],["journal","Journal / Conference"],["publishYear","Year"],["doi","DOI (optional)"]].map(([k,l])=>(
          <div className="form-group" key={k}><label className="label">{l}</label><input className="input" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>
        ))}
        <div className="form-group"><label className="label">Abstract</label><textarea className="input" rows={3} value={form.abstract} onChange={e=>setForm(p=>({...p,abstract:e.target.value}))}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["researchType","Type",["journal","conference","thesis","book","other"]],["status","Status",["ongoing","completed","published"]]].map(([k,l,opts])=>(
            <div className="form-group" key={k}><label className="label">{l}</label><select className="input" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
          ))}
        </div>
        <div className="form-group"><label className="label">Authors</label>
          <div style={{display:"flex",gap:8}}><input className="input" placeholder="Add author…" value={ai} onChange={e=>setAi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAuthor()}/><button className="btn btn-secondary" onClick={addAuthor}>+</button></div>
          <div className="tags" style={{marginTop:6}}>{form.authors.map((a,i)=><span key={i} className="tag" style={{cursor:"pointer",color:"var(--go)"}} onClick={()=>setForm(p=>({...p,authors:p.authors.filter((_,j)=>j!==i)}))}>🏆 {a} ✕</span>)}</div>
        </div>
        <div className="form-group"><label className="label">Upload File (optional)</label><input type="file" style={{color:"var(--tx)",fontSize:12}} onChange={e=>setFile(e.target.files[0])}/></div>
        <div style={{display:"flex",gap:8}}><button className="btn btn-primary" onClick={submitResearch}>Submit</button><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button></div>
      </Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function FacultyDashboard() {
  const { userProfile:p, linkedId } = useAuth();
  const { data:schedules } = useFirestore(()=>FacultyService.getSchedules(linkedId));
  const { data:research }  = useFirestore(()=>FacultyService.getResearch(linkedId));
  const { data:events }    = useFirestore(()=>EventsService.getAll({status:"upcoming"}));
  return (
    <div className="page-content fu">
      <div style={{ background:"rgba(52,211,153,.05)", border:"1px solid rgba(52,211,153,.14)", borderRadius:14, padding:"18px 22px", marginBottom:24, display:"flex", gap:14, alignItems:"center" }}>
        <div style={{ fontSize:30 }}>👨‍🏫</div>
        <div>
          <div className="syne" style={{ fontWeight:800, fontSize:17 }}>Welcome, {p?.title} {p?.lastName}!</div>
          <div style={{ fontSize:12, color:"var(--mu2)", marginTop:2 }}>{(p?.position||"").replace("_"," ")} · {p?.deptId} · Firebase Realtime</div>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard value={(schedules||[]).length}   label="Subjects"      color="var(--a)"  icon="📚"/>
        <StatCard value={(research||[]).length}    label="Research"      color="var(--pu)" icon="🔬"/>
        <StatCard value={p?.publications||0}       label="Publications"  color="var(--go)" icon="📄"/>
        <StatCard value={p?.yearsInService||0}     label="Yrs Service"   color="var(--gr)" icon="🏆"/>
      </div>
      <div className="d2">
        <Section title="My Schedules">
          {(schedules||[]).length===0?<div style={{color:"var(--mu2)",fontSize:13}}>No schedules.</div>:
          <div className="tw"><table className="tbl"><thead><tr><th>Code</th><th>Subject</th><th>Section</th><th>Days</th><th>Time</th><th>Room</th></tr></thead>
          <tbody>{(schedules||[]).map(sc=><tr key={sc.id}><td><span className="mono" style={{color:"var(--a2)",fontSize:11}}>{sc.subjectId}</span></td><td style={{fontSize:12}}>{sc.subjectId}</td><td><B t="bl">{sc.section}</B></td><td style={{fontSize:11}}>{sc.dayOfWeek}</td><td style={{fontSize:11,fontFamily:"monospace"}}>{sc.timeStart}–{sc.timeEnd}</td><td style={{fontSize:11}}>{sc.room}</td></tr>)}</tbody></table></div>}
        </Section>
        <div>
          <Section title="Recent Research">
            {(research||[]).slice(0,3).map(r=><div key={r.id} style={{padding:"8px 0",borderBottom:"1px solid var(--bd)"}}><div className="syne" style={{fontWeight:700,fontSize:12}}>{r.title}</div><div style={{fontSize:11,color:"var(--mu2)",marginTop:2}}>{r.journal||"—"} · {r.publishYear||"Ongoing"}</div></div>)}
            {(!research||research.length===0)&&<div style={{color:"var(--mu2)",fontSize:13}}>No research yet.</div>}
          </Section>
          <Section title="Upcoming Events">
            {(events||[]).slice(0,3).map(ev=><EventCard key={ev.id} event={ev}/>)}
          </Section>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTY — MY STUDENTS
// ═══════════════════════════════════════════════════════════════════════════════
export function FacultyMyStudents() {
  const { linkedId } = useAuth();
  const [schedId,setSchedId]=useState("");
  const { data:schedules } = useFirestore(()=>FacultyService.getSchedules(linkedId));
  const { data:students,loading } = useFirestore(()=>schedId?ScheduleService.getEnrolledStudents(schedId):Promise.resolve([]),[schedId]);
  return (
    <div className="page-content fu">
      <PageHeader title="My Students" sub="Students enrolled in your classes"/>
      <div style={{marginBottom:20}}><label className="label">Select Class</label>
        <select className="input" style={{maxWidth:400}} value={schedId} onChange={e=>setSchedId(e.target.value)}>
          <option value="">— Choose a class —</option>
          {(schedules||[]).map(s=><option key={s.id} value={s.id}>{s.subjectId} · {s.section} ({s.dayOfWeek} {s.timeStart})</option>)}
        </select>
      </div>
      {!schedId?<div className="dc" style={{textAlign:"center",color:"var(--mu2)"}}>Select a class above to see enrolled students.</div>:loading?<Loading/>:(students||[]).length===0?<Empty icon="🎓" text="No students enrolled"/>:(
        <div className="tw"><table className="tbl"><thead><tr><th>Student</th><th>ID</th><th>Course</th><th>Year</th></tr></thead>
        <tbody>{(students||[]).filter(Boolean).map(s=><tr key={s.id}><td><div style={{display:"flex",alignItems:"center",gap:10}}><Av firstName={s.firstName} lastName={s.lastName} color="#3B82F6" size="s"/><span style={{fontWeight:600}}>{s.lastName}, {s.firstName}</span></div></td><td><span className="mono" style={{fontSize:11,color:"var(--a2)"}}>{s.id}</span></td><td style={{fontSize:12}}>{s.course}</td><td>Yr {s.yearLevel}</td></tr>)}</tbody></table></div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTY — UPLOAD MODULES
// ═══════════════════════════════════════════════════════════════════════════════
export function FacultyModules() {
  const { linkedId, currentUser } = useAuth();
  const [schedId,setSchedId]=useState("");
  const [form,setForm]=useState({title:"",moduleType:"lesson",description:"",weekNumber:""});
  const [file,setFile]=useState(null); const [progress,setProgress]=useState(0); const [uploading,setUploading]=useState(false);
  const { data:schedules } = useFirestore(()=>FacultyService.getSchedules(linkedId));
  const { data:modules,loading,refetch } = useFirestore(()=>schedId?ModulesService.getBySchedule(schedId):Promise.resolve([]),[schedId]);
  const typeIcon={lesson:"📖",activity:"⚡",quiz:"❓",assignment:"📝",syllabus:"📋",other:"📄"};

  const handleUpload = async () => {
    if(!schedId||!form.title.trim())return toast.error("Select class and enter title");
    setUploading(true);
    try {
      await ModulesService.upload({...form,schedId,weekNumber:parseInt(form.weekNumber)||null,file,uploadedBy:currentUser.uid,onProgress:setProgress});
      toast.success("Module uploaded!"); setForm({title:"",moduleType:"lesson",description:"",weekNumber:""}); setFile(null); setProgress(0); refetch();
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  return (
    <div className="page-content fu">
      <PageHeader title="Upload Modules" sub="Manage course materials, lessons, quizzes and activities"/>
      <div style={{marginBottom:20}}><label className="label">Select Class</label>
        <select className="input" style={{maxWidth:420}} value={schedId} onChange={e=>setSchedId(e.target.value)}>
          <option value="">— Choose a class —</option>
          {(schedules||[]).map(s=><option key={s.id} value={s.id}>{s.subjectId} · {s.section}</option>)}
        </select>
      </div>
      {schedId&&<>
        <Section title="Upload New Material">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="form-group"><label className="label">Title *</label><input className="input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
            <div className="form-group"><label className="label">Type</label><select className="input" value={form.moduleType} onChange={e=>setForm(p=>({...p,moduleType:e.target.value}))}>{Object.keys(typeIcon).map(t=><option key={t} value={t}>{typeIcon[t]} {t}</option>)}</select></div>
            <div className="form-group"><label className="label">Week #</label><input className="input" type="number" min={1} max={18} value={form.weekNumber} onChange={e=>setForm(p=>({...p,weekNumber:e.target.value}))}/></div>
            <div className="form-group"><label className="label">File (optional)</label><input type="file" style={{color:"var(--tx)",fontSize:12,padding:"10px 0"}} onChange={e=>setFile(e.target.files[0])}/></div>
          </div>
          <div className="form-group"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
          {uploading&&<ProgressBar progress={progress}/>}
          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>{uploading?`Uploading ${progress}%…`:"⬆ Upload"}</button>
        </Section>
        <div className="dct" style={{marginTop:20}}>Uploaded ({(modules||[]).length})</div>
        {loading?<Loading/>:(modules||[]).length===0?<Empty icon="📤" text="No modules yet"/>:(modules||[]).map(m=>(
          <div key={m.id} style={{background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,marginBottom:8,opacity:m.isVisible?1:0.6}}>
            <div style={{width:40,height:40,borderRadius:9,background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{typeIcon[m.moduleType]||"📄"}</div>
            <div style={{flex:1}}><div className="syne" style={{fontWeight:700,fontSize:13}}>{m.title}</div><div style={{fontSize:11,color:"var(--mu2)",marginTop:2}}>Week {m.weekNumber||"—"} · {m.fileType||"No file"} · {m.fileSize||""}</div></div>
            <B t={m.isVisible?"gr":"re"}>{m.isVisible?"Visible":"Hidden"}</B>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-secondary" style={{padding:"5px 10px",fontSize:11}} onClick={async()=>{await ModulesService.toggleVisibility(m.id);refetch();}}>{m.isVisible?"Hide":"Show"}</button>
              <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:11}} onClick={async()=>{if(window.confirm("Delete?")){await ModulesService.delete(m.id);refetch();}}}>Delete</button>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTY — MANAGE GRADES
// ═══════════════════════════════════════════════════════════════════════════════
export function FacultyManageGrades() {
  const { linkedId } = useAuth();
  const [schedId,setSchedId]=useState(""); const [grades,setGrades]=useState({}); const [saving,setSaving]=useState(false);
  const { data:schedules } = useFirestore(()=>FacultyService.getSchedules(linkedId));
  const { data:existingGrades,loading,refetch } = useFirestore(()=>schedId?GradesService.getBySchedule(schedId):Promise.resolve([]),[schedId]);
  const { data:students } = useFirestore(()=>schedId?ScheduleService.getEnrolledStudents(schedId):Promise.resolve([]),[schedId]);

  useEffect(()=>{
    const init={};
    (existingGrades||[]).forEach(g=>{init[g.studentId]={prelim:g.prelim!=null?String(g.prelim):"",midterm:g.midterm!=null?String(g.midterm):"",finals:g.finals!=null?String(g.finals):""};});
    setGrades(init);
  },[existingGrades]);

  const computeFinal = g => {
    const p=parseFloat(g?.prelim),m=parseFloat(g?.midterm),f=parseFloat(g?.finals);
    return (!isNaN(p)&&!isNaN(m)&&!isNaN(f))?(p*.3+m*.3+f*.4).toFixed(2):null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const bulk=(students||[]).filter(Boolean).map(s=>({
        studentId:s.id,schedId,schoolYear:"2024-2025",semester:"1st",
        prelim:grades[s.id]?.prelim?parseFloat(grades[s.id].prelim):null,
        midterm:grades[s.id]?.midterm?parseFloat(grades[s.id].midterm):null,
        finals:grades[s.id]?.finals?parseFloat(grades[s.id].finals):null,
      }));
      await GradesService.bulkUpsert(bulk);
      toast.success(`${bulk.length} grades saved!`); refetch();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const gc=g=>!g?"var(--mu2)":g>=75?"var(--gr)":"var(--re)";

  return (
    <div className="page-content fu">
      <PageHeader title="Manage Grades" sub="Encode Prelim, Midterm and Finals grades"/>
      <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div style={{flex:1,minWidth:280}}><label className="label">Select Class</label>
          <select className="input" value={schedId} onChange={e=>setSchedId(e.target.value)}>
            <option value="">— Choose a class —</option>
            {(schedules||[]).map(s=><option key={s.id} value={s.id}>{s.subjectId} · {s.section}</option>)}
          </select>
        </div>
        {schedId&&<button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?"💾 Saving…":"💾 Save Grades"}</button>}
      </div>
      {schedId&&<>
        <div style={{background:"rgba(56,189,248,.05)",border:"1px solid rgba(56,189,248,.12)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:"var(--mu2)"}}>
          ℹ️ Final = Prelim(30%) + Midterm(30%) + Finals(40%) · Passing: ≥75
        </div>
        <div className="tw"><table className="tbl"><thead><tr><th>Student</th><th>ID</th><th>Prelim (30%)</th><th>Midterm (30%)</th><th>Finals (40%)</th><th>Final</th><th>Remarks</th></tr></thead>
        <tbody>{loading?<tr><td colSpan={7} style={{textAlign:"center",padding:20,color:"var(--mu2)"}}>Loading…</td></tr>:(students||[]).filter(Boolean).map(s=>{
          const g=grades[s.id]||{prelim:"",midterm:"",finals:""};
          const final=computeFinal(g); const passed=final?parseFloat(final)>=75:null;
          return <tr key={s.id}>
            <td><div style={{display:"flex",alignItems:"center",gap:9}}><Av firstName={s.firstName} lastName={s.lastName} color="#3B82F6" size="s"/><span style={{fontWeight:600,fontSize:12}}>{s.lastName}, {s.firstName}</span></div></td>
            <td><span className="mono" style={{fontSize:11,color:"var(--a2)"}}>{s.id}</span></td>
            {["prelim","midterm","finals"].map(term=><td key={term}><input type="number" min={0} max={100} step={0.01} placeholder="0–100" value={g[term]||""} onChange={e=>setGrades(prev=>({...prev,[s.id]:{...prev[s.id]||{},[term]:e.target.value}}))}
              style={{width:80,padding:"6px 8px",background:"var(--s1)",border:`1.5px solid ${g[term]?(parseFloat(g[term])>=75?"rgba(52,211,153,.4)":"rgba(248,113,113,.4)"):"var(--bd)"}`,borderRadius:7,color:"var(--tx)",fontFamily:"monospace",fontSize:12,outline:"none"}}/></td>)}
            <td><span className="syne" style={{fontWeight:800,fontSize:16,color:gc(parseFloat(final))}}>{final||"—"}</span></td>
            <td>{passed!==null?<B t={passed?"gr":"re"}>{passed?"Passed":"Failed"}</B>:<span style={{color:"var(--mu2)",fontSize:12}}>—</span>}</td>
          </tr>;
        })}</tbody></table></div>
      </>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function StudentDashboard() {
  const { userProfile:p, linkedId } = useAuth();
  const { data:grades }     = useFirestore(()=>StudentService.getGrades(linkedId,"2024-2025","1st"));
  const { data:schedule }   = useFirestore(()=>StudentService.getSchedule(linkedId));
  const { data:activities } = useFirestore(()=>StudentService.getActivities(linkedId));
  const { data:awards }     = useFirestore(()=>StudentService.getAwards(linkedId));
  const { data:events }     = useFirestore(()=>EventsService.getAll({status:"upcoming"}));
  const avg = (grades||[]).length?(((grades||[]).reduce((s,g)=>s+(parseFloat(g.finalGrade)||0),0))/(grades||[]).length).toFixed(2):null;
  return (
    <div className="page-content fu">
      <div style={{ background:"rgba(251,191,36,.05)", border:"1px solid rgba(251,191,36,.14)", borderRadius:14, padding:"18px 22px", marginBottom:24, display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ fontSize:30 }}>🎓</div>
        <div style={{ flex:1 }}>
          <div className="syne" style={{ fontWeight:800, fontSize:17 }}>Welcome, {p?.firstName}!</div>
          <div style={{ fontSize:12, color:"var(--mu2)", marginTop:2 }}>{p?.course} · Year {p?.yearLevel} · Section {p?.section}</div>
        </div>
        {avg&&<div style={{textAlign:"center"}}><div className="syne" style={{fontSize:28,fontWeight:900,color:parseFloat(avg)>=85?"var(--gr)":parseFloat(avg)>=75?"var(--a)":"var(--re)"}}>{avg}</div><div style={{fontSize:11,color:"var(--mu2)"}}>Semester Avg</div></div>}
      </div>
      <div className="stats-grid">
        <StatCard value={(schedule||[]).length}    label="Subjects"      color="var(--a)"  icon="📚"/>
        <StatCard value={(grades||[]).length}      label="Graded"        color="var(--gr)" icon="📊"/>
        <StatCard value={(activities||[]).length}  label="Activities"    color="var(--pu)" icon="⚽"/>
        <StatCard value={(awards||[]).length}      label="Awards"        color="var(--go)" icon="🏆"/>
      </div>
      <div className="d2">
        <Section title="My Schedule">
          {(schedule||[]).length===0?<div style={{color:"var(--mu2)",fontSize:13}}>No subjects enrolled.</div>:
          <div className="tw"><table className="tbl"><thead><tr><th>Code</th><th>Subject</th><th>Faculty</th><th>Days</th><th>Time</th></tr></thead>
          <tbody>{(schedule||[]).map(sc=><tr key={sc.id}><td><span className="mono" style={{color:"var(--a2)",fontSize:11}}>{sc.subject?.subjectCode}</span></td><td style={{fontWeight:600,fontSize:12}}>{sc.subject?.subjectTitle}</td><td style={{fontSize:11}}>{sc.faculty?.title||""} {sc.faculty?.lastName}</td><td style={{fontSize:11}}>{sc.dayOfWeek}</td><td style={{fontSize:11,fontFamily:"monospace"}}>{sc.timeStart}–{sc.timeEnd}</td></tr>)}</tbody></table></div>}
        </Section>
        <div>
          {(activities||[]).length>0&&<Section title="My Activities">{(activities||[]).slice(0,4).map((a,i)=><div key={i} style={{padding:"7px 0",borderBottom:"1px solid var(--bd)"}}><div className="syne" style={{fontWeight:700,fontSize:12,color:"var(--gr)"}}>{a.activityName}</div><div style={{fontSize:11,color:"var(--mu2)",marginTop:1}}>{a.positionRole} {a.teamOrg?`· ${a.teamOrg}`:""}</div></div>)}</Section>}
          {(awards||[]).length>0&&<Section title="🏆 My Awards">{(awards||[]).slice(0,4).map((a,i)=><div key={i} style={{padding:"7px 0",borderBottom:"1px solid var(--bd)",fontSize:12,color:"var(--go)"}}>{a.awardName}</div>)}</Section>}
          <Section title="Upcoming Events">{(events||[]).slice(0,3).map(ev=><EventCard key={ev.id} event={ev}/>)}</Section>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT GRADES
// ═══════════════════════════════════════════════════════════════════════════════
export function StudentGrades() {
  const { linkedId } = useAuth();
  const [sy,setSy]=useState("2024-2025"); const [sem,setSem]=useState("1st");
  const { data:grades, loading } = useFirestore(()=>StudentService.getGrades(linkedId,sy,sem),[sy,sem]);
  const avg=(grades||[]).length?((grades||[]).reduce((s,g)=>s+(parseFloat(g.finalGrade)||0),0)/(grades||[]).length).toFixed(2):null;
  return (
    <div className="page-content fu">
      <PageHeader title="My Grades" sub="Current semester grades"/>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <select className="filter-select" value={sy} onChange={e=>setSy(e.target.value)}><option value="2024-2025">2024–2025</option><option value="2023-2024">2023–2024</option></select>
        <select className="filter-select" value={sem} onChange={e=>setSem(e.target.value)}><option value="1st">1st Semester</option><option value="2nd">2nd Semester</option><option value="Summer">Summer</option></select>
      </div>
      {avg&&<div className="dc" style={{display:"flex",alignItems:"center",gap:20,marginBottom:20}}><div style={{textAlign:"center"}}><div className="syne" style={{fontSize:40,fontWeight:900,color:parseFloat(avg)>=85?"var(--gr)":parseFloat(avg)>=75?"var(--a)":"var(--re)"}}>{avg}</div><div style={{fontSize:12,color:"var(--mu2)"}}>Semester Average</div></div><div style={{fontSize:13,color:"var(--mu2)",lineHeight:1.7,flex:1}}>Prelim(30%) + Midterm(30%) + Finals(40%) = Final Grade<br/>Passing: ≥75.00</div></div>}
      {loading?<Loading/>:(grades||[]).length===0?<Empty icon="📊" text="No grades yet"/>:
      <div className="tw"><table className="tbl"><thead><tr><th>Subject</th><th>Section</th><th>Faculty</th><th>Prelim</th><th>Midterm</th><th>Finals</th><th>Final</th><th>Remarks</th></tr></thead>
      <tbody>{(grades||[]).map(g=>{const fg=parseFloat(g.finalGrade);return<tr key={g.id}>
        <td style={{fontWeight:600}}>{g.subject?.subjectCode} · {g.subject?.subjectTitle}</td><td><B t="bl">{g.schedule?.section}</B></td><td style={{fontSize:12}}>{g.faculty?.lastName}</td>
        <td>{g.prelim||"—"}</td><td>{g.midterm||"—"}</td><td>{g.finals||"—"}</td>
        <td><span className="syne" style={{fontWeight:800,fontSize:17,color:fg>=75?"var(--gr)":"var(--re)"}}>{g.finalGrade||"—"}</span></td>
        <td>{g.finalGrade?<B t={fg>=75?"gr":"re"}>{fg>=75?"Passed":"Failed"}</B>:"—"}</td>
      </tr>;})}
      </tbody></table></div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT GRADE HISTORY
// ═══════════════════════════════════════════════════════════════════════════════
export function StudentGradeHistory() {
  const { linkedId } = useAuth();
  const { data:grades,loading } = useFirestore(()=>StudentService.getGrades(linkedId,null,null,true));
  const grouped=(grades||[]).reduce((acc,g)=>{const k=`${g.schoolYear} — ${g.semester} Semester`;if(!acc[k])acc[k]=[];acc[k].push(g);return acc;},{});
  return (
    <div className="page-content fu">
      <PageHeader title="Grade History" sub="All past and current grades"/>
      {loading?<Loading/>:Object.keys(grouped).length===0?<Empty icon="📋" text="No grade history"/>:Object.entries(grouped).map(([group,items])=>{
        const avg=(items.reduce((s,g)=>s+(parseFloat(g.finalGrade)||0),0)/items.length).toFixed(2);
        return <div key={group} style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><div style={{width:4,height:24,borderRadius:2,background:"var(--a2)"}}/><div className="syne" style={{fontWeight:800,fontSize:14}}>{group}</div><div style={{fontSize:12,color:"var(--mu2)"}}>Avg: <span style={{color:"var(--gr)",fontWeight:700}}>{avg}</span></div></div>
          <div className="tw"><table className="tbl"><thead><tr><th>Subject</th><th>Units</th><th>Final</th><th>Remarks</th></tr></thead>
          <tbody>{items.map(g=>{const fg=parseFloat(g.finalGrade);return<tr key={g.id}><td style={{fontWeight:600}}>{g.subject?.subjectCode} · {g.subject?.subjectTitle}</td><td>{g.subject?.units}</td><td><span className="syne" style={{fontWeight:800,fontSize:16,color:fg>=75?"var(--gr)":"var(--re)"}}>{g.finalGrade||"—"}</span></td><td>{g.finalGrade?<B t={fg>=75?"gr":"re"}>{fg>=75?"Passed":"Failed"}</B>:"—"}</td></tr>;})}
          </tbody></table></div>
        </div>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT ACTIVITIES (Extra-Curricular Form)
// ═══════════════════════════════════════════════════════════════════════════════
export function StudentActivities() {
  const { linkedId } = useAuth();
  const { data:activities,loading,refetch } = useFirestore(()=>StudentService.getActivities(linkedId));
  const [form,setForm]=useState({activityType:"sport",activityName:"",positionRole:"",teamOrg:"",schoolYear:"2024-2025"});
  const [achievements,setAch]=useState([]); const [ai,setAi]=useState(""); const [submitting,setSub]=useState(false);
  const OPTS={sport:["Basketball","Volleyball","Swimming","Track and Field","Chess","Badminton","Table Tennis","Sepak Takraw","Other"],pageant:["Miss CCS","Mr. CCS","Campus Royalty","Other"],org:["CCS Student Council","JPCS","Google DSC","IEEE","Other"],volunteer:["Community Service","Teach IT","Other"],other:["Dance","Debate","Music","Other"]};
  const ICONS={sport:"⚽",pageant:"👑",org:"👥",volunteer:"💙",other:"⭐"};

  const handleSubmit = async () => {
    if(!form.activityName)return toast.error("Select an activity");
    setSub(true);
    try {
      await StudentService.addActivity({...form,studentId:linkedId,achievements});
      toast.success("Activity added!"); setForm({activityType:"sport",activityName:"",positionRole:"",teamOrg:"",schoolYear:"2024-2025"}); setAch([]); setAi(""); refetch();
    } catch { toast.error("Failed"); }
    finally { setSub(false); }
  };

  return (
    <div className="page-content fu">
      <PageHeader title="Extra-Curricular Activities" sub="Register your sports, pageants, organizations and other activities"/>
      <Section title="Register New Activity">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="form-group"><label className="label">Activity Type</label>
            <select className="input" value={form.activityType} onChange={e=>setForm(p=>({...p,activityType:e.target.value,activityName:""}))}>
              {Object.keys(OPTS).map(t=><option key={t} value={t}>{ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">Specific Activity</label>
            <select className="input" value={form.activityName} onChange={e=>setForm(p=>({...p,activityName:e.target.value}))}>
              <option value="">Select…</option>{(OPTS[form.activityType]||[]).map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">Position / Role</label><input className="input" placeholder="e.g. Point Guard" value={form.positionRole} onChange={e=>setForm(p=>({...p,positionRole:e.target.value}))}/></div>
          <div className="form-group"><label className="label">Team / Organization</label><input className="input" placeholder="e.g. CCS Wolves" value={form.teamOrg} onChange={e=>setForm(p=>({...p,teamOrg:e.target.value}))}/></div>
        </div>
        <div className="form-group"><label className="label">Achievements</label>
          <div style={{display:"flex",gap:8}}><input className="input" placeholder="Add achievement…" value={ai} onChange={e=>setAi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ai.trim()&&(setAch(p=>[...p,ai.trim()]),setAi(""))}/><button className="btn btn-secondary" onClick={()=>ai.trim()&&(setAch(p=>[...p,ai.trim()]),setAi(""))}>+</button></div>
          <div className="tags" style={{marginTop:6}}>{achievements.map((a,i)=><span key={i} className="tag" style={{cursor:"pointer",color:"var(--go)"}} onClick={()=>setAch(p=>p.filter((_,j)=>j!==i))}>🏆 {a} ✕</span>)}</div>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting?"Saving…":"Register Activity"}</button>
      </Section>
      <Section title="My Activities">
        {loading?<Loading/>:(activities||[]).length===0?<Empty icon="⚽" text="No activities yet"/>:
        <div className="cards-grid">{(activities||[]).map(a=><div key={a.id} style={{background:"rgba(255,255,255,.03)",border:"1px solid var(--bd)",borderRadius:12,padding:16}}>
          <div style={{fontSize:22,marginBottom:8}}>{ICONS[a.activityType]||"⭐"}</div>
          <div className="syne" style={{fontWeight:800,fontSize:14,color:"var(--gr)"}}>{a.activityName}</div>
          <div style={{fontSize:12,color:"var(--mu2)",marginTop:3}}>{a.positionRole} {a.teamOrg?`· ${a.teamOrg}`:""}</div>
          {(Array.isArray(a.achievements)?a.achievements:[]).map((ach,i)=><div key={i} style={{fontSize:12,color:"var(--go)",marginTop:3}}>🏆 {ach}</div>)}
        </div>)}</div>}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT AWARDS
// ═══════════════════════════════════════════════════════════════════════════════
export function StudentAwards() {
  const { linkedId } = useAuth();
  const { data:awards, loading } = useFirestore(()=>StudentService.getAwards(linkedId));
  return (
    <div className="page-content fu">
      <PageHeader title="My Awards" sub="Academic, sports and cultural recognitions"/>
      {loading?<Loading/>:(awards||[]).length===0?<Empty icon="🏆" text="No awards yet"/>:
      <div className="tw"><table className="tbl"><thead><tr><th>Award</th><th>Type</th><th>Awarded By</th><th>Date</th></tr></thead>
      <tbody>{(awards||[]).map(a=><tr key={a.id}><td style={{fontWeight:600}}>🏆 {a.awardName}</td><td><B t="go">{a.awardType||"—"}</B></td><td style={{fontSize:12}}>{a.awardedBy||"—"}</td><td style={{fontSize:12}}>{fmtDate(a.awardDate)}</td></tr>)}</tbody></table></div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT MODULES (view only)
// ═══════════════════════════════════════════════════════════════════════════════
export function StudentModulesView() {
  const { linkedId } = useAuth();
  const [schedId,setSchedId]=useState("");
  const { data:schedule } = useFirestore(()=>StudentService.getSchedule(linkedId));
  const { data:modules,loading } = useFirestore(()=>schedId?ModulesService.getBySchedule(schedId,true):Promise.resolve([]),[schedId]);
  const typeIcon={lesson:"📖",activity:"⚡",quiz:"❓",assignment:"📝",syllabus:"📋",other:"📄"};
  return (
    <div className="page-content fu">
      <PageHeader title="Modules & Lessons" sub="Course materials from your faculty"/>
      <div style={{marginBottom:20}}><label className="label">Select Subject</label>
        <select className="input" style={{maxWidth:400}} value={schedId} onChange={e=>setSchedId(e.target.value)}>
          <option value="">— Choose a subject —</option>
          {(schedule||[]).map(sc=><option key={sc.id} value={sc.id}>{sc.subject?.subjectCode} · {sc.subject?.subjectTitle}</option>)}
        </select>
      </div>
      {!schedId?<div className="dc" style={{textAlign:"center",color:"var(--mu2)"}}>Select a subject above to view modules.</div>:loading?<Loading/>:(modules||[]).length===0?<Empty icon="📚" text="No modules yet"/>:
      (modules||[]).map(m=><div key={m.id} style={{background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,marginBottom:8}}>
        <div style={{width:42,height:42,borderRadius:10,background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{typeIcon[m.moduleType]||"📄"}</div>
        <div style={{flex:1}}><div className="syne" style={{fontWeight:700,fontSize:14}}>{m.title}</div><div style={{fontSize:12,color:"var(--mu2)",marginTop:2}}>Week {m.weekNumber||"—"} · {m.fileType||"No file"} · {m.fileSize||""}</div>{m.description&&<div style={{fontSize:12,color:"var(--mu2)",marginTop:4}}>{m.description}</div>}</div>
        {m.fileUrl&&<a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{fontSize:12}}>⬇ Download</a>}
      </div>)}
    </div>
  );
}
