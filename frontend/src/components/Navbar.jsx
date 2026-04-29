// src/components/Navbar.jsx — PREMIUM DESIGN
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleConfig = {
    student: { color: "#3b82f6", bg: "rgba(59,130,246,0.15)", label: "STUDENT" },
    company: { color: "#10b981", bg: "rgba(16,185,129,0.15)", label: "COMPANY" },
    admin:   { color: "#a855f7", bg: "rgba(168,85,247,0.15)", label: "ADMIN"   },
  };
  const rc = roleConfig[user?.role] || roleConfig.student;

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <div style={S.left}>
          <div style={S.logoBox}>
            <span style={{color:"#fff",fontWeight:900,fontSize:16,fontFamily:"monospace"}}>P</span>
          </div>
          <span style={S.brand}>PMIS</span>
          <span style={S.slash}>/</span>
          <span style={S.pageName}>
            {user?.role === "admin" ? "Control Panel" : user?.role === "company" ? "Company Portal" : "Student Portal"}
          </span>
        </div>

        {user && (
          <div style={S.right}>
            <span style={{...S.roleBadge, color: rc.color, background: rc.bg, border: `1px solid ${rc.color}30`}}>
              {rc.label}
            </span>
            <span style={S.userName}>{user.name}</span>
            <button onClick={() => { logout(); navigate("/"); }} style={S.logoutBtn}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

const S = {
  nav:{
    background:"rgba(2,6,23,0.9)", backdropFilter:"blur(20px)",
    borderBottom:"1px solid rgba(255,255,255,0.06)",
    position:"sticky", top:0, zIndex:100,
  },
  inner:{
    maxWidth:1200, margin:"0 auto", padding:"0 24px",
    height:60, display:"flex", alignItems:"center", justifyContent:"space-between",
  },
  left:{ display:"flex", alignItems:"center", gap:10 },
  logoBox:{
    width:30, height:30, borderRadius:8,
    background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  brand:{ color:"#fff", fontWeight:800, fontSize:16, letterSpacing:2 },
  slash:{ color:"#1e293b", fontSize:18, margin:"0 2px" },
  pageName:{ color:"#475569", fontSize:14 },
  right:{ display:"flex", alignItems:"center", gap:12 },
  roleBadge:{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:1.5 },
  userName:{ color:"#94a3b8", fontSize:14 },
  logoutBtn:{
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
    color:"#64748b", fontSize:13, padding:"5px 14px", borderRadius:8,
    cursor:"pointer", transition:"all 0.15s",
  },
};
