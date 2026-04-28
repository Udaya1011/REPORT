import React from 'react';
import { Calendar, Layers, FileText, ChevronRight, Hash } from 'lucide-react';

const ReportList = ({ reports, onSelectReport, onAddNew }) => {
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
        {reports.map(report => (
          <div key={report.id} className="report-card" onClick={() => onSelectReport(report)}>
            <div className="card-header">
              <span className={`brand-badge badge-${report.brand.toLowerCase()}`}>
                {report.brand}
              </span>
              <FileText size={18} color="var(--text-muted)" />
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
                  {Object.values(report.quantities).reduce((a, b) => a + b, 0)}
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
  );
};

export default ReportList;
