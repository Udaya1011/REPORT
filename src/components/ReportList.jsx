import React from 'react';
import { Calendar as CalendarIcon, Layers, FileText, ChevronRight, Hash, Trash2, Search, Printer } from 'lucide-react';

const ReportList = ({ 
  reports, 
  searchTerm, 
  setSearchTerm, 
  filterDate, 
  setFilterDate, 
  onSelectReport, 
  onDeleteReport, 
  onAddNew,
  onPrintAll
}) => {
  const [isSelectMode, setIsSelectMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePrintSelected = () => {
    const selectedReports = reports.filter(r => selectedIds.includes(r.id));
    onPrintAll(selectedReports);
  };

  const groupedReports = reports.reduce((acc, report) => {
    const date = report.date || 'Unknown Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(report);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedReports).sort((a, b) => {
    if (a === 'Unknown Date') return 1;
    if (b === 'Unknown Date') return -1;
    return new Date(b) - new Date(a);
  });

  const formatDisplayDate = (dateString) => {
    if (dateString === 'Unknown Date') return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Check if it's today
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (dateString === todayStr) {
       return `Today - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="report-list-view">
      <div className="header-actions">
        <div>
          <h1>QC Inspection Dashboard</h1>
          <p style={{color: 'var(--text-muted)'}}>Manage and track your garment quality reports</p>
        </div>
        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
          {reports.length > 0 && (
            <>
              <button 
                className={`btn ${isSelectMode ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  setSelectedIds([]);
                }}
              >
                {isSelectMode ? 'Cancel Selection' : 'Select Reports'}
              </button>
              
              {isSelectMode ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handlePrintSelected}
                  disabled={selectedIds.length === 0}
                  style={{background: 'var(--success)', borderColor: 'var(--success)'}}
                >
                  <Printer size={18} /> Download Selected ({selectedIds.length})
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => onPrintAll()} style={{borderColor: 'var(--accent)', color: 'var(--accent)'}}>
                  <Printer size={18} /> Download All (PDF)
                </button>
              )}
            </>
          )}
          <button className="btn btn-primary" onClick={onAddNew}>
            + Add New Report
          </button>
        </div>
      </div>

      <div className="filter-bar" style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center'}}>
        
        {/* Date Quick Toggles */}
        <div style={{display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden'}}>
           <button 
             onClick={() => {
               const today = new Date();
               const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
               setFilterDate(todayStr);
             }}
             style={{
               padding: '0.6rem 1.2rem', 
               border: 'none', 
               background: filterDate === (() => {
                 const t = new Date();
                 return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
               })() ? 'var(--accent)' : 'transparent',
               color: filterDate === (() => {
                 const t = new Date();
                 return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
               })() ? 'white' : 'var(--text-main)',
               fontWeight: filterDate === (() => {
                 const t = new Date();
                 return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
               })() ? 'bold' : 'normal',
               cursor: 'pointer',
               fontSize: '0.9rem'
             }}
           >Today</button>
           <button 
             onClick={() => setFilterDate('')}
             style={{
               padding: '0.6rem 1.2rem', 
               border: 'none', 
               borderLeft: '1px solid var(--border)',
               background: filterDate === '' ? 'var(--accent)' : 'transparent',
               color: filterDate === '' ? 'white' : 'var(--text-main)',
               fontWeight: filterDate === '' ? 'bold' : 'normal',
               cursor: 'pointer',
               fontSize: '0.9rem'
             }}
           >All Days</button>
        </div>

        <div className="search-container" style={{flex: 1, minWidth: '250px', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by Product, PO, or Brand..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', width: '100%'}}
          />
        </div>

        <div className="calendar-filter" style={{background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px'}}>
          <CalendarIcon size={18} color="var(--text-muted)" />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', color: 'var(--text-main)', width: '100%'}}
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate('')}
              style={{border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem'}}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="reports-container" style={{marginTop: '2rem'}}>
        {reports.length === 0 ? (
          <div style={{textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Layers size={48} color="var(--text-muted)" style={{marginBottom: '1rem', opacity: 0.5}} />
            <h3 style={{color: 'var(--text-muted)'}}>No reports found</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Start by adding your first quality inspection report.</p>
            <button className="btn btn-primary" onClick={onAddNew} style={{marginTop: '1.5rem'}}>
              + Create First Report
            </button>
          </div>
        ) : (
          sortedDates.map(dateKey => (
            <div key={dateKey} className="date-group" style={{marginBottom: '3rem'}}>
              <h2 style={{
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: 'var(--text-main)', 
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--border)',
                paddingBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CalendarIcon size={20} color="var(--accent)" />
                {formatDisplayDate(dateKey)}
              </h2>
              
              <div className="report-grid">
                {groupedReports[dateKey].map(report => (
                  <div 
                    key={report.id} 
                    className={`report-card ${selectedIds.includes(report.id) ? 'selected' : ''}`} 
                    onClick={() => isSelectMode ? toggleSelect(report.id) : onSelectReport(report)}
                    style={{position: 'relative'}}
                  >
                    {isSelectMode && (
                      <div className="select-checkbox" style={{
                        position: 'absolute', top: '10px', left: '10px', zIndex: 5,
                        width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--accent)',
                        background: selectedIds.includes(report.id) ? 'var(--accent)' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                      }}>
                        {selectedIds.includes(report.id) && <div style={{width: '10px', height: '10px', background: 'white', borderRadius: '50%'}} />}
                      </div>
                    )}
                    <div className="card-header" style={{paddingLeft: isSelectMode ? '2rem' : '0'}}>
                      <span className={`brand-badge badge-${report.brand?.toLowerCase()}`}>
                        {report.brand}
                      </span>
                      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                        <button 
                          className="delete-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('Delete this report?')) onDeleteReport(report.id);
                          }}
                          style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px'}}
                        >
                          <Trash2 size={18} />
                        </button>
                        <FileText size={18} color="var(--text-muted)" />
                      </div>
                    </div>
                    
                    <h3 className="card-title">{report.productCode}</h3>
                    <div className="card-meta">
                      <Hash size={14} /> {report.po}
                    </div>
                    <div className="card-meta" style={{marginTop: '0.25rem'}}>
                      <CalendarIcon size={14} /> {report.date}
                    </div>

                    <div className="card-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Qty</span>
                        <span className="stat-value">
                          {Object.values(report.quantities || {}).reduce((a, b) => a + (b || 0), 0)}
                        </span>
                      </div>
                      <div className="stat-item" style={{textAlign: 'right'}}>
                        <span className="stat-label">Status</span>
                        <span className="stat-value" style={{color: report.status === 'PASS' ? 'var(--success)' : 'var(--warning)'}}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600}}>
                      View Full Report <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportList;
