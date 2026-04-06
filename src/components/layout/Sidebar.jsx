// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Av, initials } from "../common";
import toast from "react-hot-toast";

const MENUS = {
  admin: [
    { section:"Main" },
    { to:"/admin/dashboard",     icon:"🏠", label:"Dashboard"       },
    { to:"/admin/profile",       icon:"👤", label:"My Profile"       },
    { section:"College" },
    { to:"/admin/org-structure", icon:"🏛️", label:"Org Structure"    },
    { to:"/admin/students",      icon:"🎓", label:"Student Profiles" },
    { to:"/admin/faculty",       icon:"👨‍🏫", label:"Faculty Profiles" },
    { section:"Academic" },
    { to:"/admin/curriculum",    icon:"📚", label:"Curriculum"       },
    { to:"/admin/schedule",      icon:"🗓️", label:"Schedule"         },
    { section:"Activities" },
    { to:"/admin/events",        icon:"📅", label:"Events"           },
    { to:"/admin/research",      icon:"🔬", label:"Research"         },
    { to:"/admin/reports",      icon:"🔬", label:"Reports"         },
  ],
  faculty: [
    { section:"Main" },
    { to:"/faculty/dashboard",   icon:"🏠", label:"Dashboard"     },
    { to:"/faculty/profile",     icon:"👤", label:"My Profile"     },
    { section:"Teaching" },
    { to:"/faculty/students",    icon:"🎓", label:"My Students"    },
    { to:"/faculty/modules",     icon:"📤", label:"Upload Modules" },
    { to:"/faculty/grades",      icon:"📊", label:"Manage Grades"  },
    { to:"/faculty/schedule",    icon:"🗓️", label:"My Schedule"    },
    { section:"Academic" },
    { to:"/faculty/research",    icon:"🔬", label:"My Research"    },
    { to:"/faculty/events",      icon:"📅", label:"Events"         },
  ],
  student: [
    { section:"Main" },
    { to:"/student/dashboard",      icon:"🏠", label:"Dashboard"       },
    { to:"/student/profile",        icon:"👤", label:"My Profile"       },
    { section:"Academics" },
    { to:"/student/schedule",       icon:"🗓️", label:"Class Schedule"   },
    { to:"/student/grades",         icon:"📊", label:"Current Grades"   },
    { to:"/student/grade-history",  icon:"📋", label:"Grade History"    },
    { to:"/student/modules",        icon:"📚", label:"Modules"          },
    { section:"Student Life" },
    { to:"/student/activities",     icon:"⚽", label:"Extra-Curricular" },
    { to:"/student/awards",         icon:"🏆", label:"Awards"           },
    { to:"/student/events",         icon:"📅", label:"Events"           },
  ],
};
const RC = { admin:"#38BDF8", faculty:"#34D399", student:"#FBBF24" };

export default function Sidebar() {
  const { currentUser, userProfile:p, role, logout } = useAuth();
  const navigate = useNavigate();
  const items = MENUS[role] || [];
  const rc    = RC[role] || "#6366F1";

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/login");
  };

  const displayName = p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : currentUser?.email;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/ccs-logo.jpg" alt="CCS Logo"
          style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:"2px solid rgba(255,255,255,0.15)" }}/>
        <div>
          <div className="sidebar-logo-text syne">CCS Profiling</div>
          <div className="sidebar-logo-sub">PnC · {role?.toUpperCase()}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-label">{item.section}</div>
          ) : (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive?" active":""}`}>
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>
      <div className="sidebar-user">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="sidebar-avatar"
            style={p?.profilePic ? { backgroundImage:`url(${p.profilePic})` } : { background:`linear-gradient(135deg,${rc},${rc}88)` }}>
            {!p?.profilePic && initials(p?.firstName, p?.lastName)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="sidebar-user-name syne">{displayName}</div>
            <div className="sidebar-user-role" style={{ color:rc }}>{role}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>⬡ Sign Out</button>
      </div>
    </aside>
  );
}
