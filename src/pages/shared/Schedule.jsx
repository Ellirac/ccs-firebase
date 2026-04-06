// src/pages/shared/Schedule.jsx — Firebase version
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ScheduleService, StudentService } from "../../services/firebase.services";
import { useFirestore } from "../../hooks/useFirestore";
import { PageHeader, Loading, Empty, B, Section, InfoGrid, Modal } from "../../components/common";
import toast from "react-hot-toast";

const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat"];
const TIMES = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];
const DEPT_COLORS = { CS:"#3B82F6", IT:"#10B981", IS:"#F59E0B", DS:"#8B5CF6" };

export function SchedulePage() {
  const { isAdmin, isFaculty, isStudent, linkedId } = useAuth();
  const [sy,setSy]=useState("2024-2025"); const [sem,setSem]=useState("1st");
  const [dept,setDept]=useState(""); const [section,setSection]=useState("");
  const [view,setView]=useState("grid"); const [sel,setSel]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({subjectId:"",facultyId:"",section:"",deptId:"CS",dayOfWeek:"Mon,Wed,Fri",timeStart:"",timeEnd:"",room:"",schoolYear:"2024-2025",semester:"1st"});

  const fetchFn = isStudent
    ? () => StudentService.getSchedule(linkedId, sy, sem)
    : () => ScheduleService.getAll({ schoolYear:sy, semester:sem, deptId:dept||undefined, facultyId:isFaculty&&!isAdmin?linkedId:undefined, section:section||undefined });

  const { data:schedules, loading, refetch } = useFirestore(fetchFn, [sy,sem,dept,section]);

  // Build grid
  const grid = {};
  (schedules||[]).forEach(sc => {
    const days = (sc.dayOfWeek||sc.day_of_week||"").split(",").map(d=>d.trim());
    const timeKey = (sc.timeStart||sc.time_start||"").slice(0,5);
    days.forEach(d => {
      const key = `${d}_${timeKey}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(sc);
    });
  });

  const getName = sc => sc.subject?.subjectTitle || sc.subjectId || "—";
  const getCode = sc => sc.subject?.subjectCode || sc.subjectId || "—";

  const submitSchedule = async () => {
    try { await ScheduleService.create(form); toast.success("Schedule created!"); setShowAdd(false); refetch(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="page-content fu">
      <PageHeader title="Class Schedule" sub={`${(schedules||[]).length} schedules · ${sy} ${sem} Semester`}
        actions={<div style={{display:"flex",gap:8}}>
          <select className="filter-select" value={sy} onChange={e=>setSy(e.target.value)}><option value="2024-2025">2024–2025</option><option value="2023-2024">2023–2024</option></select>
          <select className="filter-select" value={sem} onChange={e=>setSem(e.target.value)}><option value="1st">1st Sem</option><option value="2nd">2nd Sem</option><option value="Summer">Summer</option></select>
          <div style={{display:"flex",gap:2}}>
            {["grid","list"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"7px 12px",borderRadius:8,border:"1px solid var(--bd)",background:view===v?"var(--a2)":"var(--s2)",color:view===v?"#fff":"var(--mu2)",cursor:"pointer",fontSize:12}}>{v==="grid"?"📅":"📋"}</button>)}
          </div>
          {isAdmin&&<button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add</button>}
        </div>}/>

      {isAdmin&&<div className="search-bar">
        <select className="filter-select" value={dept} onChange={e=>setDept(e.target.value)}><option value="">All Depts</option>{["CS","IT","IS","DS"].map(d=><option key={d} value={d}>{d}</option>)}</select>
        <input className="search-input" style={{width:140}} placeholder="Section" value={section} onChange={e=>setSection(e.target.value)}/>
      </div>}

      {loading?<Loading/>:(schedules||[]).length===0?<Empty icon="🗓️" text="No schedules"/>:(
        view==="grid"?(
          <div style={{overflowX:"auto"}}>
            <div style={{display:"grid",gridTemplateColumns:`70px repeat(${DAYS.length},1fr)`,gap:2,minWidth:700}}>
              <div/>
              {DAYS.map(d=><div key={d} style={{background:"var(--s2)",borderRadius:9,padding:"9px 6px",textAlign:"center",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"var(--a2)",border:"1px solid var(--bd)"}}>{d}</div>)}
              {TIMES.map(t=><React.Fragment key={t}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"var(--mu)",fontSize:10,fontFamily:"monospace"}}>{t}</div>
                {DAYS.map(d=>{const slots=grid[`${d}_${t}`]||[];const sc=slots[0];const color=sc?(DEPT_COLORS[sc.deptId||sc.dept_id]||"#6366F1"):null;
                  return <div key={d+t} onClick={()=>sc&&setSel(sc)} style={{minHeight:64,borderRadius:8,border:`1px solid ${color?color+"44":"var(--bd)"}`,background:color?`${color}0E`:"var(--s2)",padding:sc?"8px 10px":0,display:"flex",flexDirection:"column",justifyContent:"center",cursor:sc?"pointer":"default"}}>
                    {sc&&<><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,color}}>{getCode(sc)}</div><div style={{fontSize:9,color:"var(--mu2)",marginTop:2}}>{sc.section}</div><div style={{fontSize:9,color:"var(--mu2)"}}>{sc.room}</div></>}
                  </div>;
                })}
              </React.Fragment>)}
            </div>
          </div>
        ):(
          <div className="tw"><table className="tbl"><thead><tr><th>Code</th><th>Subject</th><th>Section</th><th>Faculty</th><th>Days</th><th>Time</th><th>Room</th></tr></thead>
          <tbody>{(schedules||[]).map(sc=><tr key={sc.id} style={{cursor:"pointer"}} onClick={()=>setSel(sc)}>
            <td><span className="mono" style={{color:"var(--a2)",fontSize:12}}>{getCode(sc)}</span></td>
            <td style={{fontWeight:600,fontSize:12}}>{getName(sc)}</td>
            <td><B t="bl">{sc.section}</B></td>
            <td style={{fontSize:12}}>{sc.faculty?.title||""} {sc.faculty?.lastName||sc.facultyId}</td>
            <td style={{fontSize:12}}>{sc.dayOfWeek||sc.day_of_week}</td>
            <td style={{fontSize:12,fontFamily:"monospace"}}>{(sc.timeStart||sc.time_start||"").slice(0,5)}–{(sc.timeEnd||sc.time_end||"").slice(0,5)}</td>
            <td style={{fontSize:12}}>{sc.room}</td>
          </tr>)}</tbody></table></div>
        )
      )}

      {sel&&<Modal open={!!sel} onClose={()=>setSel(null)} title={getName(sel)} maxWidth={520}>
        <Section title="Schedule Details">
          <InfoGrid items={[["Subject",getCode(sel)],["Section",sel.section],["Faculty",sel.faculty?`${sel.faculty.title||""} ${sel.faculty.lastName}`:sel.facultyId],["Email",sel.faculty?.email||"—"],["Days",sel.dayOfWeek||sel.day_of_week],["Time",`${(sel.timeStart||"").slice(0,5)}–${(sel.timeEnd||"").slice(0,5)}`],["Room",sel.room||"TBA"],["Semester",sel.semester],["School Year",sel.schoolYear]]}/>
        </Section>
        {isAdmin&&<button className="btn btn-danger" onClick={async()=>{if(window.confirm("Delete this schedule?")){await ScheduleService.delete(sel.id);toast.success("Deleted");setSel(null);refetch();}}}>Delete Schedule</button>}
      </Modal>}

      {showAdd&&<Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Schedule" maxWidth={540}>
        {[["subjectId","Subject ID (e.g. CS301)"],["facultyId","Faculty ID (e.g. FAC-002)"],["section","Section (e.g. 3CS-A)"],["room","Room"]].map(([k,l])=><div className="form-group" key={k}><label className="label">{l}</label><input className="input" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>)}
        <div className="form-group"><label className="label">Department</label><select className="input" value={form.deptId} onChange={e=>setForm(p=>({...p,deptId:e.target.value}))}>{["CS","IT","IS","DS"].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
        <div className="form-group"><label className="label">Days (e.g. Mon,Wed,Fri)</label><input className="input" value={form.dayOfWeek} onChange={e=>setForm(p=>({...p,dayOfWeek:e.target.value}))}/></div>
        {[["timeStart","Start Time","time"],["timeEnd","End Time","time"]].map(([k,l,t])=><div className="form-group" key={k}><label className="label">{l}</label><input className="input" type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></div>)}
        <div style={{display:"flex",gap:8}}><button className="btn btn-primary" onClick={submitSchedule}>Create</button><button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button></div>
      </Modal>}
    </div>
  );
}
