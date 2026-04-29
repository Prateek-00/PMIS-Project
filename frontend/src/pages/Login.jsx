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
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [hoverDemo, setHoverDemo] = useState(null);
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (p) => ({
    length:  p.length >= 8,
    upper:   /[A-Z]/.test(p),
    lower:   /[a-z]/.test(p),
    number:  /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p),
  });

  const handleSubmit = async () => {
    setError("");
    if (isRegister) {
      const v = validatePassword(form.password);
      if (!Object.values(v).every(Boolean)) {
        setError("Password does not meet the requirements below.");
        return;
      }
    }
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
    { role: "Student", color: "#3b82f6", accounts: [
      { label: "Alice",   email: "alice@demo.com",   pass: "demo123" },
    ]},
    { role: "Company", color: "#10b981", accounts: [
      { label: "TechCorp", email: "techcorp@demo.com", pass: "demo123" },
    ]},
  ];
  const adminDemo = { email: "admin@pmis.com", pass: "admin123" };

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
        {/* RIGHT — Form */}
        <div style={S.right}>
          <div style={S.card}>

          {isAdminLogin ? (<>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span onClick={() => setIsAdminLogin(false)}
                style={{color:"#475569",cursor:"pointer",fontSize:18,lineHeight:1}}
                title="Back">←</span>
              <h2 style={{color:"#fff",fontSize:22,fontWeight:700,margin:0}}>Admin Portal</h2>
            </div>
            <p style={{color:"#475569",fontSize:13,margin:"0 0 24px"}}>Restricted access — authorised personnel only</p>

            {error && <div style={S.err}>{error}</div>}

            <Field label="Admin Email" value={form.email}
              onChange={v => setForm({...form, email:v})} type="email" placeholder="admin@pmis.com" />
            <Field label="Password" value={form.password}
              onChange={v => setForm({...form, password:v})}
              onKeyDown={e => e.key==="Enter" && handleSubmit()}
              type="password" placeholder="••••••••" showToggle={true} />

            <button onClick={handleSubmit} disabled={loading} style={{...S.btn, background:"linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow:"0 4px 20px rgba(139,92,246,0.4)", opacity:loading?0.7:1}}>
              {loading ? "⏳ Verifying..." : "Access Admin Dashboard →"}
            </button>
            
          </>) : (<>
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
            <div style={{position:"relative"}}>

              <Field label="Password" value={form.password}
              onChange={v => setForm({...form, password: v})}
              onKeyDown={e => e.key==="Enter" && handleSubmit()}
              type="password" placeholder="••••••••"
              showToggle={true} />

            {isRegister && form.password.length > 0 && (() => {
              const v = validatePassword(form.password);
              const rules = [
                { key:"length",  text:"At least 8 characters" },
                { key:"upper",   text:"1 uppercase letter (A-Z)" },
                { key:"lower",   text:"1 lowercase letter (a-z)" },
                { key:"number",  text:"1 number (0-9)" },
                { key:"special", text:"1 special character (!@#...)" },
              ];
              return (
                <div style={S.rulesBox}>
                  {rules.map(r => (
                    <div key={r.key} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{ fontSize:11, color: v[r.key] ? "#10b981" : "#475569" }}>
                        {v[r.key] ? "✓" : "○"}
                      </span>
                      <span style={{ fontSize:11, color: v[r.key] ? "#10b981" : "#475569" }}>
                        {r.text}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {isRegister && (
              <div style={S.noReset}>
                ⚠️ We do not offer password reset. Please save your password securely.
              </div>
            )}
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position:"absolute", right:12, top:32,
                  background:"none", border:"none",
                  color:"#475569", cursor:"pointer", fontSize:16,
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            {isRegister && (
              <div style={{marginBottom:16}}>
                <label style={S.label}>Role</label>
                <select style={S.input} value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="company">Company</option>
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
                <div key={d.role} style={{flex:1, position:"relative"}}
                  onMouseEnter={() => setHoverDemo(d.role)}
                  onMouseLeave={() => setHoverDemo(null)}>
                  <button style={{
                    width:"100%", border:`1px solid ${d.color}50`,
                    background: hoverDemo===d.role ? `${d.color}25` : `${d.color}12`,
                    color: d.color, borderRadius:8, padding:"8px 4px",
                    fontSize:12, fontWeight:600, cursor:"pointer",
                    transition:"background 0.15s",
                  }}>
                    {d.role}
                  </button>
                  {hoverDemo === d.role && (
                    <div style={{
                      position:"absolute", bottom:"calc(100% + 6px)", left:0, right:0,
                      background:"#0f172a", border:`1px solid ${d.color}40`,
                      borderRadius:8, padding:4, zIndex:10,
                      boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
                    }}>
                      {d.accounts.map(acc => (
                        <div key={acc.email}
                          onClick={() => { setForm({...form, email:acc.email, password:acc.pass}); setHoverDemo(null); }}
                          style={{
                            padding:"7px 10px", borderRadius:6, cursor:"pointer",
                            color:"#94a3b8", fontSize:12, fontWeight:500,
                            transition:"background 0.1s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background=`${d.color}18`}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}
                        >
                          {acc.label}
                          <span style={{float:"right", color:"#334155", fontSize:10}}>{acc.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{textAlign:"center", marginTop:12}}>
              <span onClick={() => setIsAdminLogin(true)}
                style={{color:"#334155", fontSize:11, cursor:"pointer", letterSpacing:0.5,
                  transition:"color 0.15s"}}
                onMouseEnter={e => e.target.style.color="#475569"}
                onMouseLeave={e => e.target.style.color="#334155"}>
                🔐 Admin Portal
              </span>

            </div>
          </>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({label, value, onChange, type, placeholder, onKeyDown, showToggle}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{marginBottom:16}}>
      <label style={S.label}>{label}</label>
      <div style={{position:"relative"}}>
        <input
          style={{
            ...S.input,
            borderColor: focused ? "#3b82f6" : "rgba(255,255,255,0.08)",
            paddingRight: (isPassword && showToggle) ? 40 : 14,
          }}
          type={isPassword && showToggle ? (visible ? "text" : "password") : type}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
        />
        {isPassword && showToggle && (
          <span
            onClick={() => setVisible(v => !v)}
            style={{
              position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              cursor:"pointer", color:"#475569", fontSize:15, userSelect:"none",
              transition:"color 0.15s",
            }}
            onMouseEnter={e => e.target.style.color="#94a3b8"}
            onMouseLeave={e => e.target.style.color="#475569"}
          >
            {visible ? "🙈" : "👁"}
          </span>
        )}
      </div>
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
  rulesBox:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 14px", marginBottom:12, marginTop:-8 },
  noReset:{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", color:"#fbbf24", fontSize:12, padding:"9px 13px", borderRadius:10, marginBottom:16, lineHeight:1.5 },
};
