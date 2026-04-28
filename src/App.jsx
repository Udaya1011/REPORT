import React, { useState, useEffect, useCallback } from 'react';
import ReportList from './components/ReportList';
import ReportForm from './components/ReportForm';
import ReportDetails from './components/ReportDetails';
import BulkReport from './components/BulkReport';
import { Shield, Bell, User, Search } from 'lucide-react';

function App() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'details'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [filterDate, setFilterDate] = useState(todayStr);
  const [bulkReports, setBulkReports] = useState([]);
  const [isAutoDownload, setIsAutoDownload] = useState(false);

  // Dynamically select API URL based on environment (Localhost vs Render)
  const API_URL = import.meta.env.PROD 
    ? 'https://report-backend-1-2iec.onrender.com/api/reports' 
    : 'http://localhost:5000/api/reports';

  // Load reports from MongoDB
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Frontend: Fetching reports from MongoDB');
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch from server');
      const data = await response.json();
      console.log('Frontend: Received data from MongoDB:', data);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Frontend: Error fetching reports:', err);
      setError('Error connecting to database. Please check if server is running.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAddReport = async (newReport) => {
    setLoading(true);
    try {
      console.log('Frontend: Sending new report to MongoDB:', newReport);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      
      if (!response.ok) throw new Error('Failed to save report');
      
      const savedReport = await response.json();
      console.log('Report saved to MongoDB:', savedReport);
      
      setReports(prev => [savedReport, ...prev]);
      setShowForm(false);
      setSelectedReport(savedReport);
      setView('details');
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Failed to save report to database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setView('details');
  };

  const handleDeleteReport = async (id) => {
    try {
      console.log('Frontend: Deleting report from MongoDB:', id);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete report');
      
      setReports(prev => prev.filter(report => report.id !== id));
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(null);
        setView('list');
      }
      console.log('Report deleted from MongoDB:', id);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report: ' + err.message);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.po?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || report.date === filterDate;
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="brand-logo" onClick={() => {setView('list'); setSearchTerm(''); setFilterDate('');}} style={{cursor: 'pointer'}}>
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          <span>TexTrack QC</span>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
          <Bell size={20} color="var(--text-muted)" cursor="pointer" />
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
            <div style={{width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
              <User size={18} style={{margin: 'auto'}} />
            </div>
            <span className="user-name" style={{fontWeight: 600, fontSize: '0.9rem'}}>Admin</span>
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
            reports={filteredReports} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onSelectReport={handleSelectReport} 
            onDeleteReport={handleDeleteReport}
            onAddNew={() => setShowForm(true)} 
            onPrintAll={(customReports) => {
              setBulkReports(customReports || filteredReports);
              setIsAutoDownload(true);
            }}
          />
        ) : (
          <ReportDetails 
            report={selectedReport} 
            onBack={() => setView('list')} 
          />
        )}

        {/* Hidden Bulk Report for background downloads */}
        {isAutoDownload && (
          <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '297mm' }}>
             <BulkReport 
                reports={bulkReports} 
                onBack={() => setIsAutoDownload(false)} 
                autoDownload={true}
                onDownloadComplete={() => setIsAutoDownload(false)}
             />
          </div>
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
