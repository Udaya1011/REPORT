import React from 'react';
import { Calendar as CalendarIcon, Layers, FileText, ChevronRight, Hash, Trash2, Search, Printer, Edit2 } from 'lucide-react';

const ReportList = ({ 
  reports, 
  searchTerm, 
  setSearchTerm, 
  filterDate, 
  setFilterDate, 
  onSelectReport, 
  onDeleteReport, 
  onEditReport,
  onAddNew,
  onPrintAll,
  isCreatingDC = false,
  onSaveDC,
  usedReportIds = [],
  isSelectMode,
  setIsSelectMode,
  selectedIds,
  setSelectedIds
}) => {

  const toggleSelect = (id) => {
    if (usedReportIds.includes(id)) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };


  const handleSelectAllForDate = (dateKey) => {
    const dateReports = groupedReports[dateKey].map(r => r.id).filter(id => !usedReportIds.includes(id));
    const allSelected = dateReports.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !dateReports.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...dateReports])]);
    }
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
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (dateString === todayStr) {
       return `Today - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="report-list-view">
      <div className="search-container" style={{background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search by Product, PO, or Brand..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', width: '100%'}} />
      </div>

      <div className="filter-bar" style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
        <div className="date-toggle" style={{display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden'}}>
           <button onClick={() => {
             const t = new Date();
             setFilterDate(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
           }} style={{padding: '0.6rem 1.2rem', border: 'none', background: filterDate === (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}` })() ? 'var(--accent)' : 'transparent', color: filterDate === (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}` })() ? 'white' : 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem'}}>Today</button>
           <button onClick={() => setFilterDate('')} style={{padding: '0.6rem 1.2rem', border: 'none', borderLeft: '1px solid var(--border)', background: filterDate === '' ? 'var(--accent)' : 'transparent', color: filterDate === '' ? 'white' : 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem'}}>All Days</button>
        </div>

        <div className="calendar-filter" style={{background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px'}}>
          <CalendarIcon size={18} color="var(--text-muted)" />
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', color: 'var(--text-main)', width: '100%'}} />
          {filterDate && <button onClick={() => setFilterDate('')} style={{border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem'}}>&times;</button>}
        </div>
      </div>


      <div className="reports-container" style={{marginTop: '1rem'}}>
        {reports.length === 0 ? (
          <div style={{textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Layers size={48} color="var(--text-muted)" style={{marginBottom: '1rem', opacity: 0.5}} />
            <h3 style={{color: 'var(--text-muted)'}}>No reports found</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Start by adding your first quality inspection report.</p>
            <button className="btn btn-primary" onClick={onAddNew} style={{marginTop: '1.5rem'}}>+ Create First Report</button>
          </div>
        ) : (
          sortedDates.map(dateKey => (
            <div key={dateKey} className="date-group" style={{marginBottom: '3rem'}}>
              <h2 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <CalendarIcon size={20} color="var(--accent)" />
                <span style={{ flex: 1 }}>{formatDisplayDate(dateKey)}</span>
                {isSelectMode && (
                  <button 
                    onClick={() => handleSelectAllForDate(dateKey)}
                    style={{
                      fontSize: '0.8rem', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--accent)',
                      background: groupedReports[dateKey].filter(r => !usedReportIds.includes(r.id)).every(r => selectedIds.includes(r.id)) ? 'var(--accent)' : 'transparent',
                      color: groupedReports[dateKey].filter(r => !usedReportIds.includes(r.id)).every(r => selectedIds.includes(r.id)) ? 'white' : 'var(--accent)',
                      cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    {groupedReports[dateKey].filter(r => !usedReportIds.includes(r.id)).every(r => selectedIds.includes(r.id)) ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </h2>
              
              <div className="report-grid">
                {groupedReports[dateKey].map(report => {
                  const isUsed = usedReportIds.includes(report.id);
                  const isSelected = selectedIds.includes(report.id);
                  return (
                    <div 
                      key={report.id} 
                      className={`report-card ${isSelected ? 'selected' : ''} ${isUsed ? 'used-locked' : ''}`} 
                      onClick={() => {
                        if (isSelectMode) {
                          if (isUsed) return;
                          toggleSelect(report.id);
                        } else {
                          onSelectReport(report);
                        }
                      }}
                      style={{
                        position: 'relative', opacity: isUsed ? 0.6 : 1, cursor: (isUsed && isSelectMode) ? 'not-allowed' : 'pointer',
                        border: isUsed ? '1px solid #ddd' : undefined, background: isUsed ? '#f9f9f9' : undefined
                      }}
                    >
                      {isUsed && (
                        <div style={{position: 'absolute', top: '10px', right: '10px', background: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 5}}>
                          DELIVERED
                        </div>
                      )}
                      {isSelectMode && !isUsed && (
                        <div className="select-checkbox" style={{
                          position: 'absolute', top: '10px', left: '10px', zIndex: 5,
                          width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--accent)',
                          background: isSelected ? 'var(--accent)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                          {isSelected && <div style={{width: '10px', height: '10px', background: 'white', borderRadius: '50%'}} />}
                        </div>
                      )}
                      <div className="card-header" style={{paddingLeft: (isSelectMode && !isUsed) ? '2rem' : '0'}}>
                        <span className={`brand-badge badge-${report.brand?.toLowerCase()}`}>{report.brand}</span>
                        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                          {!isUsed && (
                            <>
                              <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEditReport(report); }} style={{background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '4px'}}><Edit2 size={18} /></button>
                              <button className="delete-btn" onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this report?')) onDeleteReport(report.id); }} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px'}}><Trash2 size={18} /></button>
                            </>
                          )}
                          <FileText size={18} color="var(--text-muted)" />
                        </div>
                      </div>
                      <h3 className="card-title">{report.productCode}</h3>
                      <div className="card-meta"><Hash size={14} /> {report.po}</div>
                      <div className="card-meta" style={{marginTop: '0.25rem'}}><CalendarIcon size={14} /> {report.date}</div>
                      <div className="card-stats">
                        <div className="stat-item">
                          <span className="stat-label">Total Qty</span>
                          <span className="stat-value">{Object.values(report.quantities || {}).reduce((a, b) => a + (b || 0), 0)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">QC Name</span>
                          <span className="stat-value">{report.qamName || 'GANESH'}</span>
                        </div>
                      </div>
                      <div style={{marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600}}>
                        View Full Report <ChevronRight size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportList;
