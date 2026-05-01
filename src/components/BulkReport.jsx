import React, { useState, useEffect, useRef } from 'react';
import { Printer, ArrowLeft, Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const BulkReport = ({ reports, onBack, autoDownload = false, onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef(null);
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  const didFire = useRef(false);

  useEffect(() => {
    if (autoDownload && reports.length > 0 && !isDownloading && !didFire.current) {
      didFire.current = true;
      handleDownloadPDF();
    }
  }, [autoDownload, reports, isDownloading]);

  const handleDownloadPDF = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    if (!containerRef.current) {
        setIsDownloading(false);
        return;
    }
    
    const elements = containerRef.current.querySelectorAll('.qc-report-paper-single');
    if (!elements || elements.length === 0) {
       setIsDownloading(false);
       return;
    }

    const tempContainer = document.createElement('div');
    tempContainer.style.background = 'white';
    
    elements.forEach((page) => {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-container';
      pageWrapper.style.width = '210mm';
      pageWrapper.style.height = '295mm';
      pageWrapper.style.position = 'relative';
      pageWrapper.style.overflow = 'hidden';
      pageWrapper.style.background = 'white';
      
      const clone = page.cloneNode(true);
      clone.style.transform = 'rotate(90deg) scale(1)';
      clone.style.transformOrigin = 'top left';
      clone.style.position = 'absolute';
      clone.style.top = '0';
      clone.style.left = '210mm';
      clone.style.width = '297mm'; 
      clone.style.height = '210mm';
      clone.style.margin = '0';
      clone.style.padding = '4mm';
      
      pageWrapper.appendChild(clone);
      tempContainer.appendChild(pageWrapper);
    });

    document.body.appendChild(tempContainer);

    const opt = {
      margin: 0,
      filename: `QC_Report_Export_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'after', after: '.pdf-page-container' }
    };

    html2pdf().set(opt).from(tempContainer).save().then(() => {
      document.body.removeChild(tempContainer);
      setIsDownloading(false);
      if (onDownloadComplete) onDownloadComplete();
    }).catch(err => {
      console.error('PDF Error:', err);
      if (tempContainer.parentNode) document.body.removeChild(tempContainer);
      setIsDownloading(false);
      if (onDownloadComplete) onDownloadComplete();
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const measurementRows = [
    { label: 'SHOULDER',        specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
    { label: 'CHEST',           specs: { S: '18 3/4', M: '19 3/4', L: '20 3/4', XL: '21 3/4', '2XL': '22 3/4', '3XL': '23 3/4', '4XL': '24 3/4' } },
    { label: 'BODY LENGTH',     specs: { S: '27', M: '28', L: '28 1/2', XL: '29', '2XL': '29 1/2', '3XL': '30', '4XL': '30 1/2' } },
    { label: 'ARMHOLE',         specs: { S: '8', M: '8 1/2', L: '8 3/4', XL: '9 1/4', '2XL': '9 1/2', '3XL': '9 3/4', '4XL': '9 3/4' } },
    { label: 'BACK NECK WIDTH', specs: { S: '7', M: '7 1/4', L: '7 1/2', XL: '7 1/2', '2XL': '7 3/4', '3XL': '8', '4XL': '8' } },
    { label: 'SLEEV LENGTH',    specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
    { label: 'SLEEVE OPEN',     specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
  ];

  if (!reports || reports.length === 0) return null;

  return (
    <div className="report-view-wrapper" ref={containerRef}>
      <div className="no-print header-actions">
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={18} /> Back</button>
        <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={isDownloading}>
          {isDownloading ? <><Loader2 size={18} className="spin" /> Generating...</> : <><Download size={18} /> Download All</>}
        </button>
      </div>

      <div className="report-scroll-container">
        {reports.map((report, index) => {
          const inspQty = report.quantities || {};
          const totalInsp = Object.values(inspQty).reduce((a, b) => a + (b || 0), 0);
          return (
            <div key={report.id || index} className="qc-report-paper-single" style={{ 
              background: 'white', width: '297mm', height: '210mm', margin: '0 auto 40px auto', 
              border: '2px solid black', fontFamily: "'Arial Narrow', sans-serif", position: 'relative', 
              padding: '10mm 5mm 5mm 5mm', boxSizing: 'border-box'
            }}>
              <div className="header-grid">
                <div className="logo-section">
                  <div className="brand-logo-exact"><div className="brand-main-text">MANIAC</div><div className="brand-sub-text">STREETWEAR</div></div>
                </div>
                <div className="title-section">
                  <div className="company-name-exact">FRISKE KNITS PRIVATE LIMITED</div>
                  <div className="report-type-exact">FINAL INSPECTION REPORT</div>
                  <div style={{ fontWeight: '900', fontSize: '13pt', color: '#000' }}>PO NO : {report.po}</div>
                </div>
                <div className="units-top-right" style={{ flex: 1.8 }}>
                  <table className="size-qty-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                    <thead>
                      <tr style={{ fontSize: '7pt', background: '#f0f0f0' }}>
                        <th style={{ border: '1px solid black' }}>Size</th><th style={{ border: '1px solid black' }}>Order</th><th style={{ border: '1px solid black' }}>Cut</th><th style={{ border: '1px solid black' }}>Insp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map(s => (
                        <tr key={s} style={{ fontSize: '8pt', textAlign: 'center' }}>
                          <td style={{ border: '1px solid black', fontWeight: 'bold' }}>{s}</td>
                          <td style={{ border: '1px solid black' }}>{report.orderQty?.[s] || ''}</td>
                          <td style={{ border: '1px solid black' }}>{report.cuttingQty?.[s] || ''}</td>
                          <td style={{ border: '1px solid black', fontWeight: 'bold' }}>{inspQty[s] || ''}</td>
                        </tr>
                      ))}
                      <tr style={{ fontSize: '8pt', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>
                        <td style={{ border: '1px solid black' }}>TOTAL</td>
                        <td style={{ border: '1px solid black' }}>{Object.values(report.orderQty || {}).reduce((a,b)=>a+(b||0),0) || ''}</td>
                        <td style={{ border: '1px solid black' }}>{Object.values(report.cuttingQty || {}).reduce((a,b)=>a+(b||0),0) || ''}</td>
                        <td style={{ border: '1px solid black' }}>{totalInsp}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <table className="checklist-table-exact">
                <tbody>
                  <tr><td className="lbl">DATE</td><td colSpan="2" className="val">{formatDate(report.date)}</td><td className="lbl">BARCODE</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">W/CARE LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                  <tr><td className="lbl">BRAND</td><td colSpan="2" className="val">{report.brand}</td><td className="lbl">PRINT POSITION</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">GSM</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                  <tr><td className="lbl">MAIN LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">WASHING QUALITY</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">IRONING-PACKING</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                  <tr><td className="lbl">FLAGE LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">STITCHING</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">POLY BAG</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                  <tr><td className="lbl">HANG TAG</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">SPI</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">FABRIC</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                </tbody>
              </table>
              <div className="po-bar-exact">
                <div className="po-info-combined"><div className="info-group"><span className="lbl-dark">PO NO</span><span className="val">{report.po}</span></div><div className="info-group"><span className="lbl-dark">PRODUCT CODE</span><span className="val">{report.productCode}</span></div></div>
                <div className="status-labels"><div className="stat">PASS</div><div className="stat">FAIL</div><div className="stat" style={{ fontSize: '10pt', background: '#f8fafc', fontWeight: 'bold' }}>TOTAL : {totalInsp}</div><div className="stat">TOTAL BOX</div></div>
              </div>
              <div className="measurement-area">
                <table className="measurement-table-exact">
                  <thead><tr><th className="ls-col"></th>{sizes.map(s => (<React.Fragment key={s}><th>{s}</th><th className="meas-writein-hdr"></th></React.Fragment>))}</tr></thead>
                  <tbody>{measurementRows.map((row, idx) => (<tr key={idx}><td className="point-label">{row.label}</td>{sizes.map(s => (<React.Fragment key={s}><td>{row.specs[s]}</td><td className="meas-writein-box"></td></React.Fragment>))}</tr>))}</tbody>
                </table>
              </div>
              <div className="remarks-area-exact"><div className="label">Remarks</div><div className="value">{report.remarks}</div></div>
              <div className="signature-area-exact"><div className="sign-box">UNIT INCHARGE</div><div className="sign-box">MD</div><div className="sign-box">INSPECTION Q.A</div></div>
              <div style={{ position: 'absolute', bottom: '5px', right: '10px', fontSize: '8pt', color: '#000', fontWeight: '900' }}>TEXTRACK</div>
            </div>
          );
        })}

        {/* --- Bulk Order Summary (Landscape) --- */}
        {(() => {
          const chunks = [];
          for (let i = 0; i < reports.length; i += 15) chunks.push(reports.slice(i, i + 15));
          
          return chunks.map((chunk, chunkIdx) => (
            <div key={`summary-${chunkIdx}`} className="qc-report-paper-single" style={{ 
              padding: '40px', background: '#fff', width: '297mm', height: '210mm', margin: '0 auto 40px auto', 
              border: '2px solid black', fontFamily: "'Arial Narrow', sans-serif", position: 'relative', boxSizing: 'border-box'
            }}>
              <h2 style={{marginBottom: '2rem', textAlign: 'center', textDecoration: 'underline', fontSize: '20pt'}}>
                Bulk Order Summary {chunks.length > 1 ? `(Part ${chunkIdx + 1})` : ''}
              </h2>

              <table className="bulk-summary-table" style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                <thead>
                  <tr style={{background: '#000', color: 'white', fontSize: '9pt'}}>
                    <th style={{width: '40px', border: '1px solid black', padding: '8px'}}>S.NO</th>
                    <th style={{width: '120px', border: '1px solid black', padding: '8px'}}>PO NO</th>
                    <th style={{border: '1px solid black', padding: '8px'}}>PRODUCT</th>
                    {sizes.map(s => <th key={s} style={{width: '35px', border: '1px solid black'}}>{s}</th>)}
                    <th style={{width: '50px', border: '1px solid black', background: '#000'}}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{padding: '10px', border: '1px solid black', textAlign: 'center'}}>{(chunkIdx * 15) + idx + 1}</td>
                      <td style={{padding: '10px', border: '1px solid black', fontWeight: 'bold'}}>{item.po}</td>
                      <td style={{padding: '10px', border: '1px solid black'}}>{item.productCode}</td>
                      {sizes.map(s => <td key={s} style={{padding: '10px', border: '1px solid black', textAlign: 'center'}}>{item.quantities?.[s] || 0}</td>)}
                      <td style={{padding: '10px', border: '1px solid black', textAlign: 'center', fontWeight: 'bold', background: '#f8fafc'}}>{Object.values(item.quantities || {}).reduce((a,b)=>a+b,0)}</td>
                    </tr>
                  ))}
                </tbody>
                {chunkIdx === chunks.length - 1 && (
                  <tfoot>
                    <tr style={{background: '#f1f5f9', fontWeight: 'bold', fontSize: '14pt'}}>
                      <td colSpan={3 + sizes.length} style={{padding: '15px', border: '1px solid black', textAlign: 'right'}}>GRAND TOTAL PIECES:</td>
                      <td style={{padding: '15px', border: '1px solid black', textAlign: 'center', background: '#000', color: '#fff'}}>{reports.reduce((acc, r) => acc + Object.values(r.quantities || {}).reduce((a, b) => a + (b || 0), 0), 0)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>

              {chunkIdx === chunks.length - 1 && (
                <div style={{marginTop: '4rem', display: 'flex', justifyContent: 'space-between'}}>
                   <div style={{borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '10px', fontWeight: 'bold'}}>PREPARED BY</div>
                   <div style={{borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '10px', fontWeight: 'bold'}}>AUTHORIZED SIGNATORY</div>
                </div>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

export default BulkReport;
