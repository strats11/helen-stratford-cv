import { useState, useEffect, useCallback } from "react";

const quotes = [
  "The best way to predict the future is to create it.",
  "Every expert was once a beginner.",
  "Code is like humor — if you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Learning to code is learning to create and innovate.",
];

const ACCENT = "#10b981", CARD_BG = "#424851", SUB = "#d1d19f";

const COMMUTE_LEGS = {
  morning: [
    { line: "victoria", label: "Victoria", color: "#0098D4", from: "Walthamstow Central", to: "King's Cross St. Pancras", stations: ["walthamstow central","blackhorse road","tottenham hale","seven sisters","finsbury park","highbury & islington","king's cross st. pancras"] },
    { line: "metropolitan", label: "Metropolitan / H&C", color: "#9B0056", from: "King's Cross St. Pancras", to: "Farringdon", stations: ["king's cross st. pancras","farringdon"], alsoCheck: ["hammersmith-city"] },
  ],
  afternoon: [
    { line: "metropolitan", label: "Metropolitan / H&C", color: "#9B0056", from: "Farringdon", to: "King's Cross St. Pancras", stations: ["farringdon","king's cross st. pancras"], alsoCheck: ["hammersmith-city"] },
    { line: "victoria", label: "Victoria", color: "#0098D4", from: "King's Cross St. Pancras", to: "Walthamstow Central", stations: ["king's cross st. pancras","highbury & islington","finsbury park","seven sisters","tottenham hale","blackhorse road","walthamstow central"] },
  ],
};

// Route 2 bus stops for connecting bus
const R2_BUS = {
  morning: { id: "490013643N", name: "Thorpe Hall Road", letter: "C", direction: "towards Highams Park", line: "275" },
  afternoon: { id: "490008137D", name: "Highams Park Station", letter: "D", direction: "towards Walthamstow", line: "275" },
};

// Route 2 train stops for Weaver departures
const R2_TRAIN = {
  morning: { id: "910GHGHMSPK", name: "Highams Park", direction: "to Liverpool Street" },
  afternoon: { id: "910GLIVST", name: "Liverpool Street", direction: "to Highams Park" },
};

const ALT_LEGS = {
  morning: [
    { line: "london-overground", label: "Weaver (Overground)", color: "#6D3B24", from: "Highams Park", to: "Liverpool Street", stations: ["highams park","wood street","walthamstow central","st james street","clapton","hackney downs","london fields","cambridge heath","bethnal green","liverpool street"] },
    { line: "metropolitan", label: "Metropolitan / H&C", color: "#9B0056", from: "Liverpool Street", to: "Farringdon", stations: ["liverpool street","moorgate","barbican","farringdon"], alsoCheck: ["hammersmith-city"] },
  ],
  afternoon: [
    { line: "metropolitan", label: "Metropolitan / H&C", color: "#9B0056", from: "Farringdon", to: "Liverpool Street", stations: ["farringdon","barbican","moorgate","liverpool street"], alsoCheck: ["hammersmith-city"] },
    { line: "london-overground", label: "Weaver (Overground)", color: "#6D3B24", from: "Liverpool Street", to: "Highams Park", stations: ["liverpool street","bethnal green","cambridge heath","london fields","hackney downs","clapton","st james street","walthamstow central","wood street","highams park"] },
  ],
};

const BUS_STOPS = {
  morning: { id: "490013643S", name: "Thorpe Hall Road", letter: "D", direction: "towards Walthamstow Central" },
  afternoon: { id: "490014164C", name: "Walthamstow Bus Station", letter: "C", direction: "towards Barkingside" },
};

function isCommuteTime() {
  const uk = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/London" }));
  const mins = uk.getHours() * 60 + uk.getMinutes();
  return mins < 540 || mins >= 930;
}

let sandboxChecked = false, isSandboxed = false;
async function checkSandbox() {
  if (sandboxChecked) return isSandboxed;
  try { const r = await fetch("https://api.tfl.gov.uk/Line/victoria/Status", { signal: AbortSignal.timeout(5000) }); isSandboxed = !r.ok; } catch { isSandboxed = true; }
  sandboxChecked = true; return isSandboxed;
}

