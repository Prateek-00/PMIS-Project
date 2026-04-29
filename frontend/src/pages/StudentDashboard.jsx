// src/pages/StudentDashboard.jsx — PREMIUM DESIGN
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import InternshipCard from "../components/InternshipCard";
import api from "../api/axios";

export default function StudentDashboard() {
  const [tab, setTab]               = useState("recommendations");
  const [internships, setInternships] = useState([]);
  const [profile, setProfile]       = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [profileForm, setProfileForm] = useState({});
  const [skills, setSkills]         = useState([]);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, profileRes, allocRes] = await Promise.all([
        api.get("/student/recommendations"),
        api.get("/student/profile"),
        api.get("/student/allocation"),
      ]);
      setInternships(recRes.data);
      setProfile(profileRes.data);
      setProfileForm(profileRes.data.profile || {});
      setSkills(profileRes.data.profile?.skills || []);
      if (allocRes.data?.id) setAllocation(allocRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/student/profile", { ...profileForm, skill_ids: skills.map(s=>s.id) });
      setSaved(true); setTimeout(()=>setSaved(false), 2500);
      loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id:"recommendations", icon:"🎯", label:"Recommendations", count: internships.length },
    { id:"profile",         icon:"👤", label:"My Profile" },
    { id:"allocation",      icon:"🏆", label:"My Result", dot: !!allocation },
  ];

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#020617",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <p style={{color:"#3b82f6",fontSize:16}}>⚡ Loading your dashboard...</p>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#020617,#0c1426)",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <Navbar />
      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>

        {/* Header */}
        <div style={{marginBottom:28}}>
          <h1 style={{color:"#fff",fontSize:26,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.5}}>
            Hey {profile?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{color:"#475569",fontSize:14,margin:0}}>
            {internships.length} internships ranked by AI match score
          </p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:28,background:"rgba(255,255,255,0.03)",padding:4,borderRadius:12,width:"fit-content",border:"1px solid rgba(255,255,255,0.06)"}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"8px 18px", borderRadius:9, border:"none",
              background: tab===t.id ? "rgba(59,130,246,0.2)" : "transparent",
              color: tab===t.id ? "#60a5fa" : "#475569",
              fontSize:13, fontWeight:600, cursor:"pointer",
              transition:"all 0.15s", position:"relative",
              boxShadow: tab===t.id ? "0 0 0 1px rgba(59,130,246,0.3)" : "none",
            }}>
              {t.icon} {t.label}
              {t.count > 0 && (
                <span style={{marginLeft:6,background:"rgba(59,130,246,0.3)",color:"#60a5fa",fontSize:10,padding:"1px 6px",borderRadius:10}}>{t.count}</span>
              )}
              {t.dot && (
                <span style={{position:"absolute",top:6,right:6,width:6,height:6,background:"#10b981",borderRadius:"50%"}} />
              )}
            </button>
          ))}
        </div>

        {/* RECOMMENDATIONS */}
        {tab === "recommendations" && (
          <div>
            {internships.length === 0 ? (
              <div style={{textAlign:"center",padding:60,color:"#334155"}}>
                <p style={{fontSize:40,margin:"0 0 12px"}}>🔍</p>
                <p>No internships available yet.</p>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
                {internships.map(i => <InternshipCard key={i.id} internship={i} />)}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <div style={{maxWidth:520}}>
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:28}}>
              <h2 style={{color:"#e2e8f0",fontSize:18,fontWeight:600,margin:"0 0 20px"}}>Edit Your Profile</h2>

              {saved && (
                <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"#10b981",fontSize:13,padding:"10px 14px",borderRadius:10,marginBottom:16}}>
                  ✅ Profile saved successfully!
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                {[
                  {key:"cgpa",               label:"CGPA",             type:"number", placeholder:"8.5"},
                  {key:"year",               label:"Year",             type:"number", placeholder:"3"},
                  {key:"branch",             label:"Branch",           type:"text",   placeholder:"Computer Science"},
                  {key:"phone",              label:"Phone",            type:"text",   placeholder:"9876543210"},
                ].map(f => (
                  <div key={f.key}>
                    <label style={{display:"block",color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{f.label}</label>
                    <input
                      type={f.type} placeholder={f.placeholder}
                      value={profileForm[f.key]||""}
                      onChange={e => setProfileForm({...profileForm, [f.key]: e.target.value})}
                      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                  </div>
                ))}
              </div>

              {[
                {key:"preferred_domain",   label:"Preferred Domain",   placeholder:"Machine Learning"},
                {key:"preferred_location", label:"Preferred Location",  placeholder:"Delhi / Remote"},
              ].map(f => (
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{display:"block",color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{f.label}</label>
                  <input
                    type="text" placeholder={f.placeholder}
                    value={profileForm[f.key]||""}
                    onChange={e => setProfileForm({...profileForm, [f.key]: e.target.value})}
                    style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}
                  />
                </div>
              ))}

              <div style={{marginBottom:20}}>
                <label style={{display:"block",color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Your Skills</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {skills.map(s => (
                    <span key={s.id} style={{fontSize:12,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.2)",padding:"4px 10px",borderRadius:20,display:"flex",alignItems:"center",gap:5}}>
                      {s.name}
                      <span onClick={() => setSkills(skills.filter(x=>x.id!==s.id))} style={{cursor:"pointer",color:"#3b82f6",fontWeight:700}}>×</span>
                    </span>
                  ))}
                  {skills.length === 0 && <span style={{color:"#334155",fontSize:13}}>No skills added yet</span>}
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving} style={{
                width:"100%", background:"linear-gradient(135deg,#3b82f6,#6366f1)",
                border:"none", borderRadius:10, padding:13, color:"#fff",
                fontSize:15, fontWeight:600, cursor: saving?"not-allowed":"pointer",
                opacity: saving ? 0.7 : 1, boxShadow:"0 4px 20px rgba(59,130,246,0.3)",
              }}>
                {saving ? "Saving..." : "Save Profile →"}
              </button>
            </div>
          </div>
        )}

        {/* ALLOCATION */}
        {tab === "allocation" && (
          <div style={{maxWidth:520}}>
            {allocation ? (
              <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:20,padding:28}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                  <span style={{fontSize:36}}>🎉</span>
                  <div>
                    <h2 style={{color:"#fff",fontSize:20,fontWeight:700,margin:"0 0 2px"}}>You got matched!</h2>
                    <p style={{color:"#64748b",fontSize:13,margin:0}}>AI found your best fit internship</p>
                  </div>
                </div>

                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:20,marginBottom:20}}>
                  <p style={{color:"#fff",fontSize:18,fontWeight:600,margin:"0 0 4px"}}>{allocation.internship}</p>
                  <p style={{color:"#10b981",fontSize:14,margin:0}}>@ {allocation.company}</p>
                </div>

                <p style={{color:"#475569",fontSize:12,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Score Breakdown</p>
                {[
                  {label:"Overall Match",  val:allocation.total_score,    c:"#3b82f6"},
                  {label:"Skill Match",    val:allocation.skill_score,    c:"#10b981"},
                  {label:"CGPA Score",     val:allocation.cgpa_score,     c:"#a855f7"},
                  {label:"Location",       val:allocation.location_score, c:"#f59e0b"},
                  {label:"Domain Match",   val:allocation.domain_score,   c:"#ec4899"},
                ].map(({label,val,c}) => (
                  <div key={label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{color:"#64748b",fontSize:13}}>{label}</span>
                      <span style={{color:c,fontFamily:"monospace",fontWeight:700,fontSize:13}}>{val}%</span>
                    </div>
                    <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:6,width:`${val}%`,background:c,borderRadius:4,boxShadow:`0 0 8px ${c}60`}} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:60,textAlign:"center"}}>
                <p style={{fontSize:48,margin:"0 0 16px"}}>⏳</p>
                <p style={{color:"#475569",fontSize:16,margin:"0 0 6px"}}>No allocation yet</p>
                <p style={{color:"#334155",fontSize:13}}>Admin will run the AI engine soon</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
