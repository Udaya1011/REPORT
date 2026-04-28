import React, { useState, useEffect } from 'react';
import ReportList from './components/ReportList';
import ReportForm from './components/ReportForm';
import ReportDetails from './components/ReportDetails';
import { Shield, Bell, User, Search } from 'lucide-react';

function App() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'details'

  const API_URL = 'http://localhost:5000/api/reports';

  // Load from MongoDB Atlas
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setReports(data);
        }
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
      });
  }, []);

  const handleAddReport = async (newReport) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });
      
      if (!response.ok) throw new Error('Failed to save report');
      
      const savedReport = await response.json();
      setReports(prev => [savedReport, ...prev]);
      setShowForm(false);
      setSelectedReport(savedReport);
      setView('details');
    } catch (err) {
      console.error('Error saving report:', err);
      // Fallback for UI
      setReports(prev => [newReport, ...prev]);
      setShowForm(false);
      setSelectedReport(newReport);
      setView('details');
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setView('details');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="brand-logo" onClick={() => setView('list')} style={{cursor: 'pointer'}}>
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          <span>TexTrack QC</span>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
          <div style={{display: 'flex', background: 'var(--background)', padding: '0.5rem 1rem', borderRadius: '20px', alignItems: 'center', gap: '0.5rem'}}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              style={{border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '200px'}}
            />
          </div>
          <Bell size={20} color="var(--text-muted)" cursor="pointer" />
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
            <div style={{width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
              <User size={18} style={{margin: 'auto'}} />
            </div>
            <span style={{fontWeight: 600, fontSize: '0.9rem'}}>Admin</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {view === 'list' ? (
          <ReportList 
            reports={reports} 
            onSelectReport={handleSelectReport} 
            onAddNew={() => setShowForm(true)} 
          />
        ) : (
          <ReportDetails 
            report={selectedReport} 
            onBack={() => setView('list')} 
          />
        )}
      </main>

      {showForm && (
        <ReportForm 
          onClose={() => setShowForm(false)} 
          onSubmit={handleAddReport} 
        />
      )}

      <footer className="no-print" style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem'}}>
        &copy; 2026 TexTrack Quality Control Systems. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
