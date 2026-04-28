import React from 'react';
import { Calendar, Layers, FileText, ChevronRight, Hash, Trash2 } from 'lucide-react';

const ReportList = ({ reports, onSelectReport, onDeleteReport, onAddNew }) => {
  return (
    <div className="report-list-view">
      <div className="header-actions">
        <div>
          <h1>QC Inspection Dashboard</h1>
          <p style={{color: 'var(--text-muted)'}}>Manage and track your garment quality reports</p>
        </div>
        <button className="btn btn-primary" onClick={onAddNew}>
          + Add New Report
        </button>
      </div>

      <div className="report-grid">
        {reports.length === 0 ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Layers size={48} color="var(--text-muted)" style={{marginBottom: '1rem', opacity: 0.5}} />
            <h3 style={{color: 'var(--text-muted)'}}>No reports found</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Start by adding your first quality inspection report.</p>
            <button className="btn btn-primary" onClick={onAddNew} style={{marginTop: '1.5rem'}}>
              + Create First Report
            </button>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="report-card" onClick={() => onSelectReport(report)}>
              <div className="card-header">
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
                <Calendar size={14} /> {report.date}
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
          ))
        )}
      </div>
    </div>
  );
};

export default ReportList;
