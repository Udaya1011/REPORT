import React, { useState } from 'react';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const ReportDetails = ({ report, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  if (!report) return null;

  const handleDownloadPDF = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const element = document.getElementById('single-report-capture');
    if (!element) { setIsDownloading(false); return; }

    const tempContainer = document.createElement('div');
    tempContainer.style.background = 'white';

    const pageWrapper = document.createElement('div');
    pageWrapper.style.width = '210mm';
    pageWrapper.style.height = '295mm';
    pageWrapper.style.position = 'relative';
    pageWrapper.style.overflow = 'hidden';
    pageWrapper.style.background = 'white';

    const clone = element.cloneNode(true);
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
    document.body.appendChild(tempContainer);

    const opt = {
      margin: 0,
      filename: `QC_Report_${report.po}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
    if (!year || !month || !day) return dateStr;
    return `${day}-${month}-${year}`;
  };

  // Support old (quantities only) and new (orderQty + cuttingQty + quantities) data shapes
  const orderQty   = report.orderQty   || {};
  const cuttingQty = report.cuttingQty || {};
  const inspQty    = report.quantities  || {};
  const totalInsp  = Object.values(inspQty).reduce((a, b) => a + (b || 0), 0);
  const totalOrder = Object.values(orderQty).reduce((a, b) => a + (b || 0), 0);
  const totalCut   = Object.values(cuttingQty).reduce((a, b) => a + (b || 0), 0);

  // Standard measurement specs
  const measurementRows = [
    { label: 'SHOULDER',        specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
    { label: 'CHEST',           specs: { S: '18 3/4', M: '19 3/4', L: '20 3/4', XL: '21 3/4', '2XL': '22 3/4', '3XL': '23 3/4', '4XL': '24 3/4' } },
    { label: 'BODY LENGTH',     specs: { S: '27', M: '28', L: '28 1/2', XL: '29', '2XL': '29 1/2', '3XL': '30', '4XL': '30 1/2' } },
    { label: 'ARMHOLE',         specs: { S: '8', M: '8 1/2', L: '8 3/4', XL: '9 1/4', '2XL': '9 1/2', '3XL': '9 3/4', '4XL': '9 3/4' } },
    { label: 'BACK NECK WIDTH', specs: { S: '7', M: '7 1/4', L: '7 1/2', XL: '7 1/2', '2XL': '7 3/4', '3XL': '8', '4XL': '8' } },
    { label: 'SLEEV LENGTH',    specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
    { label: 'SLEEVE OPEN',     specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
  ];

  return (
    <div className="report-view-wrapper">
      <div className="no-print header-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <button
          className="btn btn-primary"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
        >
          {isDownloading ? (
            <><Loader2 size={18} className="spin" /> Generating...</>
          ) : (
            <><Download size={18} /> Download PDF</>
          )}
        </button>
      </div>

      <div className="report-scroll-container">
        <div id="single-report-capture" className="qc-report-paper">

          {/* ── Header ── */}
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
              <div style={{ fontWeight: '900', fontSize: '13pt', marginTop: '2px', color: '#000' }}>
                PO NO : {report.po}
              </div>
            </div>
            <div className="units-top-right" style={{ flex: 1.8, minWidth: '152px' }}>
              <table className="size-qty-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ fontSize: '7pt', background: '#f0f0f0' }}>
                    <th style={{ border: '1px solid black', width: '38px' }}>Size</th>
                    <th style={{ border: '1px solid black', width: '38px' }}>Order</th>
                    <th style={{ border: '1px solid black', width: '38px' }}>Cut</th>
                    <th style={{ border: '1px solid black', width: '38px' }}>Insp</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(s => (
                    <tr key={s} style={{ fontSize: '8pt', height: '16px', textAlign: 'center' }}>
                      <td style={{ border: '1px solid black', fontWeight: 'bold', background: '#f9f9f9' }}>{s}</td>
                      <td style={{ border: '1px solid black' }}>{orderQty[s] || ''}</td>
                      <td style={{ border: '1px solid black' }}>{cuttingQty[s] || ''}</td>
                      <td style={{ border: '1px solid black', fontWeight: 'bold' }}>{inspQty[s] || ''}</td>
                    </tr>
                  ))}
                  <tr style={{ fontSize: '8pt', height: '18px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>
                    <td style={{ border: '1px solid black' }}>TOTAL</td>
                    <td style={{ border: '1px solid black' }}>{totalOrder || ''}</td>
                    <td style={{ border: '1px solid black' }}>{totalCut || ''}</td>
                    <td style={{ border: '1px solid black' }}>{totalInsp}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: 'flex', border: '1px solid black', borderTop: 'none' }}>
                <div style={{ flex: 1, borderRight: '1px solid black', padding: '2px', fontSize: '8pt', fontWeight: 'bold' }}>UNIT: HA</div>
                <div style={{ flex: 1, padding: '2px', fontSize: '8pt', fontWeight: 'bold' }}>QC: GANESH</div>
              </div>
            </div>
          </div>

          {/* ── Checklist ── */}
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

          {/* ── Summary bar removed from here ── */}


          {/* ── PO Bar ── */}
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
              <div className="stat" style={{ fontSize: '10pt', background: '#f8fafc', fontWeight: 'bold' }}>TOTAL : {totalInsp}</div>
              <div className="stat">TOTAL BOX</div>
            </div>
          </div>

          {/* ── Measurement Table: spec value + blank write-in box per size ── */}
          <div className="measurement-area">
            <table className="measurement-table-exact">
              <thead>
                <tr>
                  <th className="ls-col"></th>
                  {sizes.map(s => (
                    <React.Fragment key={s}>
                      <th>{s}</th>
                      <th className="meas-writein-hdr"></th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measurementRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="point-label">{row.label}</td>
                    {sizes.map(s => (
                      <React.Fragment key={s}>
                        <td>{row.specs[s]}</td>
                        <td className="meas-writein-box"></td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
                {/* blank spacer row */}
                <tr style={{ height: '18px' }}>
                  <td colSpan="15"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Remarks ── */}
          <div className="remarks-area-exact">
            <div className="label">Remarks</div>
            <div className="value"></div>
          </div>

          {/* ── Signature ── */}
          <div className="signature-area-exact">
            <div className="sign-box">UNIT INCHARGE</div>
            <div className="sign-box">MD</div>
            <div className="sign-box">INSPECTION Q.A</div>
          </div>

          <div style={{
            position: 'absolute', bottom: '5px', right: '10px',
            fontSize: '8pt', color: '#94a3b8', fontWeight: 'bold', opacity: 0.5
          }}>TEXTRACK</div>

        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
