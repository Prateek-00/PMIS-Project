// src/components/InternshipCard.jsx — PREMIUM DESIGN
import { useState } from "react";

export default function InternshipCard({ internship, onApply }) {
  const [hovered, setHovered] = useState(false);
  const score = internship.match_score || 0;

  const scoreColor = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreBg    = score >= 75 ? "rgba(16,185,129,0.12)" : score >= 50 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)";
  const scoreLabel = score >= 75 ? "Great Match" : score >= 50 ? "Good Match" : "Low Match";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...S.card,
        borderColor: hovered ? scoreColor + "50" : "rgba(255,255,255,0.06)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${scoreColor}20` : "0 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      {/* Top */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <h3 style={S.title}>{internship.title}</h3>
          <p style={S.company}>{internship.company_name}</p>
        </div>
        {score > 0 && (
          <div style={{...S.scoreBadge, color: scoreColor, background: scoreBg, border:`1px solid ${scoreColor}30`}}>
            <span style={{fontSize:16,fontWeight:800,fontFamily:"monospace"}}>{score}%</span>
            <span style={{fontSize:9,textTransform:"uppercase",letterSpacing:0.8}}>{scoreLabel}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {score > 0 && (
        <div style={{marginBottom:14}}>
          <div style={S.barBg}>
            <div style={{
              height:6, borderRadius:4,
              width:`${score}%`,
              background:`linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`,
              boxShadow:`0 0 8px ${scoreColor}60`,
              transition:"width 1s ease",
            }} />
          </div>
        </div>
      )}

      {/* Info grid */}
      <div style={S.infoGrid}>
        {[
          { icon:"📍", val: internship.location || "—" },
          { icon:"🏷️", val: internship.domain   || "General" },
          { icon:"💰", val: `₹${internship.stipend?.toLocaleString() || 0}/mo` },
          { icon:"⏱️", val: internship.duration  || "—" },
        ].map(i => (
          <div key={i.icon} style={S.infoItem}>
            <span>{i.icon}</span>
            <span style={{color:"#64748b",fontSize:12}}>{i.val}</span>
          </div>
        ))}
      </div>

      {/* Skills */}
      {internship.required_skills?.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {internship.required_skills.slice(0,4).map(s => (
            <span key={s.id} style={S.skillTag}>{s.name}</span>
          ))}
          {internship.required_skills.length > 4 && (
            <span style={{color:"#475569",fontSize:11,alignSelf:"center"}}>
              +{internship.required_skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{color:"#334155",fontSize:12}}>
          Min CGPA: <span style={{color:"#64748b"}}>{internship.min_cgpa || 0}</span>
        </span>
        {onApply && (
          <button onClick={() => onApply(internship.id)} style={{
            ...S.applyBtn,
            background:`linear-gradient(135deg, ${scoreColor}20, ${scoreColor}30)`,
            border:`1px solid ${scoreColor}40`,
            color: scoreColor,
          }}>
            Apply Now →
          </button>
        )}
      </div>
    </div>
  );
}

const S = {
  card:{
    background:"rgba(15,23,42,0.8)", backdropFilter:"blur(10px)",
    border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20,
    transition:"all 0.25s ease", cursor:"default",
    fontFamily:"'Segoe UI',system-ui,sans-serif",
  },
  title:{ color:"#e2e8f0", fontWeight:600, fontSize:15, margin:"0 0 3px" },
  company:{ color:"#475569", fontSize:13, margin:0 },
  scoreBadge:{
    display:"flex", flexDirection:"column", alignItems:"center",
    padding:"8px 12px", borderRadius:10, minWidth:60,
  },
  barBg:{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:4, overflow:"hidden" },
  infoGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 },
  infoItem:{ display:"flex", alignItems:"center", gap:6 },
  skillTag:{
    fontSize:11, background:"rgba(59,130,246,0.1)",
    color:"#60a5fa", border:"1px solid rgba(59,130,246,0.2)",
    padding:"3px 8px", borderRadius:20,
  },
  applyBtn:{
    fontSize:12, fontWeight:600, padding:"6px 14px",
    borderRadius:8, cursor:"pointer",
  },
};
