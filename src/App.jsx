import React, { useState, useEffect, useCallback } from 'react';
import ReportList from './components/ReportList';
import ReportForm from './components/ReportForm';
import ReportDetails from './components/ReportDetails';
import BulkReport from './components/BulkReport';
import DCPage from './components/DCPage';
import { Shield, Bell, User, Search, Loader2, Download, FileText, Plus, MousePointer2, Printer, ArrowLeft } from 'lucide-react';

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
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Dynamically select API URL based on environment (Localhost vs Render)
  const API_URL = import.meta.env.PROD
    ? 'https://report-backend-1-2iec.onrender.com/api/reports'
    : `http://${window.location.hostname}:5000/api/reports`;

  const DC_API_URL = import.meta.env.PROD
    ? 'https://report-backend-1-2iec.onrender.com/api/dcs'
    : `http://${window.location.hostname}:5000/api/dcs`;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch from server');
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Error connecting to database.');
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

      const params = new URLSearchParams(window.location.search);
      const dcParam = params.get('dc');
      const viewParam = params.get('view');
      
      if (dcParam && loadedDCs.length > 0) {
        const matchedDC = loadedDCs.find(dc => dc._id === dcParam || dc.id === dcParam);
        if (matchedDC) {
          setSelectedDC(matchedDC);
          if (viewParam === 'pdf') {
            setIsPdfScanMode(true);
          } else {
            setView('dc');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching DCs:', err);
    }
  }, [DC_API_URL]);

  useEffect(() => {
    fetchReports();
    fetchDCs();
  }, [fetchReports, fetchDCs]);

  const handleAddReport = async (newReport) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      if (!response.ok) throw new Error('Failed to save report');
      const savedReport = await response.json();
      setReports(prev => [savedReport, ...prev]);
      setShowForm(false);
      setSelectedReport(savedReport);
      setView('details');
    } catch (err) {
      alert('Failed to save report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (customReports, isDelivery = false) => {
    setBulkReports(customReports || filteredReports);
    setIsDeliveryMode(isDelivery);
    setIsAutoDownload(true);
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setView('details');
  };

  const handleDeleteReport = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete report');
      setReports(prev => prev.filter(report => report.id !== id));
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(null);
        setView('list');
      }
    } catch (err) {
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
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error('Failed to update report');
      const savedReport = await response.json();
      setReports(prev => prev.map(r => r.id === id ? savedReport : r));
      if (selectedReport && selectedReport.id === id) setSelectedReport(savedReport);
      setShowForm(false);
      setEditingReport(null);
    } catch (err) {
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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Loader2 size={32} className="spin" /></div>
            </>
          ) : !selectedDC ? (
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>DC Not Found</h1>
          ) : (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Delivery Report</h1>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>DC NO: {selectedDC.name?.replace(/DC-/i, '')}<br/>Ready for download</p>
              <button className="btn btn-primary" onClick={() => setPdfDownloadTriggered(true)} disabled={pdfDownloadTriggered} style={{ width: '100%', padding: '1rem' }}>
                {pdfDownloadTriggered ? <><Loader2 size={20} className="spin" /> Generating...</> : <><Download size={20} /> Download PDF</>}
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
              isDCView={true}
              dcInfo={selectedDC}
              onDownloadComplete={() => setPdfDownloadTriggered(false)}
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
          <div className="logo-icon"><Shield size={20} /></div>
          <span>TexTrack QC</span>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            if (view === 'list') { setShowForm(true); setEditingReport(null); }
            else if (view === 'dc') { setIsCreatingDC(true); setView('list'); }
          }}
          style={{ padding: '0.4rem 0.6rem', minWidth: '40px', justifyContent: 'center', marginLeft: 'auto' }}
        >
          <Plus size={18} />
        </button>
      </nav>

      <main className="main-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
            <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--accent)', borderRadius: '50%' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><p style={{ color: '#dc2626' }}>{error}</p></div>
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
            onPrintAll={handlePrint}
            isCreatingDC={isCreatingDC}
            onSaveDC={handleSaveDC}
            usedReportIds={dcCollections.flatMap(dc => dc.reportIds || [])}
            isSelectMode={isSelectMode}
            setIsSelectMode={setIsSelectMode}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        ) : view === 'dc' ? (
          selectedDC ? (
            <div className="dc-page-view">
               <BulkReport 
                 reports={reports.filter(r => selectedDC.reportIds?.includes(r.id))} 
                 onBack={() => setSelectedDC(null)} 
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
              onAddNewDC={() => { setIsCreatingDC(true); setView('list'); }}
            />
          )
        ) : (
          <ReportDetails report={selectedReport} onBack={() => setView('list')} />
        ) }

        {isAutoDownload && (
          <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '297mm' }}>
            <BulkReport
              reports={bulkReports}
              onBack={() => { setIsAutoDownload(false); setDownloadDcInfo(null); }}
              autoDownload={true}
              summaryOnly={!!downloadDcInfo}
              isDCView={!!downloadDcInfo}
              dcInfo={downloadDcInfo}
              onDownloadComplete={() => { setIsAutoDownload(false); setDownloadDcInfo(null); }}
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

      <footer className="no-print" style={{ padding: '2rem 2rem 8rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        &copy; 2026 TexTrack Quality Control Systems. All rights reserved.
      </footer>

      <div className="mobile-bottom-nav">
        <div className={`nav-item ${view === 'list' ? 'active' : ''}`} onClick={() => { setView('list'); window.scrollTo(0, 0); }}>
          <FileText size={24} />
          <span>Report</span>
        </div>
        <div className={`nav-item ${view === 'dc' ? 'active' : ''}`} onClick={() => { setView('dc'); window.scrollTo(0, 0); }}>
          <Shield size={24} />
          <span>DC</span>
        </div>
      </div>
    </div>
  );
}

export default App;
