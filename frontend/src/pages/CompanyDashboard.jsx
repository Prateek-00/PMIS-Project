// src/pages/CompanyDashboard.jsx — PREMIUM DESIGN
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function CompanyDashboard() {
  const [tab, setTab]           = useState("listings");
  const [listings, setListings] = useState([]);
  const [posting, setPosting]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [form, setForm] = useState({
    title:"", description:"", domain:"", location:"",
    min_cgpa:"", stipend:"", duration:"", openings:1,
  });

  useEffect(() => { loadListings(); }, []);

  const loadListings = async () => {
    try {
      const res = await api.get("/company/listings");
      setListings(res.data);
    } catch (e) { console.error(e); }
  };

  const postListing = async () => {
    if (!form.title) { alert("Title is required"); return; }
    setPosting(true);
    try {
      await api.post("/company/listings", {
        ...form,
        min_cgpa: parseFloat(form.min_cgpa)||0,
        stipend:  parseInt(form.stipend)||0,
        openings: parseInt(form.openings)||1,
      });
      setSaved(true); setTimeout(()=>setSaved(false), 3000);
      setForm({title:"",description:"",domain:"",location:"",min_cgpa:"",stipend:"",duration:"",openings:1});
      loadListings();
      setTab("listings");
    } catch(e) { alert(e.response?.data?.error||"Error"); }
    finally { setPosting(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#020617,#0c1426)",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <Navbar />
      <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>

        <div style={{marginBottom:28}}>
          <h1 style={{color:"#fff",fontSize:26,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.5}}>Company Portal</h1>
          <p style={{color:"#475569",fontSize:14,margin:0}}>{listings.length} internships posted</p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:28,background:"rgba(255,255,255,0.03)",padding:4,borderRadius:12,width:"fit-content",border:"1px solid rgba(255,255,255,0.06)"}}>
          {[
            {id:"listings",label:"📋 My Listings",count:listings.length},
            {id:"post",    label:"➕ Post Internship"},
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"8px 18px",borderRadius:9,border:"none",
              background:tab===t.id?"rgba(16,185,129,0.2)":"transparent",
              color:tab===t.id?"#34d399":"#475569",
              fontSize:13,fontWeight:600,cursor:"pointer",
              boxShadow:tab===t.id?"0 0 0 1px rgba(16,185,129,0.3)":"none",
            }}>
              {t.label}
              {t.count > 0 && <span style={{marginLeft:6,background:"rgba(16,185,129,0.3)",color:"#34d399",fontSize:10,padding:"1px 6px",borderRadius:10}}>{t.count}</span>}
            </button>
          ))}
        </div>

        {saved && (
          <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"#10b981",fontSize:13,padding:"12px 16px",borderRadius:12,marginBottom:20}}>
            ✅ Internship posted successfully!
          </div>
        )}

        {/* LISTINGS */}
        {tab === "listings" && (
          <div>
            {listings.length === 0 ? (
              <div style={{textAlign:"center",padding:60,color:"#334155"}}>
                <p style={{fontSize:40,margin:"0 0 12px"}}>📝</p>
                <p style={{marginBottom:12}}>No listings yet</p>
                <button onClick={()=>setTab("post")} style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",color:"#10b981",padding:"8px 20px",borderRadius:8,cursor:"pointer",fontSize:13}}>
                  Post your first internship →
                </button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {listings.map(l => (
                  <div key={l.id} style={{
                    background:"rgba(255,255,255,0.02)",
                    border:`1px solid ${l.is_active?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.05)"}`,
                    borderRadius:16,padding:20,
                  }}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                          <h3 style={{color:"#e2e8f0",fontWeight:600,fontSize:16,margin:0}}>{l.title}</h3>
                          <span style={{
                            fontSize:11,padding:"2px 10px",borderRadius:20,fontWeight:600,
                            background:l.is_active?"rgba(16,185,129,0.1)":"rgba(100,116,139,0.1)",
                            color:l.is_active?"#10b981":"#64748b",
                            border:`1px solid ${l.is_active?"rgba(16,185,129,0.3)":"rgba(100,116,139,0.2)"}`,
                          }}>{l.is_active?"● Active":"○ Inactive"}</span>
                        </div>
                        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                          {[
                            {icon:"📍",val:l.location},
                            {icon:"🏷️",val:l.domain},
                            {icon:"💰",val:`₹${l.stipend?.toLocaleString()}/mo`},
                            {icon:"👥",val:`${l.openings} seats`},
                            {icon:"⏱️",val:l.duration},
                          ].map(i => (
                            <span key={i.icon} style={{color:"#475569",fontSize:13,display:"flex",alignItems:"center",gap:4}}>
                              {i.icon} {i.val}
                            </span>
                          ))}
                        </div>
                        {l.required_skills?.length > 0 && (
                          <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                            {l.required_skills.map(s => (
                              <span key={s.id} style={{fontSize:11,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.2)",padding:"3px 8px",borderRadius:20}}>{s.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* POST */}
        {tab === "post" && (
          <div style={{maxWidth:520}}>
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:28}}>
              <h2 style={{color:"#e2e8f0",fontSize:18,fontWeight:600,margin:"0 0 20px"}}>Post New Internship</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[
                  {key:"title",    label:"Title *",        type:"text",   placeholder:"ML Engineer Intern", full:true},
                  {key:"domain",   label:"Domain",         type:"text",   placeholder:"Machine Learning"},
                  {key:"location", label:"Location",       type:"text",   placeholder:"Delhi / Remote"},
                  {key:"min_cgpa", label:"Min CGPA",       type:"number", placeholder:"6.5"},
                  {key:"stipend",  label:"Stipend (₹/mo)", type:"number", placeholder:"15000"},
                  {key:"duration", label:"Duration",       type:"text",   placeholder:"3 months"},
                  {key:"openings", label:"Openings",       type:"number", placeholder:"2"},
                ].map(f => (
                  <div key={f.key} style={{gridColumn:f.full?"1/-1":"auto"}}>
                    <label style={{display:"block",color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{f.label}</label>
                    <input
                      type={f.type} placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e=>setForm({...form,[f.key]:e.target.value})}
                      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}
                    />
                  </div>
                ))}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Description</label>
                  <textarea
                    placeholder="Job description..."
                    value={form.description}
                    onChange={e=>setForm({...form,description:e.target.value})}
                    rows={3}
                    style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",resize:"none",fontFamily:"inherit"}}
                  />
                </div>
              </div>
              <button onClick={postListing} disabled={posting} style={{
                marginTop:20,width:"100%",
                background:"linear-gradient(135deg,#059669,#10b981)",
                border:"none",borderRadius:10,padding:13,color:"#fff",
                fontSize:15,fontWeight:600,cursor:posting?"not-allowed":"pointer",
                opacity:posting?0.7:1,boxShadow:"0 4px 20px rgba(16,185,129,0.3)",
              }}>
                {posting?"Posting...":"Post Internship →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