const getSev = (sev) => {
  if (sev <= 5) return { bg: "#ef444422", color: "#ef4444", border: "#ef444433", icon: "🚫", label: "Suspended" };
  if (sev <= 9) return { bg: "#f59e0b22", color: "#f59e0b", border: "#f59e0b33", icon: "⚠️", label: "Disrupted" };
  return { bg: "#10b98122", color: "#10b981", border: "#10b98133", icon: "✓", label: "Good Service" };
};

const FALLBACK = { victoria: { severity: 10 }, metropolitan: { severity: 10 }, "hammersmith-city": { severity: 10 }, "london-overground": { severity: 10 } };

/* ── MINI ARRIVALS (bus or train, inline) ── */
function MiniArrivals({ stopId, lineFilter, mode: tMode, label, icon, sandboxed, maxResults = 3 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (sandboxed) { setLoading(false); return; }
    try {
      const url = tMode === "bus"
        ? `https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals?mode=bus`
        : `https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`;
      const r = await fetch(url);
      if (!r.ok) throw new Error();
      let data = await r.json();
      if (lineFilter) data = data.filter(a => a.lineName === lineFilter || a.lineId === lineFilter || a.lineName?.toLowerCase().includes("weaver") || a.lineId === "london-overground");
      if (tMode === "bus") data = data.filter(a => a.lineName === lineFilter);
      const sorted = data.sort((a, b) => a.timeToStation - b.timeToStation).slice(0, maxResults).map(a => ({
        mins: Math.round(a.timeToStation / 60),
        dest: a.towards || a.destinationName || "",
        expected: new Date(a.expectedArrival),
      }));
      setItems(sorted);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [stopId, lineFilter, tMode, sandboxed, maxResults]);

  useEffect(() => { fetchData(); const iv = setInterval(() => { if (isCommuteTime()) fetchData(); }, 30000); return () => clearInterval(iv); }, [fetchData]);

  if (sandboxed) {
    const tflUrl = tMode === "bus" ? `https://tfl.gov.uk/bus/stop/${stopId}?lineId=275` : `https://tfl.gov.uk/overground/stop/${stopId}`;
    return (
      <div style={{ background: "#0f172a", borderRadius: 8, padding: "12px 14px", marginTop: 8, border: "1px solid #334155" }}>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", fontWeight: 600 }}>{icon} {label}</p>
        <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 8px" }}>🔒 Live data unavailable in sandbox — works when self-hosted</p>
        <a href={tflUrl} target="_blank" style={{ display: "inline-block", padding: "7px 14px", background: ACCENT, color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Open TfL Live Times ↗</a>
      </div>
    );
  }

  return (
    <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", marginTop: 8, border: "1px solid #334155" }}>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px", fontWeight: 600 }}>{icon} {label}</p>
      {loading ? <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Loading...</p>
        : items.length === 0 ? <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>No departures found</p>
        : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {items.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: i === 0 ? `${ACCENT}15` : "#1a2332", padding: "5px 10px", borderRadius: 6, border: `1px solid ${i === 0 ? ACCENT + "33" : "#334155"}` }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: i === 0 ? ACCENT : "#e2e8f0" }}>{a.mins < 1 ? "Due" : `${a.mins}m`}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{a.expected.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ── COMMUTE WIDGET (Route 1) ── */
function CommuteWidget({ time, title, subtitle, legs: LC }) {
  const [statuses, setStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [manualMode, setManualMode] = useState(null);
  const [sandboxed, setSandboxed] = useState(false);
  const [paused, setPaused] = useState(!isCommuteTime());

  const mode = manualMode || (time.getHours() < 14 ? "morning" : "afternoon");
  const legs = LC[mode];

  const fetchStatus = useCallback(async () => {
    setLoading(true); setErr(null);
    const sb = await checkSandbox(); setSandboxed(sb);
    if (sb) { setLoading(false); return; }
    try {
      const ids = [...new Set(legs.flatMap(l => [l.line, ...(l.alsoCheck || [])]))].join(",");
      const r = await fetch(`https://api.tfl.gov.uk/Line/${ids}/Status?detail=true`);
      if (!r.ok) throw new Error(`${r.status}`);
      const data = await r.json(); const m = {}; data.forEach(l => { m[l.id] = l; }); setStatuses(m); setLastFetch(new Date());
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  }, [legs]);

  useEffect(() => { fetchStatus(); const iv = setInterval(() => { const a = isCommuteTime(); setPaused(!a); if (a) fetchStatus(); }, 60000); return () => clearInterval(iv); }, [fetchStatus]);

  const getIssues = (leg) => {
    if (!statuses) return [];
    const lines = [leg.line, ...(leg.alsoCheck || [])]; const issues = [];
    lines.forEach(id => { const ld = statuses[id]; if (!ld) return; ld.lineStatuses?.forEach(ls => { if (ls.statusSeverity === 10) return; const reason = ls.reason || ls.disruption?.description || ""; const rl = reason.toLowerCase(); const whole = !reason || !rl.includes("between"); let affects = whole; if (!affects) affects = leg.stations.some(s => rl.includes(s)); if (!affects && ls.disruption?.affectedStops?.length) { const aff = ls.disruption.affectedStops.map(s => s.commonName?.toLowerCase() || ""); affects = leg.stations.some(s => aff.some(a => a.includes(s))); } if (affects) issues.push({ lineName: ld.name, severity: ls.statusSeverity, desc: ls.statusSeverityDescription, reason: reason.replace(/ : /g, ": ").trim() }); }); });
    return issues;
  };

  const renderLeg = (leg, i) => {
    let issues, worst;
    if (sandboxed) { const sevs = [leg.line, ...(leg.alsoCheck || [])].map(l => FALLBACK[l]?.severity ?? 10); worst = Math.min(...sevs); issues = worst < 10 ? [{ desc: "Disruption", severity: worst }] : []; }
    else { issues = getIssues(leg); worst = issues.length ? Math.min(...issues.map(x => x.severity)) : 10; }
    const sty = getSev(worst);
    return (
      <div key={i} style={{ background: "#0f172a", borderRadius: 10, border: `1px solid ${issues.length ? sty.border : "#334155"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
          <div style={{ width: 6, height: 50, borderRadius: 3, background: leg.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Leg {i+1}: {leg.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}>{sty.icon} {sty.label}</span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{leg.from} → {leg.to}</p>
            {issues.length > 0 ? issues.map((iss, j) => (
              <div key={j} style={{ marginTop: 8, padding: "8px 10px", background: sty.bg, borderRadius: 6, border: `1px solid ${sty.border}` }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: sty.color, margin: 0 }}>{iss.lineName ? `${iss.lineName}: ` : ""}{iss.desc}</p>
                {iss.reason && <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", lineHeight: 1.5 }}>{iss.reason}</p>}
              </div>
            )) : <p style={{ fontSize: 12, color: "#10b981", margin: "6px 0 0" }}>No disruptions affecting this leg</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: "1px solid #334155", gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div><h2 style={{ fontSize: 16, fontWeight: 600, color: ACCENT, margin: 0 }}>{title}</h2><p style={{ fontSize: 12, color: SUB, margin: "4px 0 0" }}>{mode === "morning" ? subtitle.morning : subtitle.afternoon}</p></div>
        <div style={{ display: "flex", gap: 4 }}>
          {["morning", "afternoon"].map(m => (<button key={m} onClick={() => setManualMode(m === mode && manualMode ? null : m)} style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: "1px solid", background: mode === m ? `${ACCENT}22` : "#0f172a", color: mode === m ? ACCENT : "#64748b", borderColor: mode === m ? `${ACCENT}44` : "#334155" }}>{m === "morning" ? "☀️ AM" : "🌙 PM"}</button>))}
          <button onClick={fetchStatus} style={{ padding: "5px 10px", background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}33`, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>↻</button>
        </div>
      </div>
      {loading && !statuses && !sandboxed ? <p style={{ textAlign: "center", color: "#94a3b8", padding: 16 }}>🔄 Checking TfL status...</p>
        : err && !sandboxed ? <p style={{ textAlign: "center", color: "#f59e0b", padding: 16 }}>⚠️ {err}</p>
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{legs.map((l, i) => renderLeg(l, i))}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>{sandboxed ? "Sandbox mode" : lastFetch ? `Updated: ${lastFetch.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}${paused ? " · Paused" : " · 60s"}` : ""}</p>
        <a href="https://tfl.gov.uk/tube-dlr-overground/status/" target="_blank" style={{ fontSize: 11, color: ACCENT, textDecoration: "none" }}>Full TfL status →</a>
      </div>
    </div>
  );
}

/* ── ROUTE 2 WIDGET (with embedded bus + train arrivals) ── */
function Route2Widget({ time }) {
  const [statuses, setStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [manualMode, setManualMode] = useState(null);
  const [sandboxed, setSandboxed] = useState(false);
  const [paused, setPaused] = useState(!isCommuteTime());

  const mode = manualMode || (time.getHours() < 14 ? "morning" : "afternoon");
  const legs = ALT_LEGS[mode];
  const bus = R2_BUS[mode];
  const train = R2_TRAIN[mode];

  const fetchStatus = useCallback(async () => {
    setLoading(true); setErr(null);
    const sb = await checkSandbox(); setSandboxed(sb);
    if (sb) { setLoading(false); return; }
    try {
      const ids = [...new Set(legs.flatMap(l => [l.line, ...(l.alsoCheck || [])]))].join(",");
      const r = await fetch(`https://api.tfl.gov.uk/Line/${ids}/Status?detail=true`);
      if (!r.ok) throw new Error(`${r.status}`);
      const data = await r.json(); const m = {}; data.forEach(l => { m[l.id] = l; }); setStatuses(m); setLastFetch(new Date());
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  }, [legs]);

  useEffect(() => { fetchStatus(); const iv = setInterval(() => { const a = isCommuteTime(); setPaused(!a); if (a) fetchStatus(); }, 60000); return () => clearInterval(iv); }, [fetchStatus]);

  const getIssues = (leg) => {
    if (!statuses) return [];
    const lines = [leg.line, ...(leg.alsoCheck || [])]; const issues = [];
    lines.forEach(id => { const ld = statuses[id]; if (!ld) return; ld.lineStatuses?.forEach(ls => { if (ls.statusSeverity === 10) return; const reason = ls.reason || ls.disruption?.description || ""; const rl = reason.toLowerCase(); const whole = !reason || !rl.includes("between"); let affects = whole; if (!affects) affects = leg.stations.some(s => rl.includes(s)); if (!affects && ls.disruption?.affectedStops?.length) { const aff = ls.disruption.affectedStops.map(s => s.commonName?.toLowerCase() || ""); affects = leg.stations.some(s => aff.some(a => a.includes(s))); } if (affects) issues.push({ lineName: ld.name, severity: ls.statusSeverity, desc: ls.statusSeverityDescription, reason: reason.replace(/ : /g, ": ").trim() }); }); });
    return issues;
  };

  const renderLeg = (leg, i) => {
    let issues, worst;
    if (sandboxed) { const sevs = [leg.line, ...(leg.alsoCheck || [])].map(l => FALLBACK[l]?.severity ?? 10); worst = Math.min(...sevs); issues = worst < 10 ? [{ desc: "Disruption", severity: worst }] : []; }
    else { issues = getIssues(leg); worst = issues.length ? Math.min(...issues.map(x => x.severity)) : 10; }
    const sty = getSev(worst);
    const isOverground = leg.line === "london-overground";
    return (
      <div key={i} style={{ background: "#0f172a", borderRadius: 10, border: `1px solid ${issues.length ? sty.border : "#334155"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
          <div style={{ width: 6, minHeight: 50, borderRadius: 3, background: leg.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Leg {i + 1}: {leg.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}>{sty.icon} {sty.label}</span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{leg.from} → {leg.to}</p>
            {issues.length > 0 ? issues.map((iss, j) => (
              <div key={j} style={{ marginTop: 8, padding: "8px 10px", background: sty.bg, borderRadius: 6, border: `1px solid ${sty.border}` }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: sty.color, margin: 0 }}>{iss.lineName ? `${iss.lineName}: ` : ""}{iss.desc}</p>
                {iss.reason && <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", lineHeight: 1.5 }}>{iss.reason}</p>}
              </div>
            )) : <p style={{ fontSize: 12, color: "#10b981", margin: "6px 0 0" }}>No disruptions affecting this leg</p>}
            {/* Inline train departures for the Overground leg */}
            {isOverground && (
              <MiniArrivals stopId={train.id} lineFilter="london-overground" mode="train" label={`Next trains from ${train.name} ${train.direction}`} icon="🚆" sandboxed={sandboxed} maxResults={2} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const mSub = "🚌 Bus → 🚆 Highams Park → Liverpool St → 🚇 Farringdon";
  const aSub = "🚇 Farringdon → Liverpool St → 🚆 Highams Park → 🚌 Bus";

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: "1px solid #334155", gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div><h2 style={{ fontSize: 16, fontWeight: 600, color: ACCENT, margin: 0 }}>🚆 Route 2 — Overground + Tube Commute</h2><p style={{ fontSize: 12, color: SUB, margin: "4px 0 0" }}>{mode === "morning" ? mSub : aSub}</p></div>
        <div style={{ display: "flex", gap: 4 }}>
          {["morning", "afternoon"].map(m => (<button key={m} onClick={() => setManualMode(m === mode && manualMode ? null : m)} style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: "1px solid", background: mode === m ? `${ACCENT}22` : "#0f172a", color: mode === m ? ACCENT : "#64748b", borderColor: mode === m ? `${ACCENT}44` : "#334155" }}>{m === "morning" ? "☀️ AM" : "🌙 PM"}</button>))}
          <button onClick={fetchStatus} style={{ padding: "5px 10px", background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}33`, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>↻</button>
        </div>
      </div>

      {/* Bus to/from station */}
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 6, height: 50, borderRadius: 3, background: "#CE1126", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{mode === "morning" ? "🚌 Bus to Highams Park" : "🚌 Bus home"}</span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>275 from Stop {bus.letter} — {bus.name} ({bus.direction})</p>
            <MiniArrivals stopId={bus.id} lineFilter="275" mode="bus" label="Next 275 buses" icon="🚌" sandboxed={sandboxed} maxResults={3} />
          </div>
        </div>
      </div>

      {loading && !statuses && !sandboxed ? <p style={{ textAlign: "center", color: "#94a3b8", padding: 16 }}>🔄 Checking TfL status...</p>
        : err && !sandboxed ? <p style={{ textAlign: "center", color: "#f59e0b", padding: 16 }}>⚠️ {err}</p>
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{legs.map((l, i) => renderLeg(l, i))}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>{sandboxed ? "Sandbox mode" : lastFetch ? `Updated: ${lastFetch.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}${paused ? " · Paused" : " · 60s"}` : ""}</p>
        <a href="https://tfl.gov.uk/tube-dlr-overground/status/" target="_blank" style={{ fontSize: 11, color: ACCENT, textDecoration: "none" }}>Full TfL status →</a>
      </div>
    </div>
  );
}

/* ── BUS TRACKER (275 main) ── */
function BusTracker({ time }) {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const [manualMode, setManualMode] = useState(null);
  const [sandboxed, setSandboxed] = useState(false);
  const [paused, setPaused] = useState(!isCommuteTime());

  const mode = manualMode || (time.getHours() < 14 ? "morning" : "afternoon");
  const stop = BUS_STOPS[mode];

  const fetchArrivals = useCallback(async () => {
    setLoading(true);
    const sb = await checkSandbox(); setSandboxed(sb);
    if (sb) { setLoading(false); return; }
    try {
      const r = await fetch(`https://api.tfl.gov.uk/StopPoint/${stop.id}/Arrivals?mode=bus&line=275`);
      if (!r.ok) throw new Error(); const data = await r.json();
      setArrivals(data.filter(a => a.lineName === "275").sort((a, b) => a.timeToStation - b.timeToStation).slice(0, 4).map(a => ({ id: a.id, mins: Math.round(a.timeToStation / 60), towards: a.towards || a.destinationName, expected: new Date(a.expectedArrival) })));
      setLastFetch(new Date());
    } catch { setSandboxed(true); } finally { setLoading(false); }
  }, [stop.id]);

  useEffect(() => { fetchArrivals(); const iv = setInterval(() => { const a = isCommuteTime(); setPaused(!a); if (a) fetchArrivals(); }, 30000); return () => clearInterval(iv); }, [fetchArrivals]);

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: "1px solid #334155", gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div><h2 style={{ fontSize: 16, fontWeight: 600, color: ACCENT, margin: 0 }}>🚌 275 Bus — Live Arrivals</h2><p style={{ fontSize: 12, color: SUB, margin: "4px 0 0" }}>Auto-switches: morning (before 2pm) / afternoon</p></div>
        <div style={{ display: "flex", gap: 4 }}>
          {["morning", "afternoon"].map(m => (<button key={m} onClick={() => setManualMode(m === mode && manualMode ? null : m)} style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: "1px solid", background: mode === m ? `${ACCENT}22` : "#0f172a", color: mode === m ? ACCENT : "#64748b", borderColor: mode === m ? `${ACCENT}44` : "#334155" }}>{m === "morning" ? "☀️ AM" : "🌙 PM"}</button>))}
        </div>
      </div>
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12, border: "1px solid #334155" }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#CE1126", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>275</span></div>
        <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>Stop {stop.letter} — {stop.name}</p><p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{stop.direction}</p></div>
        {sandboxed ? <a href={`https://tfl.gov.uk/bus/stop/${stop.id}?lineId=275`} target="_blank" style={{ padding: "6px 10px", background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}33`, borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none" }}>View live ↗</a>
          : <button onClick={fetchArrivals} style={{ padding: "6px 10px", background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}33`, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>↻ Refresh</button>}
      </div>
      {sandboxed ? (
        <div style={{ background: "#0f172a", borderRadius: 10, padding: 20, border: "1px solid #334155", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 6px" }}>🔒 Live data unavailable in sandbox</p>
          <a href={`https://tfl.gov.uk/bus/stop/${stop.id}?lineId=275`} target="_blank" style={{ display: "inline-block", padding: "10px 20px", background: ACCENT, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Open TfL Live ↗</a>
        </div>
      ) : loading && arrivals.length === 0 ? <p style={{ textAlign: "center", color: "#94a3b8", padding: 16 }}>🔄 Loading...</p>
        : arrivals.length === 0 ? <p style={{ textAlign: "center", color: "#94a3b8", padding: 16 }}>No buses right now.</p>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {arrivals.map((a, i) => (
              <div key={a.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: i === 0 ? `${ACCENT}11` : "#0f172a", borderRadius: 8, border: `1px solid ${i === 0 ? ACCENT + "33" : "#334155"}` }}>
                <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: i === 0 ? 22 : 18, fontWeight: 800, color: i === 0 ? ACCENT : "#e2e8f0" }}>{a.mins < 1 ? "Due" : a.mins}</span>
                  {a.mins >= 1 && <p style={{ fontSize: 10, color: "#64748b", margin: 0 }}>min{a.mins !== 1 ? "s" : ""}</p>}
                </div>
                <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{a.towards}</p><p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>Expected: {a.expected.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
                {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, background: `${ACCENT}22`, padding: "2px 8px", borderRadius: 4, border: `1px solid ${ACCENT}33` }}>NEXT</span>}
              </div>
            ))}
          </div>
        )}
      {lastFetch && !sandboxed && <p style={{ fontSize: 11, color: "#475569", marginTop: 10 }}>Updated: {lastFetch.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}{paused ? " · Paused" : " · 30s"}</p>}
    </div>
  );
}

/* ── MAIN DASHBOARD ── */
export default function Dashboard() {
  const [name, setName] = useState("Helen");
  const [editing, setEditing] = useState(false);
  const [todos, setTodos] = useState([{ text: "Complete Anthropic 1-3 courses", done: true }, { text: "Complete Anthropic 4-6", done: false }, { text: "Learn about MCP", done: false }, { text: "Review Claude Agentic capabilities", done: false }]);
  const [newTodo, setNewTodo] = useState("");
  const [quote, setQuote] = useState(quotes[0]);
  const [time, setTime] = useState(new Date());
  const [clicks, setClicks] = useState(0);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const toggle = (i) => { const c = [...todos]; c[i].done = !c[i].done; setTodos(c); };
  const addTodo = () => { if (newTodo.trim()) { setTodos([...todos, { text: newTodo.trim(), done: false }]); setNewTodo(""); } };
  const removeTodo = (i) => setTodos(todos.filter((_, idx) => idx !== i));
  const done = todos.filter(t => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;
  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#f1f5f9", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: 14, color: ACCENT, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>My Travel Dashboard</p>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "8px 0" }}>
          {greeting},{" "}
          {editing ? <input autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={e => e.key === "Enter" && setEditing(false)} style={{ background: "transparent", border: "none", borderBottom: `2px solid ${ACCENT}`, color: "#f1f5f9", fontSize: 32, fontWeight: 700, width: 160, outline: "none", textAlign: "center" }} />
            : <span onClick={() => setEditing(true)} style={{ cursor: "pointer", borderBottom: `2px dashed ${ACCENT}55` }}>{name}</span>}! 👋
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>{time.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — {time.toLocaleTimeString()}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
        {/* Weather */}
        <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: "1px solid #334155", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: ACCENT }}>🌤️ London Weather</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 56 }}>☁️</div>
            <div><p style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>8°C</p><p style={{ fontSize: 14, color: SUB, margin: 0 }}>Cloudy — 45% chance of rain today</p></div>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {[{day:"Mon",icon:"☁️",hi:8,rain:45},{day:"Tue",icon:"🌥️",hi:7,rain:10},{day:"Wed",icon:"🌧️",hi:5,rain:20},{day:"Thu",icon:"🌥️",hi:6,rain:35},{day:"Fri",icon:"⛅",hi:10,rain:35}].map(d => (
              <div key={d.day} style={{ flex: 1, minWidth: 80, textAlign: "center", padding: "12px 8px", background: "#0f172a", borderRadius: 10, border: "1px solid #334155" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: "0 0 6px" }}>{d.day}</p><p style={{ fontSize: 24, margin: "4px 0" }}>{d.icon}</p><p style={{ fontSize: 16, fontWeight: 700, margin: "4px 0", color: "#e2e8f0" }}>{d.hi}°C</p><p style={{ fontSize: 11, color: ACCENT, margin: 0 }}>💧 {d.rain}%</p>
              </div>
            ))}
          </div>
        </div>

        <CommuteWidget time={time} title="🚇 Route 1 — Victoria Line Commute" subtitle={{ morning: "Walthamstow Central → King's Cross → Farringdon", afternoon: "Farringdon → King's Cross → Walthamstow Central" }} legs={COMMUTE_LEGS} />
        <BusTracker time={time} />
        <Route2Widget time={time} />

        {/* Progress */}
        <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: ACCENT }}>📊 Learning Progress</h2>
          <div style={{ background: "#0f172a", borderRadius: 99, height: 20, overflow: "hidden", marginBottom: 8 }}><div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}aa)`, borderRadius: 99, transition: "width 0.5s ease" }} /></div>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>{done} of {todos.length} tasks done ({pct}%)</p>
        </div>
        {/* Quote */}
        <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: "1px solid #334155", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div><h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: ACCENT }}>💡 Daily Inspiration</h2><p style={{ fontSize: 15, lineHeight: 1.6, fontStyle: "italic", color: "#cbd5e1" }}>"{quote}"</p></div>
          <button onClick={() => setQuote(quotes[Math.floor(Math.random() * quotes.length)])} style={{ marginTop: 16, padding: "8px 16px", background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>New Quote ✨</button>
        </div>

        {/* Todo */}
        <div style={{ background: CARD_BG, borderRadius: 16, padding: 24, border: "1px solid #334155", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: ACCENT }}>✅ My Learning Checklist</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} placeholder="Add a new goal..." style={{ flex: 1, padding: "10px 14px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 14, outline: "none" }} />
            <button onClick={addTodo} style={{ padding: "10px 18px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Add</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {todos.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: t.done ? `${ACCENT}11` : "#0f172a", borderRadius: 8, border: `1px solid ${t.done ? ACCENT + "33" : "#334155"}` }}>
                <div onClick={() => toggle(i)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.done ? ACCENT : "#475569"}`, background: t.done ? ACCENT : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{t.done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}</div>
                <span style={{ flex: 1, fontSize: 14, color: t.done ? "#94a3b8" : "#e2e8f0", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                <span onClick={() => removeTodo(i)} style={{ cursor: "pointer", color: "#475569", fontSize: 16, padding: "0 4px" }}>×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 32 }}>Built with React — Helen Stratford</p>
    </div>
  );
}
