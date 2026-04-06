// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const PORTALS = [
  { role:"admin",   icon:"🏛️", label:"Admin",   color:"var(--a)",  home:"/admin/dashboard",   hint:{ email:"gbmontecillo@pnc.edu.ph", pass:"Admin@2024"   } },
  { role:"faculty", icon:"👨‍🏫", label:"Faculty", color:"var(--gr)", home:"/faculty/dashboard", hint:{ email:"eamagaling@pnc.edu.ph",   pass:"Faculty@2024" } },
  { role:"student", icon:"🎓", label:"Student", color:"var(--go)", home:"/student/dashboard", hint:{ email:"2021-00001@pnc.edu.ph",    pass:"Student@2024" } },
];

export default function Login() {
  const [role,  setRole]  = useState("admin");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [busy,  setBusy]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const portal    = PORTALS.find(p => p.role === role);

  const handleLogin = async () => {
    if (!email || !pass) return toast.error("Enter email and password");
    setBusy(true);
    try {
      const result = await login(email, pass);
      if (result.role !== role) {
        toast.error(`This account is a ${result.role}, not a ${role}`);
        setBusy(false);
        return;
      }
      toast.success(`Welcome, ${result.profile?.firstName || email}!`);
      navigate(portal.home);
    } catch (err) {
      const msg = err.code === "auth/invalid-credential" ? "Invalid email or password"
                : err.code === "auth/user-not-found"     ? "Account not found"
                : err.code === "auth/wrong-password"     ? "Wrong password"
                : err.message || "Login failed";
      toast.error(msg);
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="lbg"/><div className="lgrid"/>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:10 }}>
        <div className="fu" style={{ width:"100%", maxWidth:440 }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <img src="/ccs-logo.jpg" alt="CCS Logo"
              style={{ width:90, height:90, borderRadius:"50%", objectFit:"cover", margin:"0 auto 14px", display:"block", border:"3px solid rgba(255,255,255,0.12)", boxShadow:"0 0 32px rgba(99,102,241,0.25)" }}/>
            <div className="syne" style={{ fontSize:20,fontWeight:800,letterSpacing:"-.5px" }}>CCS Profiling System</div>
            <div style={{ fontSize:12,color:"var(--mu2)",marginTop:3 }}>Pamantasan ng Cabuyao · College of Computing Studies</div>
            <div style={{ fontSize:11,color:"var(--mu)",marginTop:2 }}>Powered by 🔥 Firebase</div>
          </div>

          {/* Role Tabs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:24 }}>
            {PORTALS.map(p => (
              <div key={p.role} onClick={() => { setRole(p.role); setEmail(""); setPass(""); }}
                style={{ padding:"13px 8px", borderRadius:12, border:`1.5px solid ${role===p.role?p.color:"var(--bd)"}`, background:role===p.role?`rgba(255,255,255,0.04)`:"var(--s2)", cursor:"pointer", textAlign:"center", transition:"all .2s" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{p.icon}</div>
                <div className="syne" style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:role===p.role?p.color:"var(--mu2)" }}>{p.label}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ background:"var(--s2)", border:"1px solid var(--bd2)", borderRadius:18, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:22, paddingBottom:16, borderBottom:"1px solid var(--bd)" }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:portal.color,boxShadow:`0 0 7px ${portal.color}` }}/>
              <span className="syne" style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:portal.color }}>
                🔥 Firebase · {portal.label} Portal
              </span>
            </div>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder={`${role}@pnc.edu.ph`} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Enter password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <button onClick={handleLogin} disabled={busy}
              style={{ width:"100%", padding:14, border:"none", borderRadius:11, fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, cursor:busy?"not-allowed":"pointer",
                background:role==="admin"?"linear-gradient(135deg,var(--a),var(--a2))":role==="faculty"?"linear-gradient(135deg,var(--gr),#0EA5E9)":"linear-gradient(135deg,var(--go),#F97316)",
                color:role==="admin"?"#fff":role==="faculty"?"#0a1a0a":"#1a0a00", opacity:busy?.7:1 }}>
              {busy ? "Signing in…" : `Sign In as ${portal.label}`}
            </button>
          </div>

          {/* Demo hint */}
          <div style={{ marginTop:16, padding:"12px 15px", background:"var(--s1)", borderRadius:11, fontSize:12, color:"var(--mu2)", border:"1px dashed var(--bd)" }}>
            <strong style={{ fontFamily:"'Syne',sans-serif", fontSize:10, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>
              🔥 Firebase Demo · {portal.label}
            </strong>
            Email: <code style={{ fontFamily:"monospace", color:"var(--a2)" }}>{portal.hint.email}</code>
            &nbsp;·&nbsp;
            Password: <code style={{ fontFamily:"monospace", color:"var(--a2)" }}>{portal.hint.pass}</code>
            &nbsp;&nbsp;
            <span onClick={() => { setEmail(portal.hint.email); setPass(portal.hint.pass); }} style={{ cursor:"pointer", color:"var(--a2)", fontWeight:700 }}>Auto-fill ↗</span>
          </div>
        </div>
      </div>
    </>
  );
}
