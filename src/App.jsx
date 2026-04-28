import React, { useState, useEffect, useCallback } from 'react';
import ReportList from './components/ReportList';
import ReportForm from './components/ReportForm';
import ReportDetails from './components/ReportDetails';
import { Shield, Bell, User, Search } from 'lucide-react';

function App() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'details'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load reports from localStorage
  const fetchReports = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      console.log('Frontend: Fetching reports from localStorage');
      const stored = localStorage.getItem('qc_reports');
      const data = stored ? JSON.parse(stored) : [];
      console.log('Frontend: Received data from localStorage:', data);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Frontend: Error fetching reports:', err);
      setError('Error loading data from localStorage');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAddReport = (newReport) => {
    try {
      // Generate unique ID
      const id = Date.now().toString();
      const reportWithId = { ...newReport, id };
      
      // Save to localStorage
      const updated = [reportWithId, ...reports];
      localStorage.setItem('qc_reports', JSON.stringify(updated));
      
      setReports(updated);
      setShowForm(false);
      setSelectedReport(reportWithId);
      setView('details');
      console.log('Report saved to localStorage:', reportWithId);
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Failed to save report to localStorage');
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setView('details');
  };

  const handleDeleteReport = (id) => {
    try {
      // Remove from state
      const updated = reports.filter(report => report.id !== id);
      
      // Save to localStorage
      localStorage.setItem('qc_reports', JSON.stringify(updated));
      
      setReports(updated);
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(null);
        setView('list');
      }
      console.log('Report deleted from localStorage:', id);
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report from localStorage');
    }
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
        {loading ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem'}}>
            <div style={{
              width: '40px', height: '40px', border: '4px solid var(--border)',
              borderTop: '4px solid var(--accent)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{color: 'var(--text-muted)'}}>Loading reports...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem'}}>
            <div style={{
              padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '12px', textAlign: 'center', maxWidth: '500px'
            }}>
              <p style={{color: '#dc2626', fontWeight: 600, marginBottom: '0.5rem'}}>⚠️ Connection Error</p>
              <p style={{color: '#991b1b', fontSize: '0.9rem', marginBottom: '1rem'}}>{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={fetchReports}
                style={{margin: '0 auto'}}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        ) : view === 'list' ? (
          <ReportList 
            reports={reports} 
            onSelectReport={handleSelectReport} 
            onDeleteReport={handleDeleteReport}
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
