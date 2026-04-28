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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = '/api/reports';

  // Load from MongoDB Atlas - runs on mount and when needed
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Frontend: Fetching reports from', API_URL);
      const res = await fetch(API_URL);
      console.log('Frontend: Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Frontend: Received data:', data);
      setReports(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Frontend: Error fetching reports:', err);
      setError(err.message);
      setReports([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
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
      // Refresh the entire list to ensure data is consistent
      await fetchReports();
      setShowForm(false);
      setSelectedReport(savedReport);
      setView('details');
    } catch (err) {
      console.error('Error saving report:', err);
      setError(err.message);
      // Still try to refresh the list
      await fetchReports();
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setView('details');
  };

  const handleDeleteReport = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete report');
      
      // Refresh the list after deletion
      await fetchReports();
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(null);
        setView('list');
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err.message);
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
        {error && (
          <div style={{padding: '2rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', margin: '2rem', color: '#991b1b'}}>
            <strong>❌ Error:</strong> {error}
            <br />
            <small>Make sure the backend server is running: <code>npm run server</code></small>
          </div>
        )}
        
        {loading && view === 'list' && (
          <div style={{padding: '4rem', textAlign: 'center', color: 'var(--text-muted)'}}>
            <p>⏳ Loading reports...</p>
          </div>
        )}
        
        {!loading && view === 'list' ? (
          <ReportList 
            reports={reports} 
            onSelectReport={handleSelectReport} 
            onDeleteReport={handleDeleteReport}
            onAddNew={() => setShowForm(true)} 
          />
        ) : !loading && (
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
