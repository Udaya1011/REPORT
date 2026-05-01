import React, { useState, useEffect, useRef } from 'react';
import { Printer, ArrowLeft, Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const BulkReport = ({ reports, onBack, autoDownload = false, onDownloadComplete, summaryOnly = false, isDCView = false, dcInfo = null, autoOpenBlob = false }) => {
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

    const allElements = containerRef.current.querySelectorAll('.qc-report-paper-single');
    // When downloading from DC view, only download the Delivery Report (summary pages)
    const elements = (isDCView && summaryOnly !== false) 
      ? Array.from(allElements).filter(el => el.classList.contains('summary-page'))
      : Array.from(allElements);
      
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
      pageWrapper.style.height = '296.5mm';
      pageWrapper.style.position = 'relative';
      pageWrapper.style.overflow = 'hidden';
      pageWrapper.style.background = 'white';
      pageWrapper.style.pageBreakAfter = 'always';
      
      const clone = page.cloneNode(true);
      
      // Since the view is already Portrait (210x297), we just ensure styles are clean for export
      clone.style.position = 'relative';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.margin = '0';
      clone.style.width = '210mm';
      clone.style.height = '297mm';
      clone.style.transform = 'none';
      clone.style.boxSizing = 'border-box';
      
      if (page.classList.contains('summary-page')) {
        clone.style.padding = '10mm';
        clone.style.border = '2.5px solid #333';
      } else {
        clone.style.border = '2px solid black';
      }
      
      pageWrapper.appendChild(clone);
      tempContainer.appendChild(pageWrapper);
    });

    document.body.appendChild(tempContainer);

    const opt = {
      margin: 0,
      filename: `QC_Report_Export_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        logging: false,
        windowWidth: 794 // A4 Portrait width in pixels at 96dpi
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    // Add a small delay to ensure cloning and layout are fully settled
    setTimeout(() => {
      if (autoOpenBlob) {
        html2pdf().set(opt).from(tempContainer).outputPdf('blob').then((pdfBlob) => {
          document.body.removeChild(tempContainer);
          setIsDownloading(false);
          const url = URL.createObjectURL(pdfBlob);
          window.location.replace(url);
          if (onDownloadComplete) onDownloadComplete();
        }).catch(err => {
          console.error('PDF Error:', err);
          if (tempContainer.parentNode) document.body.removeChild(tempContainer);
          setIsDownloading(false);
          if (onDownloadComplete) onDownloadComplete();
        });
      } else {
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
      }
    }, 100);
  };

  const handleDownloadAll = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    if (!containerRef.current) {
      setIsDownloading(false);
      return;
    }

    const elements = Array.from(containerRef.current.querySelectorAll('.qc-report-paper-single'));
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
      pageWrapper.style.height = '296.5mm';
      pageWrapper.style.position = 'relative';
      pageWrapper.style.overflow = 'hidden';
      pageWrapper.style.background = 'white';
      pageWrapper.style.pageBreakAfter = 'always';
      const clone = page.cloneNode(true);
      if (page.classList.contains('summary-page')) {
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = '210mm';
        clone.style.height = '297mm';
        clone.style.transform = 'none';
        clone.style.margin = '0';
        clone.style.padding = '10mm';
        clone.style.boxSizing = 'border-box';
        clone.style.border = '2.5px solid #333';
      } else {
        clone.style.transform = 'rotate(90deg) scale(1)';
        clone.style.transformOrigin = 'top left';
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '210mm';
        clone.style.width = '297mm';
        clone.style.height = '210mm';
        clone.style.margin = '0';
        clone.style.padding = '4mm';
      }
      pageWrapper.appendChild(clone);
      tempContainer.appendChild(pageWrapper);
    });

    document.body.appendChild(tempContainer);
    const opt = {
      margin: 0,
      filename: `QC_Report_Full_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(tempContainer).save().then(() => {
      document.body.removeChild(tempContainer);
      setIsDownloading(false);
    }).catch(err => {
      console.error('PDF Error:', err);
      if (tempContainer.parentNode) document.body.removeChild(tempContainer);
      setIsDownloading(false);
    });
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}:${month}:${year}`;
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
        <button id="main-download-btn" onClick={handleDownloadPDF} style={{ display: 'none' }} />
      </div>

      <div className="report-scroll-container" style={{ minWidth: '100%', overflowX: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="report-scroll-inner" style={{ minWidth: '297mm', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* --- Bulk Order Summary (Portrait Delivery Report) --- */}
        {(isDCView || reports.length > 1) && (() => {
          const chunks = [];
          for (let i = 0; i < reports.length; i += 20) chunks.push(reports.slice(i, i + 20));
          
          return chunks.map((chunk, chunkIdx) => {
            let formattedDate = '';
            let formattedDcNo = '';
            if (isDCView && dcInfo) {
               try {
                 const [year, month, day] = dcInfo.date.split('-');
                 formattedDate = `${day}:${month}:${year}`;
               } catch(e) { formattedDate = dcInfo.date; }
               formattedDcNo = dcInfo.name.replace(/DC-/i, '').trim();
            }

            return (
            <div key={`summary-${chunkIdx}`} className="qc-report-paper-single summary-page" style={{ 
              padding: '15mm 10mm', background: '#fff', width: '210mm', height: '297mm', margin: '0 auto 40px auto', 
              border: '2.5px solid #333', fontFamily: "'Arial', sans-serif", position: 'relative', boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column'
            }}>
              {isDCView && dcInfo ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '150px' }}>
                    <div style={{ fontSize: '11pt', fontWeight: '900', color: '#1e293b' }}>DC NO: {formattedDcNo}</div>
                    <div style={{ fontSize: '11pt', fontWeight: '900', color: '#1e293b' }}>DATE: {formattedDate}</div>
                  </div>
                  
                  <h1 style={{ textAlign: 'center', textDecoration: 'underline', fontSize: '24pt', fontWeight: '950', margin: 0, color: '#1e293b', flex: 1 }}>
                    DELIVERY REPORT
                  </h1>

                  <div style={{ textAlign: 'center', width: '150px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`${window.location.origin}/?dc=${dcInfo.id || dcInfo._id}&view=pdf`)}`}
                      alt="Scan to view DC"
                      style={{ width: '60px', height: '60px', display: 'block' }}
                    />
                    <div style={{ fontSize: '7pt', color: '#64748b', marginTop: '2px', width: '60px', textAlign: 'center' }}>Scan to view</div>
                  </div>
                </div>
              ) : (
                <h1 style={{ textAlign: 'center', textDecoration: 'underline', fontSize: '24pt', fontWeight: '950', marginBottom: '15px', color: '#1e293b' }}>
                  TOTAL PIECES
                </h1>
              )}

              {isDCView && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, border: '2px solid black', padding: '10px' }}>
                    <div style={{ fontSize: '9pt', fontWeight: '900', borderBottom: '1px solid #ccc', marginBottom: '5px' }}>FROM:</div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>ALFIYA APPARELS - TIRUPPUR</div>
                  </div>
                  <div style={{ flex: 1, border: '2px solid black', padding: '10px' }}>
                    <div style={{ fontSize: '9pt', fontWeight: '900', borderBottom: '1px solid #ccc', marginBottom: '5px' }}>TO:</div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>FRISKE KNITS - TIRUPPUR</div>
                  </div>
                </div>
              )}

              <table className="bulk-summary-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', border: '2px solid black' }}>
                <thead>
                  <tr style={{ background: '#000', color: 'white', fontSize: '9pt' }}>
                    <th style={{ width: '30px', border: '1px solid white', padding: '8px 2px' }}>S.NO</th>
                    <th style={{ width: '115px', border: '1px solid white', padding: '8px 2px' }}>PO NO</th>
                    <th style={{ border: '1px solid white', padding: '8px 2px' }}>PRODUCT</th>
                    {sizes.map(s => <th key={s} style={{ width: '35px', border: '1px solid white' }}>{s}</th>)}
                    <th style={{ width: '55px', border: '1px solid white' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((item, idx) => (
                    <tr key={item.id || idx} style={{ fontSize: '8.5pt' }}>
                      <td style={{ padding: '6px 2px', border: '1px solid black', textAlign: 'center' }}>{(chunkIdx * 20) + idx + 1}</td>
                      <td style={{ padding: '6px 4px', border: '1px solid black', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.po}</td>
                      <td style={{ padding: '6px 4px', border: '1px solid black', fontSize: '8pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productCode}</td>
                      {sizes.map(s => <td key={s} style={{ padding: '6px 2px', border: '1px solid black', textAlign: 'center' }}>{item.quantities?.[s] || 0}</td>)}
                      <td style={{ padding: '6px 2px', border: '1px solid black', textAlign: 'center', fontWeight: 'bold', background: '#f8fafc' }}>{Object.values(item.quantities || {}).reduce((a, b) => a + (b || 0), 0)}</td>
                    </tr>
                  ))}
                </tbody>
                {chunkIdx === chunks.length - 1 && (
                  <tfoot>
                    <tr style={{ background: '#000', color: '#fff', fontWeight: 'bold', fontSize: '12pt' }}>
                      <td colSpan={3 + sizes.length} style={{ padding: '12px', border: '1px solid white', textAlign: 'right' }}>GRAND TOTAL PIECES:</td>
                      <td style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>{reports.reduce((acc, r) => acc + Object.values(r.quantities || {}).reduce((a, b) => a + (b || 0), 0), 0)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>

              {isDCView ? (
                <div style={{ marginTop: 'auto', paddingTop: '60px', display: 'flex', justifyContent: 'space-between', paddingBottom: '20px' }}>
                  <div style={{ width: '220px', textAlign: 'center' }}>
                    <div style={{ borderTop: '2px solid #333', paddingTop: '10px', fontWeight: '900', color: '#1e293b' }}>PREPARED BY</div>
                  </div>
                  <div style={{ width: '220px', textAlign: 'center' }}>
                    <div style={{ borderTop: '2px solid #333', paddingTop: '10px', fontWeight: '900', color: '#1e293b' }}>AUTHORIZED SIGNATORY</div>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 'auto', padding: '40px 0', textAlign: 'center' }}>
                   <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#64748b' }}>TOTAL PIECES PREPARED FOR DELIVERY</div>
                   <div style={{ fontSize: '48pt', fontWeight: '950', color: '#000' }}>
                     {reports.reduce((acc, r) => acc + Object.values(r.quantities || {}).reduce((a, b) => a + (b || 0), 0), 0)}
                   </div>
                </div>
              )}
            </div>
            );
          });
        })()}

          {reports.map((report, index) => {
          const inspQty = report.quantities || {};
          const totalInsp = Object.values(inspQty).reduce((a, b) => a + (b || 0), 0);
          return (
            <div key={report.id || index} className="qc-report-paper-single" style={{ 
              background: 'white', width: '210mm', height: '297mm', margin: '0 auto 40px auto', 
              border: '1px solid #333', position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                transform: 'rotate(90deg)', transformOrigin: 'top left', 
                width: '297mm', height: '210mm', position: 'absolute', 
                top: '0', left: '210mm', padding: '8mm 10mm', boxSizing: 'border-box',
                fontFamily: "'Arial Narrow', sans-serif", display: 'flex', flexDirection: 'column', gap: '5px'
              }}>
                <div className="header-grid">
                  <div className="logo-section" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '8px', padding: '5px' }}>
                    <div className="brand-logo-exact">
                      <div className="brand-main-text">MANIAC</div>
                      <div className="brand-sub-text">STREETWEAR</div>
                    </div>
                    <div style={{ fontSize: '9pt', fontWeight: '950', textAlign: 'center', border: '1.5px solid black', width: '100%', padding: '2px 0', background: '#f8fafc' }}>
                      QC: {report.qamName?.trim() || 'GANESH'}
                    </div>
                  </div>
                  <div className="title-section" style={{ flex: 4, borderRight: '1.5px solid black' }}>
                    <div className="company-name-exact" style={{ fontSize: '10pt', letterSpacing: '1px' }}>FRISKE KNITS PRIVATE LIMITED</div>
                    <div className="report-type-exact" style={{ fontSize: '20pt', fontWeight: '950' }}>FINAL INSPECTION REPORT</div>
                  </div>
                  <div className="metadata-section" style={{ flex: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                    <div className="brand-logo-exact" style={{ width: '100%', minHeight: '60px', padding: '5px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', border: '2px solid black' }}>
                      <div className="brand-main-text" style={{ fontSize: '24pt', fontWeight: '950' }}>{report.unitName?.trim() || 'HA'}</div>
                      <div style={{ fontSize: '11pt', fontWeight: '950', borderTop: '2px solid black', width: '100%', marginTop: '5px', paddingTop: '3px', textAlign: 'center' }}>PO: {report.po}</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', borderBottom: '2px solid black', gap: '0' }}>
                  <table className="checklist-table-exact" style={{ flex: 1, borderBottom: 'none' }}>
                    <tbody>
                      <tr><td className="lbl">DATE</td><td colSpan="2" className="val">{formatDate(report.date)}</td><td className="lbl">BARCODE</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">W/CARE LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                      <tr><td className="lbl">BRAND</td><td colSpan="2" className="val">{report.brand}</td><td className="lbl">PRINT POSITION</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">GSM</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                      <tr><td className="lbl">MAIN LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">WASHING QUALITY</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">IRONING-PACKING</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                      <tr><td className="lbl">FLAGE LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">STITCHING</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">POLY BAG</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                      <tr><td className="lbl">HANG TAG</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">SPI</td><td className="opt">Okay</td><td className="opt">Not Okay</td><td className="lbl">FABRIC</td><td className="opt">Okay</td><td className="opt">Not Okay</td></tr>
                    </tbody>
                  </table>
                  <div style={{ width: '28%', borderLeft: '2px solid black' }}>
                     <table className="size-qty-table" style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <thead>
                        <tr style={{ fontSize: '8pt', background: '#f1f5f9', fontWeight: '900', height: '28px' }}>
                          <th style={{ borderBottom: '1.5px solid black', borderRight: '1.5px solid black', width: '35px' }}>Size</th>
                          <th style={{ borderBottom: '1.5px solid black', borderRight: '1.5px solid black' }}>ORD QTY</th>
                          <th style={{ borderBottom: '1.5px solid black', borderRight: '1.5px solid black' }}>CUT QTY</th>
                          <th style={{ borderBottom: '1.5px solid black' }}>INSP QTY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizes.map(s => (
                          <tr key={s} style={{ fontSize: '11pt', height: '28px', textAlign: 'center' }}>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', fontWeight: '950', background: '#f9f9f9' }}>{s}</td>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', fontWeight: 'bold' }}>{report.orderQty?.[s] || ''}</td>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', fontWeight: 'bold' }}>{report.cuttingQty?.[s] || ''}</td>
                            <td style={{ borderBottom: '1px solid black', fontWeight: '950' }}>{inspQty[s] || ''}</td>
                          </tr>
                        ))}
                        <tr style={{ fontSize: '11pt', height: '28px', textAlign: 'center', fontWeight: '950', background: '#e2e8f0' }}>
                          <td style={{ borderRight: '1px solid black' }}>TOTAL</td>
                          <td style={{ borderRight: '1px solid black' }}>{Object.values(report.orderQty || {}).reduce((a,b)=>a+(b||0),0) || ''}</td>
                          <td style={{ borderRight: '1px solid black' }}>{Object.values(report.cuttingQty || {}).reduce((a,b)=>a+(b||0),0) || ''}</td>
                          <td>{totalInsp}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="po-bar-exact" style={{ margin: '2px 0' }}>
                  <div className="po-info-combined"><div className="info-group"><span className="lbl-dark">PO NO</span><span className="val">{report.po}</span></div><div className="info-group"><span className="lbl-dark">PRODUCT CODE</span><span className="val">{report.productCode}</span></div></div>
                  <div className="status-labels"><div className="stat">PASS</div><div className="stat">FAIL</div><div className="stat" style={{ fontSize: '10pt', background: '#f8fafc', fontWeight: 'bold' }}>TOTAL : {totalInsp}</div><div className="stat">TOTAL BOX</div></div>
                </div>

                <div className="measurement-area" style={{ flex: 1 }}>
                  <table className="measurement-table-exact">
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th className="ls-col"></th>
                        {sizes.map(s => (
                          <th key={s} colSpan="2" style={{ fontSize: '10pt' }}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {measurementRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="point-label">{row.label}</td>
                          {sizes.map(s => (
                            <React.Fragment key={s}>
                              <td style={{ borderRight: 'none', fontSize: '9.5pt' }}>{row.specs[s]}</td>
                              <td className="meas-writein-box" style={{ borderLeft: 'none' }}></td>
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="footer-section-exact" style={{ marginTop: 'auto' }}>
                  <div className="remarks-area-exact"><div className="label">Remarks</div><div className="value">{report.remarks}</div></div>
                  <div className="signature-area-exact" style={{ marginTop: '5px' }}><div className="sign-box">UNIT INCHARGE</div><div className="sign-box">MD</div><div className="sign-box">INSPECTION Q.A</div></div>
                  <div style={{ textAlign: 'right', fontSize: '9pt', color: '#000', fontWeight: '950', marginTop: '2px' }}>TEXTRACK</div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default BulkReport;
