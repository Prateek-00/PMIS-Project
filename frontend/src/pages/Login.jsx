// src/pages/Login.jsx — PREMIUM GLASSMORPHISM DESIGN
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await api.post("/auth/register", form);
        setIsRegister(false);
        alert("Account created! Please login.");
      } else {
        const res = await api.post("/auth/login", { email: form.email, password: form.password });
        login(res.data.token, { id: res.data.id, name: res.data.name, role: res.data.role, email: form.email });
        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "company") navigate("/company");
        else navigate("/student");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally { setLoading(false); }
  };

  const demos = [
    { role: "Admin",   email: "admin@pmis.com",    pass: "admin123", color: "#a855f7" },
    { role: "Student", email: "alice@demo.com",    pass: "demo123",  color: "#3b82f6" },
    { role: "Company", email: "techcorp@demo.com", pass: "demo123",  color: "#10b981" },
  ];

  return (
    <div style={S.page}>
      <div style={{...S.orb, width:500, height:500, top:-150, left:-150, background:"radial-gradient(circle, #3b82f635, transparent)"}} />
      <div style={{...S.orb, width:400, height:400, bottom:-100, right:-100, background:"radial-gradient(circle, #8b5cf630, transparent)"}} />

      <div style={S.wrap}>
        {/* LEFT — Branding */}
        <div style={S.left}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
            <div style={S.logoBox}>
              <span style={{color:"#fff",fontWeight:900,fontSize:26,fontFamily:"monospace"}}>P</span>
            </div>
            <span style={{color:"#fff",fontSize:24,fontWeight:800,letterSpacing:3}}>PMIS</span>
          </div>

          <h1 style={S.headline}>AI-Powered<br/><span style={{background:"linear-gradient(90deg,#3b82f6,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Internship</span><br/>Allocation</h1>

          <p style={S.sub}>Hybrid AI engine combines a weighted scoring formula with Random Forest ML to match students to internships in milliseconds.</p>

          <div style={S.pills}>
            {[
              {icon:"🧠", text:"Random Forest ML"},
              {icon:"⚡", text:"Real-time Scoring"},
              {icon:"🎯", text:"Greedy Matching"},
            ].map(p => (
              <div key={p.text} style={S.pill}>
                <span>{p.icon}</span>
                <span style={{color:"#94a3b8",fontSize:13}}>{p.text}</span>
              </div>
            ))}
          </div>

          <div style={S.formula}>
            <div style={{color:"#475569",fontSize:11,marginBottom:8,letterSpacing:1}}>SCORING FORMULA</div>
            {[
              {label:"Skill Match",  pct:"40%", color:"#3b82f6"},
              {label:"CGPA Score",   pct:"25%", color:"#a855f7"},
              {label:"Location",     pct:"20%", color:"#10b981"},
              {label:"Domain Fit",   pct:"15%", color:"#f59e0b"},
            ].map(f => (
              <div key={f.label} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{color:"#64748b",fontSize:12}}>{f.label}</span>
                  <span style={{color:f.color,fontSize:12,fontWeight:700}}>{f.pct}</span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:4}}>
                  <div style={{height:4,width:f.pct,background:f.color,borderRadius:4,boxShadow:`0 0 8px ${f.color}80`}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Form */}
        <div style={S.right}>
          <div style={S.card}>
            <h2 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"0 0 4px"}}>
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p style={{color:"#475569",fontSize:13,margin:"0 0 24px"}}>
              {isRegister ? "Join the PMIS platform" : "Sign in to your dashboard"}
            </p>

            {error && <div style={S.err}>{error}</div>}

            {isRegister && (
              <Field label="Full Name" value={form.name}
                onChange={v => setForm({...form, name: v})}
                type="text" placeholder="Your name" />
            )}
            <Field label="Email" value={form.email}
              onChange={v => setForm({...form, email: v})}
              type="email" placeholder="you@example.com" />
            <Field label="Password" value={form.password}
              onChange={v => setForm({...form, password: v})}
              onKeyDown={e => e.key==="Enter" && handleSubmit()}
              type="password" placeholder="••••••••" />

            {isRegister && (
              <div style={{marginBottom:16}}>
                <label style={S.label}>Role</label>
                <select style={S.input} value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              ...S.btn,
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "⏳ Please wait..." : isRegister ? "Create Account →" : "Sign In →"}
            </button>

            <p style={{textAlign:"center",color:"#475569",fontSize:13,marginTop:14}}>
              {isRegister ? "Have an account? " : "No account? "}
              <span onClick={() => {setIsRegister(!isRegister); setError("");}}
                style={{color:"#3b82f6",cursor:"pointer",fontWeight:600}}>
                {isRegister ? "Sign In" : "Register"}
              </span>
            </p>

            <div style={S.divider}><span style={S.dividerTxt}>Quick Demo</span></div>

            <div style={{display:"flex",gap:8}}>
              {demos.map(d => (
                <button key={d.role}
                  onClick={() => setForm({...form, email: d.email, password: d.pass})}
                  style={{
                    flex:1, border:`1px solid ${d.color}50`,
                    background: `${d.color}12`, color: d.color,
                    borderRadius:8, padding:"8px 4px",
                    fontSize:12, fontWeight:600, cursor:"pointer",
                  }}>
                  {d.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({label, value, onChange, type, placeholder, onKeyDown}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{marginBottom:16}}>
      <label style={S.label}>{label}</label>
      <input
        style={{...S.input, borderColor: focused ? "#3b82f6" : "rgba(255,255,255,0.08)"}}
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

const S = {
  page:{
    minHeight:"100vh",
    background:"linear-gradient(135deg,#020617 0%,#0c1426 50%,#020617 100%)",
    display:"flex", alignItems:"center", justifyContent:"center",
    padding:24, position:"relative", overflow:"hidden",
    fontFamily:"'Segoe UI',system-ui,sans-serif",
  },
  orb:{ position:"absolute", borderRadius:"50%", filter:"blur(60px)", pointerEvents:"none" },
  wrap:{ display:"flex", gap:48, maxWidth:920, width:"100%", alignItems:"center", position:"relative", zIndex:1 },
  left:{ flex:1 },
  right:{ width:360, flexShrink:0 },
  logoBox:{
    width:44, height:44, borderRadius:12,
    background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow:"0 0 24px #3b82f650",
  },
  headline:{ color:"#fff", fontSize:40, fontWeight:800, lineHeight:1.2, margin:"0 0 16px", letterSpacing:-1 },
  sub:{ color:"#475569", fontSize:14, lineHeight:1.7, margin:"0 0 24px" },
  pills:{ display:"flex", flexDirection:"column", gap:8, marginBottom:28 },
  pill:{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 12px" },
  formula:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:16 },
  card:{
    background:"rgba(15,23,42,0.85)", backdropFilter:"blur(20px)",
    border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:32,
    boxShadow:"0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  err:{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", fontSize:13, padding:"10px 14px", borderRadius:10, marginBottom:16 },
  label:{ display:"block", color:"#475569", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:6 },
  input:{
    width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:14, outline:"none",
    boxSizing:"border-box", transition:"border-color 0.2s", fontFamily:"inherit",
  },
  btn:{
    width:"100%", background:"linear-gradient(135deg,#3b82f6,#6366f1)",
    border:"none", borderRadius:10, padding:13, color:"#fff", fontSize:15,
    fontWeight:600, cursor:"pointer", boxShadow:"0 4px 20px rgba(59,130,246,0.4)",
    letterSpacing:0.3, transition:"opacity 0.2s",
  },
  divider:{ position:"relative", textAlign:"center", margin:"16px 0", borderTop:"1px solid rgba(255,255,255,0.06)" },
  dividerTxt:{ position:"relative", top:-10, background:"#0f172a", padding:"0 12px", color:"#334155", fontSize:11, textTransform:"uppercase", letterSpacing:1 },
};
