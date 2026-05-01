import React from 'react';
import { Plus, FileText, ChevronRight, LayoutGrid, Download } from 'lucide-react';

const DCPage = ({ onSelectDC, onAddNewDC, onDownloadDC, dcList }) => {
  return (
    <div className="dc-manager-view" style={{ padding: '1rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {dcList.map(dc => (
          <div 
            key={dc.id}
            onClick={() => onSelectDC(dc)}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
              }}>
                <LayoutGrid size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onDownloadDC) onDownloadDC(dc); 
                  }}
                  style={{ background: '#eff6ff', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--accent)', padding: '6px', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                  title="Download Delivery Report"
                  onMouseOver={(e) => e.currentTarget.style.background = '#dbeafe'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#eff6ff'}
                >
                  <Download size={16} />
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{dc.date}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{dc.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <FileText size={16} /> {dc.count} Reports Included
            </div>

            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', 
              color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: '1rem' 
            }}>
              View Delivery Report <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DCPage;
