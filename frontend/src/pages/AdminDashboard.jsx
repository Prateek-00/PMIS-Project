// src/pages/AdminDashboard.jsx — PREMIUM ADMIN PANEL
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function AdminDashboard() {
  const [tab, setTab]               = useState("overview");
  const [analytics, setAnalytics]   = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents]     = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [running, setRunning]       = useState(false);
  const [runResult, setRunResult]   = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [aRes, allocRes, sRes, iRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/allocations"),
        api.get("/admin/students"),
        api.get("/admin/internships"),
      ]);
      setAnalytics(aRes.data);
      setAllocations(allocRes.data);
      setStudents(sRes.data);
      setInternships(iRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const runAllocation = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await api.post("/admin/run-allocation");
      setRunResult(res.data);
      setAllocations(res.data.allocations || []);
      const aRes = await api.get("/admin/analytics");
      setAnalytics(aRes.data);
    } catch (e) { alert("Error: " + (e.response?.data?.error || e.message)); }
    finally { setRunning(false); }
  };

  const chartData = allocations.slice(0, 8).map(a => ({
    name: a.student_name?.split(" ")[0],
    score: a.total_score,
    skill: a.skill_score,
  }));

  const tabs = [
    { id:"overview",    icon:"📊", label:"Overview" },
    { id:"allocations", icon:"🏆", label:"Allocations" },
    { id:"students",    icon:"👥", label:"Students" },
    { id:"internships", icon:"💼", label:"Internships" },
  ];

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#020617",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{color:"#a855f7",fontSize:18}}>⚙️ Loading control panel...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#020617,#0c1426)",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <Navbar />

      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
        {/* Header row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
          <div>
            <h1 style={{color:"#fff",fontSize:26,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.5}}>
              Admin Control Panel
            </h1>
            <p style={{color:"#475569",fontSize:14,margin:0}}>PMIS AI Allocation System</p>
          </div>

          {/* THE BIG BUTTON */}
          <button onClick={runAllocation} disabled={running} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"14px 28px", borderRadius:14, border:"none",
            background: running ? "rgba(168,85,247,0.3)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
            color:"#fff", fontSize:16, fontWeight:700,
            cursor: running ? "not-allowed" : "pointer",
            boxShadow: running ? "none" : "0 8px 32px rgba(168,85,247,0.5)",
            transition:"all 0.2s", letterSpacing:0.3,
          }}>
            <span style={{fontSize:20}}>{running ? "⚙️" : "▶"}</span>
            {running ? "Running AI Engine..." : "Run AI Allocation"}
          </button>
        </div>

        {/* Result banner */}
        {runResult && (
          <div style={{
            background:"rgba(168,85,247,0.08)", border:"1px solid rgba(168,85,247,0.3)",
            borderRadius:14, padding:"16px 20px", marginBottom:24,
            display:"flex", alignItems:"center", gap:14,
          }}>
            <span style={{fontSize:28}}>✅</span>
            <div>
              <p style={{color:"#c084fc",fontWeight:700,margin:"0 0 2px",fontSize:15}}>{runResult.message}</p>
              <p style={{color:"#64748b",fontSize:13,margin:0}}>
                {runResult.total_matched} students matched • {runResult.time_taken}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:28,background:"rgba(255,255,255,0.03)",padding:4,borderRadius:12,width:"fit-content",border:"1px solid rgba(255,255,255,0.06)"}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"8px 18px", borderRadius:9, border:"none",
              background: tab===t.id ? "rgba(168,85,247,0.25)" : "transparent",
              color: tab===t.id ? "#c084fc" : "#475569",
              fontSize:13, fontWeight:600, cursor:"pointer",
              transition:"all 0.15s",
              boxShadow: tab===t.id ? "0 0 0 1px rgba(168,85,247,0.3)" : "none",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
              {[
                { label:"Total Students",    value: analytics?.total_students,    icon:"👥", color:"#3b82f6" },
                { label:"Total Companies",   value: analytics?.total_companies,   icon:"🏢", color:"#10b981" },
                { label:"Active Listings",   value: analytics?.total_internships, icon:"💼", color:"#f59e0b" },
                { label:"Allocations Done",  value: analytics?.total_allocations, icon:"🏆", color:"#a855f7" },
              ].map(s => (
                <div key={s.label} style={{
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:16, padding:"20px 24px",
                  borderTop:`2px solid ${s.color}40`,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:28}}>{s.icon}</span>
                    <span style={{color:s.color,fontSize:36,fontWeight:800,fontFamily:"monospace"}}>
                      {s.value ?? "—"}
                    </span>
                  </div>
                  <p style={{color:"#475569",fontSize:13,margin:"8px 0 0"}}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:28}}>
                <h3 style={{color:"#e2e8f0",fontWeight:600,fontSize:16,margin:"0 0 4px"}}>AI Match Scores</h3>
                <p style={{color:"#475569",fontSize:13,margin:"0 0 24px"}}>Top matched students — color coded by match quality</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{top:5,right:20,bottom:5,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" stroke="#334155" tick={{fill:"#475569",fontSize:12}} />
                    <YAxis domain={[0,100]} stroke="#334155" tick={{fill:"#475569",fontSize:12}} />
                    <Tooltip contentStyle={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"#fff"}} />
                    <Bar dataKey="score" name="Match Score %" radius={[6,6,0,0]} maxBarSize={48}>
                      {chartData.map((entry,i) => (
                        <Cell key={i} fill={entry.score>=75?"#10b981":entry.score>=50?"#f59e0b":"#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:12}}>
                  {[["#10b981","75%+ Great"],["#f59e0b","50-74% Good"],["#ef4444","<50% Low"]].map(([c,l]) => (
                    <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:c}} />
                      <span style={{color:"#475569",fontSize:12}}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:48,textAlign:"center"}}>
                <p style={{color:"#a855f7",fontSize:48,margin:"0 0 12px"}}>🤖</p>
                <p style={{color:"#475569",fontSize:16,margin:"0 0 6px"}}>No allocations yet</p>
                <p style={{color:"#334155",fontSize:13}}>Click "▶ Run AI Allocation" to start matching</p>
              </div>
            )}
          </div>
        )}

        {/* ALLOCATIONS */}
        {tab === "allocations" && (
          <div>
            <p style={{color:"#475569",fontSize:14,marginBottom:16}}>{allocations.length} total allocations</p>
            {allocations.length === 0 ? (
              <div style={{textAlign:"center",padding:48,color:"#334155"}}>No allocations. Run AI engine first.</div>
            ) : (
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                      {["Student","Internship","Company","Total","Skill","CGPA","Location","Domain"].map(h => (
                        <th key={h} style={{textAlign:"left",padding:"12px 16px",color:"#475569",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:0.8}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((a,i) => (
                      <tr key={a.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                        <td style={{padding:"12px 16px",color:"#e2e8f0",fontWeight:500}}>{a.student_name}</td>
                        <td style={{padding:"12px 16px",color:"#94a3b8"}}>{a.internship}</td>
                        <td style={{padding:"12px 16px",color:"#64748b"}}>{a.company}</td>
                        {[a.total_score, a.skill_score, a.cgpa_score, a.location_score, a.domain_score].map((v,j) => (
                          <td key={j} style={{padding:"12px 16px"}}>
                            <span style={{
                              fontFamily:"monospace", fontWeight:700, fontSize:13,
                              color: v>=75?"#10b981":v>=50?"#f59e0b":"#ef4444",
                            }}>{v}%</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS */}
        {tab === "students" && (
          <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  {["Name","Email","Branch","CGPA","Domain","Skills"].map(h => (
                    <th key={h} style={{textAlign:"left",padding:"12px 16px",color:"#475569",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:0.8}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s,i) => (
                  <tr key={s.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"12px 16px",color:"#e2e8f0",fontWeight:500}}>{s.name}</td>
                    <td style={{padding:"12px 16px",color:"#475569",fontSize:12}}>{s.email}</td>
                    <td style={{padding:"12px 16px",color:"#94a3b8"}}>{s.profile?.branch||"—"}</td>
                    <td style={{padding:"12px 16px",color:"#3b82f6",fontFamily:"monospace",fontWeight:700}}>{s.profile?.cgpa||"—"}</td>
                    <td style={{padding:"12px 16px",color:"#94a3b8"}}>{s.profile?.preferred_domain||"—"}</td>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {s.profile?.skills?.slice(0,3).map(sk => (
                          <span key={sk.id} style={{fontSize:10,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.2)",padding:"2px 7px",borderRadius:20}}>{sk.name}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INTERNSHIPS */}
        {tab === "internships" && (
          <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  {["Title","Company","Domain","Location","Min CGPA","Stipend","Seats","Status"].map(h => (
                    <th key={h} style={{textAlign:"left",padding:"12px 16px",color:"#475569",fontWeight:600,fontSize:12,textTransform:"uppercase",letterSpacing:0.8}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {internships.map((i,idx) => (
                  <tr key={i.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"12px 16px",color:"#e2e8f0",fontWeight:500}}>{i.title}</td>
                    <td style={{padding:"12px 16px",color:"#94a3b8"}}>{i.company_name}</td>
                    <td style={{padding:"12px 16px",color:"#64748b"}}>{i.domain}</td>
                    <td style={{padding:"12px 16px",color:"#64748b"}}>{i.location}</td>
                    <td style={{padding:"12px 16px",color:"#3b82f6",fontFamily:"monospace"}}>{i.min_cgpa}</td>
                    <td style={{padding:"12px 16px",color:"#10b981",fontFamily:"monospace"}}>₹{i.stipend?.toLocaleString()}</td>
                    <td style={{padding:"12px 16px",color:"#94a3b8"}}>{i.openings}</td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{
                        fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,
                        background: i.is_active?"rgba(16,185,129,0.1)":"rgba(100,116,139,0.1)",
                        color: i.is_active?"#10b981":"#64748b",
                        border: `1px solid ${i.is_active?"rgba(16,185,129,0.3)":"rgba(100,116,139,0.2)"}`,
                      }}>{i.is_active?"Active":"Inactive"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
