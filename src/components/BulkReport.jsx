import React, { useState, useEffect, useRef } from 'react';
import { Printer, ArrowLeft, Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const BulkReport = ({ reports, onBack, autoDownload = false, onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef(null);
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  const didFire = useRef(false);

  useEffect(() => {
    // Ensure we only trigger once per mount to prevent double downloads (React StrictMode fix)
    if (autoDownload && reports.length > 0 && !isDownloading && !didFire.current) {
      didFire.current = true;
      handleDownloadPDF();
    }
  }, [autoDownload, reports, isDownloading]);

  const handleDownloadPDF = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    // Target ONLY elements within this specific component's ref to avoid duplicate copies
    if (!containerRef.current) {
        setIsDownloading(false);
        return;
    }
    
    const elements = containerRef.current.querySelectorAll('.qc-report-paper');
    if (!elements || elements.length === 0) {
       setIsDownloading(false);
       return;
    }

    const tempContainer = document.createElement('div');
    tempContainer.style.background = 'white';
    
    elements.forEach((page, index) => {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-container';
      pageWrapper.style.width = '210mm';
      pageWrapper.style.height = '295mm';
      pageWrapper.style.position = 'relative';
      pageWrapper.style.overflow = 'hidden';
      pageWrapper.style.background = 'white';
      
      const clone = page.cloneNode(true);
      
      // Rotated Landscape for Reports
      clone.style.transform = 'rotate(90deg)';
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
      filename: `QC_Bulk_Report_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'after', after: '.pdf-page-container' }
    };

    html2pdf().set(opt).from(tempContainer).save().then(() => {
      document.body.removeChild(tempContainer);
      setIsDownloading(false);
      if (onDownloadComplete) onDownloadComplete();
    }).catch(err => {
      console.error('PDF Generation Error:', err);
      if (tempContainer.parentNode) document.body.removeChild(tempContainer);
      setIsDownloading(false);
      if (onDownloadComplete) onDownloadComplete();
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}-${month}-${year}`;
  };

  if (!reports || reports.length === 0) return null;

  const grandTotalPieces = reports.reduce((acc, report) => {
    return acc + Object.values(report.quantities).reduce((a, b) => a + b, 0);
  }, 0);

  return (
    <div className="report-view-wrapper" ref={containerRef}>
      <div className="no-print header-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <button
          className="btn btn-primary"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          style={{background: 'var(--accent)', borderColor: 'var(--accent)'}}
        >
          {isDownloading ? (
            <><Loader2 size={18} className="spin" /> Generating...</>
          ) : (
            <><Download size={18} /> Download All ({reports.length} PDFs)</>
          )}
        </button>
      </div>

      <div className="report-scroll-container">
        {reports.map((report, index) => {
          const reportTotal = Object.values(report.quantities || {}).reduce((a, b) => a + (b || 0), 0);
          return (
            <div key={report.id || index} className="qc-report-paper" style={{ marginBottom: '20px' }}>
              {/* Individual Report Content */}
              <div className="header-grid">
                <div className="logo-section">
                   <div className="brand-logo-exact">
                      <div className="brand-main-text">MANIAC</div>
                      <div className="brand-sub-text">STREETWEAR</div>
                   </div>
                </div>
                <div className="title-section">
                  <div className="company-name-exact">FRISKE KNITS PRIVATE LIMITED</div>
                  <div className="report-type-exact">FINAL INSPECTION REPORT</div>
                  <div style={{fontWeight: '900', fontSize: '13pt', marginTop: '2px', color: '#000'}}>PO NO : {report.po}</div>
                </div>
                <div className="units-top-right">
                    <div className="unit-box-exact">UNIT NAME: HA</div>
                    <div className="unit-box-exact">QC NAME: GANESH</div>
                 </div>
               </div>

            <table className="checklist-table-exact">
              <tbody>
                <tr>
                  <td className="lbl">DATE</td><td colSpan="2" className="val">{formatDate(report.date)}</td>
                  <td className="lbl">BARCODE</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">W/CARE LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                </tr>
                <tr>
                  <td className="lbl">BRAND</td><td colSpan="2" className="val">{report.brand}</td>
                  <td className="lbl">PRINT POSITION</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">GSM</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                </tr>
                <tr>
                  <td className="lbl">MAIN LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">WASHING QUALITY</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">IRONING-PACKING</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                </tr>
                <tr>
                  <td className="lbl">FLAGE LABLE</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">STITCHING</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">POLY BAG</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                </tr>
                <tr>
                  <td className="lbl">HANG TAG</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">SPI</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                  <td className="lbl">FABRIC</td><td className="opt">Okay</td><td className="opt">Not Okay</td>
                </tr>
              </tbody>
            </table>

               <div className="summary-bar-exact">
                  <table className="summary-table-exact">
                    <thead>
                      <tr>
                        <th className="dark">SIZE INSP QTY</th>
                        {sizes.map(s => <th key={s}>{s}</th>)}
                        <th className="dark">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="label-cell">INSP QTY</td>
                        {sizes.map(s => <td key={s} className="insp-qty-val">{report.quantities[s]}</td>)}
                        <td className="insp-qty-total" style={{ background: '#000', color: '#fff', fontWeight: 'bold', fontSize: '12pt' }}>{reportTotal}</td>
                      </tr>
                    </tbody>
                  </table>
               </div>

              <div className="po-bar-exact">
                <div className="po-info-combined">
                  <div className="info-group">
                    <span className="lbl-dark">PO NO</span>
                    <span className="val">{report.po}</span>
                  </div>
                  <div className="info-group">
                    <span className="lbl-dark">PRODUCT CODE</span>
                    <span className="val">{report.productCode}</span>
                  </div>
                </div>
                <div className="status-labels">
                   <div className="stat">PASS</div>
                   <div className="stat">FAIL</div>
                   <div className="stat" style={{fontSize: '10pt', background: '#f8fafc', fontWeight: 'bold'}}>TOTAL : {reportTotal}</div>
                   <div className="stat">TOTAL BOX</div>
                </div>
              </div>

              <div className="measurement-area">
                 <table className="measurement-table-exact">
                   <thead>
                     <tr>
                       <th className="ls-col">L/S</th>
                       {sizes.map(s => <th key={s}>{s}</th>)}
                     </tr>
                   </thead>
                   <tbody>
                     <tr><td className="point-label">SHOULDER</td>{sizes.map(s => <td key={s}></td>)}</tr>
                     <tr><td className="point-label">CHEST</td><td>18 3/4</td><td>19 3/4</td><td>20 3/4</td><td>21 3/4</td><td>22 3/4</td><td>23 3/4</td><td>24 3/4</td></tr>
                     <tr><td className="point-label">BODY LENGTH</td><td>27</td><td>28</td><td>28 1/2</td><td>29</td><td>29 1/2</td><td>30</td><td>30 1/2</td></tr>
                     <tr><td className="point-label">ARMHOLE</td><td>8</td><td>8 1/2</td><td>8 3/4</td><td>9 1/4</td><td>9 1/2</td><td>9 3/4</td><td>9 3/4</td></tr>
                     <tr><td className="point-label">BACK NECK WIDTH</td><td>7</td><td>7 1/4</td><td>7 1/2</td><td>7 1/2</td><td>7 3/4</td><td>8</td><td>8</td></tr>
                     <tr><td className="point-label">SLEEVE LENGTH</td>{sizes.map(s => <td key={s}></td>)}</tr>
                     <tr><td className="point-label">SLEEVE OPEN</td>{sizes.map(s => <td key={s}></td>)}</tr>
                     <tr style={{background: '#f8fafc', fontWeight: 'bold'}}><td className="point-label">TOTAL</td>{sizes.map(s => <td key={s} style={{fontSize: '11pt'}}>{report.quantities[s]}</td>)}</tr>
                   </tbody>
                 </table>
              </div>

              <div className="total-pieces-footer">
                <div className="total-label">TOTAL PIECE</div>
                <div className="total-value">{reportTotal} PIECES</div>
              </div>

              <div className="signature-area-exact">
                <div className="sign-box">UNIT INCHARGE</div>
                <div className="sign-box">MD</div>
                <div className="sign-box">INSPECTION Q.A</div>
              </div>

              <div className="system-tag-exact" style={{
                position: 'absolute',
                bottom: '5px',
                right: '10px',
                fontSize: '8pt',
                color: '#94a3b8',
                fontWeight: 'bold',
                opacity: 0.5
              }}>TEXTRACK</div>
            </div>
          );
        })}

        {/* Summary Page at the end of bulk download */}
        <div className="qc-report-paper" style={{ padding: '40px', background: '#fff' }}>
          {/* Summary Branding Header */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '15px' }}>
            <div style={{ fontSize: '14pt', fontWeight: '900', color: '#000', textAlign: 'right' }}>
              DATE: {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>

          <h2 style={{marginBottom: '2rem', textAlign: 'center', textDecoration: 'underline', fontSize: '20pt'}}>Bulk Order Summary</h2>
          <table className="bulk-summary-table" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#000', color: 'white'}}>
                <th style={{padding: '12px', border: '1px solid black'}}>S.NO</th>
                <th style={{padding: '12px', border: '1px solid black'}}>PO NO</th>
                <th style={{padding: '12px', border: '1px solid black'}}>PRODUCT</th>
                {sizes.map(s => <th key={s} style={{padding: '12px', border: '1px solid black'}}>{s}</th>)}
                <th style={{padding: '12px', border: '1px solid black'}}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{padding: '10px', border: '1px solid black', textAlign: 'center'}}>{idx + 1}</td>
                  <td style={{padding: '10px', border: '1px solid black', fontWeight: 'bold'}}>{item.po}</td>
                  <td style={{padding: '10px', border: '1px solid black'}}>{item.productCode}</td>
                  {sizes.map(s => <td key={s} style={{padding: '10px', border: '1px solid black', textAlign: 'center'}}>{item.quantities[s] || 0}</td>)}
                  <td style={{padding: '10px', border: '1px solid black', textAlign: 'center', fontWeight: 'bold', background: '#f8fafc'}}>{Object.values(item.quantities).reduce((a,b)=>a+b,0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{background: '#f1f5f9', fontWeight: 'bold', fontSize: '14pt'}}>
                <td colSpan={3 + sizes.length} style={{padding: '15px', border: '1px solid black', textAlign: 'right'}}>GRAND TOTAL PIECES:</td>
                <td style={{padding: '15px', border: '1px solid black', textAlign: 'center', background: '#000', color: '#fff'}}>{grandTotalPieces}</td>
              </tr>
            </tfoot>
          </table>

          <div style={{marginTop: '4rem', display: 'flex', justifyContent: 'space-between'}}>
             <div style={{borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '10px', fontWeight: 'bold'}}>PREPARED BY</div>
             <div style={{borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '10px', fontWeight: 'bold'}}>AUTHORIZED SIGNATORY</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkReport;
