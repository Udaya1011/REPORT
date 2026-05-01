import React, { useState, useEffect, useCallback } from 'react';
import ReportList from './components/ReportList';
import ReportForm from './components/ReportForm';
import ReportDetails from './components/ReportDetails';
import BulkReport from './components/BulkReport';
import DCPage from './components/DCPage';
import { Shield, Bell, User, Search, Loader2, Download } from 'lucide-react';

function App() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'details', or 'dc'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [filterDate, setFilterDate] = useState(todayStr);
  const [bulkReports, setBulkReports] = useState([]);
  const [isAutoDownload, setIsAutoDownload] = useState(false);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedDC, setSelectedDC] = useState(null);
  const [downloadDcInfo, setDownloadDcInfo] = useState(null);
  const [dcCollections, setDcCollections] = useState([]);
  const [isCreatingDC, setIsCreatingDC] = useState(false);
  const [selectedForDC, setSelectedForDC] = useState([]);
  const [isPdfScanMode, setIsPdfScanMode] = useState(false);
  const [pdfDownloadTriggered, setPdfDownloadTriggered] = useState(false);

  // Dynamically select API URL based on environment (Localhost vs Render)
  // Use window.location.hostname to allow mobile devices on local network to reach the backend
  const API_URL = import.meta.env.PROD
    ? 'https://report-backend-1-2iec.onrender.com/api/reports'
    : `http://${window.location.hostname}:5000/api/reports`;

  const DC_API_URL = import.meta.env.PROD
    ? 'https://report-backend-1-2iec.onrender.com/api/dcs'
    : `http://${window.location.hostname}:5000/api/dcs`;

  // Load reports and DCs from MongoDB
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
  }, [API_URL]);

  const fetchDCs = useCallback(async () => {
    try {
      const response = await fetch(DC_API_URL);
      if (!response.ok) throw new Error('Failed to fetch DCs');
      const data = await response.json();
      const loadedDCs = Array.isArray(data) ? data : [];
      setDcCollections(loadedDCs);

      // Handle QR Code Scans: If URL has ?dc=ID, automatically open that DC
      const params = new URLSearchParams(window.location.search);
      const dcParam = params.get('dc');
      const viewParam = params.get('view');
      
      if (dcParam) {
        if (loadedDCs.length > 0) {
          const matchedDC = loadedDCs.find(dc => dc._id === dcParam || dc.id === dcParam);
          if (matchedDC) {
            setSelectedDC(matchedDC);
            if (viewParam === 'pdf') {
              setIsPdfScanMode(true);
            } else {
              setView('dc');
            }
          } else {
            console.warn(`DC with ID ${dcParam} not found in database.`);
            // If we are in PDF scan mode but DC not found, we should still show something
            if (viewParam === 'pdf') setIsPdfScanMode(true);
          }
        } else if (dcParam && viewParam === 'pdf') {
          // If we haven't loaded DCs yet or it failed, but we are in PDF mode
          setIsPdfScanMode(true);
        }
      }
    } catch (err) {
      console.error('Error fetching DCs:', err);
    }
  }, [DC_API_URL]);

  // Load on mount
  useEffect(() => {
    fetchReports();
    fetchDCs();
  }, [fetchReports, fetchDCs]);

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

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowForm(true);
  };

  const handleUpdateReport = async (id, updatedData) => {
    setLoading(true);
    try {
      console.log('Frontend: Updating report in MongoDB:', id, updatedData);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update report');

      const savedReport = await response.json();
      console.log('Report updated in MongoDB:', savedReport);

      setReports(prev => prev.map(r => r.id === id ? savedReport : r));
      if (selectedReport && selectedReport.id === id) setSelectedReport(savedReport);
      setShowForm(false);
      setEditingReport(null);
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDC = async (reportIds) => {
    setLoading(true);
    try {
      const newDC = {
        name: `DC-${dcCollections.length + 1}`,
        count: reportIds.length,
        date: todayStr,
        reportIds: reportIds
      };
      
      const response = await fetch(DC_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDC)
      });
      
      if (!response.ok) throw new Error('Failed to save DC');

      const savedDC = await response.json();
      setDcCollections(prev => [savedDC, ...prev]);
      setIsCreatingDC(false);
      setSelectedForDC([]);
      setView('dc');
    } catch (err) {
      console.error('Error saving DC:', err);
      alert('Failed to save DC batch');
    } finally {
      setLoading(false);
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

  if (isPdfScanMode) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', maxWidth: '400px', width: '100%' }}>
          <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', margin: '0 auto 1.5rem auto' }}>
            <Download size={32} />
          </div>
          
          {loading ? (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Loading Report...</h1>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please wait while we fetch the delivery data.</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <Loader2 size={32} className="spin" />
              </div>
            </>
          ) : !selectedDC ? (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626', marginBottom: '0.5rem' }}>DC Not Found</h1>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>The delivery report link you scanned is invalid or the data has been removed.</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Delivery Report</h1>
              <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.5' }}>
                DC NO: {selectedDC?.name?.replace(/DC-/i, '') || 'Unknown'}<br/>
                Date: {selectedDC?.date || 'N/A'}<br/>
                Ready for download
              </p>
              
              <button 
                className="btn btn-primary" 
                onClick={() => setPdfDownloadTriggered(true)}
                disabled={pdfDownloadTriggered}
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {pdfDownloadTriggered ? (
                  <><Loader2 size={20} className="spin" /> Generating PDF...</>
                ) : (
                  <><Download size={20} /> Download PDF</>
                )}
              </button>
            </>
          )}
          
        </div>

        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '297mm' }}>
          {pdfDownloadTriggered && (
            <BulkReport
              reports={reports.filter(r => selectedDC?.reportIds?.includes(r.id))}
              onBack={() => setIsPdfScanMode(false)}
              autoDownload={true}
              summaryOnly={false}
              isDCView={true}
              dcInfo={selectedDC}
              autoOpenBlob={false}
              onDownloadComplete={() => {
                setPdfDownloadTriggered(false);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="brand-logo" onClick={() => { setView('list'); setSearchTerm(''); setFilterDate(''); }} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          <span>TexTrack QC</span>
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: '2rem', marginLeft: '3rem', flex: 1 }}>
          <span 
            onClick={() => { setView('list'); }} 
            style={{ 
              cursor: 'pointer', 
              fontWeight: view === 'list' ? 'bold' : '500',
              color: view === 'list' ? 'var(--accent)' : 'var(--text-main)',
              fontSize: '0.95rem'
            }}
          >
            Dashboard
          </span>
          <span 
            onClick={() => { setView('dc'); }} 
            style={{ 
              cursor: 'pointer', 
              fontWeight: view === 'dc' ? 'bold' : '500',
              color: view === 'dc' ? 'var(--accent)' : 'var(--text-main)',
              fontSize: '0.95rem'
            }}
          >
            DC
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Bell size={20} color="var(--text-muted)" cursor="pointer" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <User size={18} style={{ margin: 'auto' }} />
            </div>
            <span className="user-name" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Admin</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '40px', height: '40px', border: '4px solid var(--border)',
              borderTop: '4px solid var(--accent)', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '12px', textAlign: 'center', maxWidth: '500px'
            }}>
              <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Connection Error</p>
              <p style={{ color: '#991b1b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
              <button
                className="btn btn-primary"
                onClick={fetchReports}
                style={{ margin: '0 auto' }}
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
            onEditReport={handleEditReport}
            onAddNew={() => { setEditingReport(null); setShowForm(true); }}
            onPrintAll={(customReports, isDelivery = false) => {
              setBulkReports(customReports || filteredReports);
              setIsDeliveryMode(isDelivery);
              setIsAutoDownload(true);
            }}
            isCreatingDC={isCreatingDC}
            onSaveDC={handleSaveDC}
            usedReportIds={dcCollections.flatMap(dc => dc.reportIds || [])}
          />
        ) : view === 'dc' ? (
          selectedDC ? (
            <div className="dc-page-view">
               <BulkReport 
                 reports={reports.filter(r => selectedDC.reportIds?.includes(r.id))} 
                 onBack={() => setSelectedDC(null)} 
                 autoDownload={false}
                 summaryOnly={false}
                 isDCView={true}
                 dcInfo={selectedDC}
               />
            </div>
          ) : (
            <DCPage 
              dcList={dcCollections}
              onSelectDC={(dc) => setSelectedDC(dc)}
              onDownloadDC={(dc) => {
                setBulkReports(reports.filter(r => dc.reportIds?.includes(r.id)));
                setDownloadDcInfo(dc);
                setIsAutoDownload(true);
              }}
              onAddNewDC={() => {
                setIsCreatingDC(true);
                setView('list');
              }}
            />
          )
        ) : (
          <ReportDetails
            report={selectedReport}
            onBack={() => setView('list')}
          />
        ) }

        {/* Hidden Bulk Report for background downloads */}
        {isAutoDownload && (
          <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '297mm' }}>
            <BulkReport
              reports={bulkReports}
              onBack={() => {
                setIsAutoDownload(false);
                setDownloadDcInfo(null);
              }}
              autoDownload={true}
              summaryOnly={!!downloadDcInfo}
              isDCView={!!downloadDcInfo}
              dcInfo={downloadDcInfo}
              onDownloadComplete={() => {
                setIsAutoDownload(false);
                setDownloadDcInfo(null);
              }}
            />
          </div>
        )}
      </main>

      {showForm && (
        <ReportForm
          report={editingReport}
          onClose={() => { setShowForm(false); setEditingReport(null); }}
          onSubmit={editingReport ? (data) => handleUpdateReport(editingReport.id, data) : handleAddReport}
        />
      )}

      <footer className="no-print" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        &copy; 2026 TexTrack Quality Control Systems. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
