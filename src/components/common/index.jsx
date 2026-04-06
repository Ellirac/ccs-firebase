// src/components/common/index.jsx
import React from "react";
export const initials = (f="",l="") => `${f[0]||""}${l[0]||""}`.toUpperCase();
export const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"}) : "—";
export const getAge   = b => { if(!b)return"—"; const d=new Date(b),t=new Date(); let a=t.getFullYear()-d.getFullYear(); if(t.getMonth()-d.getMonth()<0||(t.getMonth()===d.getMonth()&&t.getDate()<d.getDate()))a--; return a; };
export const gwaColor = g => g<=1.25?"#34D399":g<=1.75?"#38BDF8":g<=2.25?"#FBBF24":"#F87171";
export const DEPT_COLORS = { CS:"#3B82F6", IT:"#10B981", IS:"#F59E0B", DS:"#8B5CF6" };

export function Av({ firstName,lastName,pic,color="#6366F1",size="m" }) {
  return <div className={`av av-${size}`} style={pic?{backgroundImage:`url(${pic})`}:{background:`linear-gradient(135deg,${color},${color}88)`}}>{!pic&&initials(firstName,lastName)}</div>;
}
export function B({ children, t="bl" }) { return <span className={`bdg b-${t}`}>{children}</span>; }
export function GWARing({ gwa }) {
  const c = gwaColor(gwa);
  return <div className="gwa-ring" style={{borderColor:c,color:c}}>{Number(gwa).toFixed(2)}</div>;
}
export function StatCard({ value, label, color="var(--a)", icon }) {
  return <div className="stat-card">{icon&&<div style={{fontSize:20,marginBottom:6}}>{icon}</div>}<div className="stat-val" style={{color}}>{value}</div><div className="stat-label">{label}</div></div>;
}
export function Loading({ text="Loading…" }) {
  return <div className="loading"><div className="loading-spinner"/><span style={{fontSize:13,color:"var(--mu2)"}}>{text}</span></div>;
}
export function Empty({ icon="🔍", text="No records found" }) {
  return <div className="empty"><div style={{fontSize:38,marginBottom:10}}>{icon}</div><div>{text}</div></div>;
}
export function PageHeader({ title, sub, actions }) {
  return <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}><div><div className="page-title syne">{title}</div>{sub&&<div className="page-sub">{sub}</div>}</div>{actions&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{actions}</div>}</div>;
}
export function SearchBar({ value, onChange, placeholder="Search…", children }) {
  return <div className="search-bar"><div className="search-wrap"><span className="search-icon">🔍</span><input className="search-input" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>{children}</div>;
}
export function Modal({ open, onClose, title, children, maxWidth=700 }) {
  if(!open)return null;
  return <div className="modal-overlay" onClick={onClose}><div className="modal fu" style={{maxWidth}} onClick={e=>e.stopPropagation()}><div className="modal-header"><div className="syne" style={{fontWeight:800,fontSize:16}}>{title}</div><button className="modal-close" onClick={onClose}>✕</button></div><div className="modal-body">{children}</div></div></div>;
}
export function InfoGrid({ items }) {
  return <div className="info-grid">{items.map(([l,v])=><div className="info-item" key={l}><label>{l}</label><span>{v||"—"}</span></div>)}</div>;
}
export function Section({ title, children, style }) {
  return <div className="dc" style={style}><div className="dct">{title}</div>{children}</div>;
}
export function ProgressBar({ progress }) {
  return <div style={{height:4,background:"var(--bd)",borderRadius:2,overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:`${progress}%`,background:"var(--a2)",borderRadius:2,transition:"width .2s"}}/></div>;
}
export function StudentCard({ student:s, onClick }) {
  return <div className="card fu" onClick={()=>onClick&&onClick(s)}>
    <div style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:12}}>
      <Av firstName={s.firstName} lastName={s.lastName} pic={s.profilePic} color={DEPT_COLORS[s.deptId]||"#6366F1"}/>
      <div style={{flex:1,minWidth:0}}>
        <div className="syne" style={{fontWeight:800,fontSize:13,marginBottom:2}}>{s.lastName}, {s.firstName}</div>
        <div style={{fontSize:11,color:"var(--mu2)"}}>{s.course} · Yr {s.yearLevel} · {s.section}</div>
        <div className="pid">{s.id}</div>
      </div>
    </div>
    <div className="tags" style={{marginBottom:8}}>
      <B t="bl">{s.deptId}</B>
      {s.scholarship&&s.scholarship!=="None"&&<B t="go">Scholar</B>}
      {s.isAthlete&&<B t="gr">Athlete</B>}
      {s.isBeautyCandidate&&<B t="pk">Pageant</B>}
      {s.isOfficer&&<B t="pu">Officer</B>}
    </div>
  </div>;
}
export function FacultyCard({ faculty:f, onClick }) {
  const pc={dean:"var(--a)",dept_chair:"var(--gr)",permanent:"var(--mu2)",ft_cos:"var(--pu)",part_time:"var(--go)"};
  return <div className="card fu" onClick={()=>onClick&&onClick(f)}>
    <div style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:12}}>
      <Av firstName={f.firstName} lastName={f.lastName} pic={f.profilePic} color={pc[f.position]||"#6366F1"}/>
      <div style={{flex:1}}>
        <div className="syne" style={{fontWeight:800,fontSize:13}}>{f.title} {f.lastName}, {f.firstName}</div>
        <div style={{fontSize:11,color:"var(--mu2)",marginTop:2}}>{f.deptId} Department</div>
        <div className="pid">{f.id}</div>
      </div>
    </div>
    <div className="tags" style={{marginBottom:8}}>
      <B t="bl">{(f.position||"").replace("_"," ").toUpperCase()}</B>
      {f.publications>0&&<B t="go">{f.publications} pubs</B>}
      {f.yearsInService>0&&<B t="gr">{f.yearsInService} yrs</B>}
    </div>
    <div style={{fontSize:11,color:"var(--mu2)"}}>📚 {f.specialization||"—"}</div>
  </div>;
}
export function EventCard({ event:ev, onClick }) {
  const d=new Date(ev.eventDate);
  const tc={sports:"gr",pageant:"pk",academic:"bl",cultural:"pu",seminar:"go"};
  return <div style={{background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:13,padding:17,display:"flex",gap:13,marginBottom:12,cursor:"pointer"}} onClick={()=>onClick&&onClick(ev)}>
    <div style={{background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.2)",borderRadius:9,padding:"7px 11px",textAlign:"center",flexShrink:0,minWidth:50}}>
      <div className="syne" style={{fontSize:20,fontWeight:900,lineHeight:1,color:"var(--a2)"}}>{d.getDate()}</div>
      <div style={{fontSize:9,fontWeight:700,color:"var(--mu2)",textTransform:"uppercase"}}>{d.toLocaleString("default",{month:"short"})}</div>
    </div>
    <div style={{flex:1}}>
      <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
        <div className="syne" style={{fontWeight:800,fontSize:14}}>{ev.title}</div>
        <B t={tc[ev.eventType]||"gy"}>{ev.eventType}</B>
        <B t={ev.status==="upcoming"?"gr":"gy"}>{ev.status}</B>
      </div>
      <div style={{fontSize:12,color:"var(--mu2)"}}>{ev.venue} · {ev.organizer}</div>
    </div>
  </div>;
}
