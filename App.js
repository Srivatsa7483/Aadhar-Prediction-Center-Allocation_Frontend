import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ReferenceLine } from 'recharts';
import { ShieldCheck, Database, TrendingUp, AlertCircle, LayoutGrid, Flame, Settings2 } from 'lucide-react';

// --- ADD THIS LINE HERE ---
// Replace this URL with your actual Render backend URL after you deploy it
const API_BASE = "https://aadhar-prediction-center-allocation-ctuc.onrender.com"; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dataMap, setDataMap] = useState({});
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [topAnomalies, setTopAnomalies] = useState([]);
  const [selection, setSelection] = useState({ state: '', district: 'All' });
  const [stats, setStats] = useState({ total: 0, avg: 0, anomaly_count: 0, anomaly_list: [] });
  const [forecast, setForecast] = useState([]);
  const [centerCapacity, setCenterCapacity] = useState(500); 

  useEffect(() => {
    // UPDATED: Using API_BASE
    axios.get(`${API_BASE}/api/init-data`).then(res => {
      setStates(res.data.states || []);
      setDataMap(res.data.map || {});
    });

    // UPDATED: Using API_BASE
    axios.get(`${API_BASE}/api/top-anomalies`)
      .then(res => setTopAnomalies(res.data || []))
      .catch(err => console.error("Hotspots failed:", err));
  }, []);

  const dynamicForecast = useMemo(() => {
    return forecast.map(item => ({
      ...item,
      centers: Math.ceil(item.demand / centerCapacity)
    }));
  }, [forecast, centerCapacity]);

  const refreshData = (s, d) => {
    setSelection({ state: s, district: d });
    const encodedS = encodeURIComponent(s);
    const encodedD = encodeURIComponent(d);
    
    // UPDATED: Using API_BASE
    axios.get(`${API_BASE}/api/detailed-analysis?state=${encodedS}&district=${encodedD}`).then(res => setStats(res.data));
    
    if (d !== 'All') {
      // UPDATED: Using API_BASE
      axios.get(`${API_BASE}/api/forecast?state=${encodedS}&district=${encodedD}`).then(res => setForecast(res.data));
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
        <div style={{ background: 'white', padding: '50px', borderRadius: '30px', textAlign: 'center', width: '380px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <ShieldCheck size={70} color="#2563eb" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>UIDAI Strategic Command</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Aadhaar 2026 Prediction Portal</p>
          <button onClick={() => setIsLoggedIn(true)} style={{ width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}>ACCESS PORTAL</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      <aside style={{ width: '300px', backgroundColor: '#0f172a', color: 'white', padding: '35px', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <ShieldCheck color="#3b82f6" size={30} />
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>UIDAI 2026</h2>
        </div>

        <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #334155' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 5px' }}>MODEL RELIABILITY</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#10b981" />
            <span style={{ fontWeight: 'bold', color: '#10b981' }}>R²: 0.942</span>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>REGION FILTERS</p>
        <select onChange={(e) => { setDistricts(dataMap[e.target.value] || []); refreshData(e.target.value, 'All'); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', color: 'white', border: 'none', marginBottom: '15px' }}>
          <option>Select State</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select disabled={!selection.state} onChange={(e) => refreshData(selection.state, e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', color: 'white', border: 'none', marginBottom: '30px' }}>
          <option value="All">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>
           <Settings2 size={12} style={{ display: 'inline', marginRight: '5px' }} /> WHAT-IF CAPACITY
        </p>
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '30px' }}>
            <input 
                type="range" min="100" max="2000" step="50" 
                value={centerCapacity} 
                onChange={(e) => setCenterCapacity(e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }}
            />
            <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
                {centerCapacity} Enrolments / Center
            </p>
        </div>

        <p style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Flame size={14} /> ANOMALY HOTSPOTS
        </p>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '12px' }}>
          {topAnomalies.length > 0 ? topAnomalies.map((item, i) => (
            <div key={i} style={{ marginBottom: i === topAnomalies.length - 1 ? 0 : '12px', borderBottom: i === topAnomalies.length - 1 ? 'none' : '1px solid #334155', paddingBottom: '8px' }}>
              <p style={{ fontSize: '13px', margin: 0, fontWeight: 'bold' }}>{item.district}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                <span>Z-Score: {item.score}</span>
                <span style={{ color: '#ef4444' }}>{item.val}</span>
              </div>
            </div>
          )) : <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Scanning Data...</p>}
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#1e293b' }}>Strategic Analysis: {selection.district}, {selection.state}</h2>
          <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            System Live: 2026 Forecast Ready
          </div>
        </header>

        <div style={{ display: 'flex', gap: '25px', marginBottom: '35px' }}>
          <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Database color="#2563eb" size={24} />
            <p style={{ color: '#64748b', fontSize: '14px', margin: '10px 0 5px' }}>Total History</p>
            <h3 style={{ margin: 0 }}>{(stats.total || 0).toLocaleString()}</h3>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <LayoutGrid color="#10b981" size={24} />
            <p style={{ color: '#64748b', fontSize: '14px', margin: '10px 0 5px' }}>Optimal Centers</p>
            <h3 style={{ margin: 0 }}>{dynamicForecast.length > 0 ? dynamicForecast[0].centers : 0}</h3>
          </div>
          <div style={{ flex: 1, background: stats.anomaly_count > 0 ? '#fee2e2' : 'white', padding: '25px', borderRadius: '20px', transition: '0.3s' }}>
            <AlertCircle color="#ef4444" size={24} />
            <p style={{ color: '#64748b', fontSize: '14px', margin: '10px 0 5px' }}>Detected Spikes</p>
            <h3 style={{ margin: 0 }}>{stats.anomaly_count || 0}</h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#2563eb" /> 7-Day Demand Prediction
            </h4>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicForecast}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine y={1200} label="Spike Risk" stroke="#ef4444" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="demand" stroke="#2563eb" fill="#bfdbfe" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LayoutGrid size={18} color="#10b981" /> Center Allocation
            </h4>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicForecast}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="centers" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;