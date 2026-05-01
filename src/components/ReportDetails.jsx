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
    pageWrapper.style.height = '296.5mm';
    pageWrapper.style.position = 'relative';
    pageWrapper.style.overflow = 'hidden';
    pageWrapper.style.background = 'white';
    pageWrapper.style.pageBreakAfter = 'always';

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
    if (!year || !month || !day) return dateStr;
    return `${day}-${month}-${year}`;
  };

  // Support old (quantities only) and new (orderQty + cuttingQty + quantities) data shapes
  const orderQty = report.orderQty || {};
  const cuttingQty = report.cuttingQty || {};
  const inspQty = report.quantities || {};
  const totalInsp = Object.values(inspQty).reduce((a, b) => a + (b || 0), 0);
  const totalOrder = Object.values(orderQty).reduce((a, b) => a + (b || 0), 0);
  const totalCut = Object.values(cuttingQty).reduce((a, b) => a + (b || 0), 0);

  // Standard measurement specs
  const measurementRows = [
    { label: 'SHOULDER', specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
    { label: 'CHEST', specs: { S: '18 3/4', M: '19 3/4', L: '20 3/4', XL: '21 3/4', '2XL': '22 3/4', '3XL': '23 3/4', '4XL': '24 3/4' } },
    { label: 'BODY LENGTH', specs: { S: '27', M: '28', L: '28 1/2', XL: '29', '2XL': '29 1/2', '3XL': '30', '4XL': '30 1/2' } },
    { label: 'ARMHOLE', specs: { S: '8', M: '8 1/2', L: '8 3/4', XL: '9 1/4', '2XL': '9 1/2', '3XL': '9 3/4', '4XL': '9 3/4' } },
    { label: 'BACK NECK WIDTH', specs: { S: '7', M: '7 1/4', L: '7 1/2', XL: '7 1/2', '2XL': '7 3/4', '3XL': '8', '4XL': '8' } },
    { label: 'SLEEV LENGTH', specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
    { label: 'SLEEVE OPEN', specs: { S: '', M: '', L: '', XL: '', '2XL': '', '3XL': '', '4XL': '' } },
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
            <div className="logo-section" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '8px', padding: '5px' }}>
              <div className="brand-logo-exact">
                <div className="brand-main-text">MANIAC</div>
                <div className="brand-sub-text">STREETWEAR</div>
              </div>
              <div style={{ fontSize: '9pt', fontWeight: '950', textAlign: 'center', border: '1.5px solid black', width: '100%', padding: '4px 0', background: '#f8fafc', margin: '0' }}>
                QC: {report.qamName?.trim() || 'GANESH'}
              </div>
            </div>
            <div className="title-section" style={{ flex: 4, borderRight: '1.5px solid black' }}>
              <div className="company-name-exact">FRISKE KNITS PRIVATE LIMITED</div>
              <div className="report-type-exact">FINAL INSPECTION REPORT</div>
            </div>
            <div className="metadata-section" style={{ flex: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
              <div className="brand-logo-exact" style={{ width: '100%', minHeight: '60px', padding: '5px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="brand-main-text" style={{ fontSize: '20pt' }}>{report.unitName?.trim() || 'HA'}</div>
                <div style={{ fontSize: '12pt', fontWeight: '950', borderTop: '2px solid black', width: '100%', marginTop: '5px', paddingTop: '3px', textAlign: 'center' }}>PO: {report.po}</div>
              </div>
            </div>
          </div>

          {/* ── Checklist ── */}
          <div style={{ display: 'flex', borderBottom: '2px solid black' }}>
            <table className="checklist-table-exact" style={{ flex: 1, borderBottom: 'none' }}>
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
            <div style={{ width: '30%', borderLeft: '2px solid black' }}>
              <table className="size-qty-table" style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ fontSize: '8pt', background: '#f0f0f0', fontWeight: '900', height: '30px' }}>
                    <th style={{ borderBottom: '1px solid black', borderRight: '1px solid black', width: '35px' }}>Size</th>
                    <th style={{ borderBottom: '1px solid black', borderRight: '1px solid black', width: '35px' }}>ORD QTY</th>
                    <th style={{ borderBottom: '1px solid black', borderRight: '1px solid black', width: '35px' }}>CUT QTY</th>
                    <th style={{ borderBottom: '1px solid black', width: '35px' }}>INSP QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map(s => (
                    <tr key={s} style={{ fontSize: '13pt', height: '30px', textAlign: 'center' }}>
                      <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', fontWeight: '950', background: '#f9f9f9' }}>{s}</td>
                      <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', fontWeight: 'bold' }}>{orderQty[s] || ''}</td>
                      <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', fontWeight: 'bold' }}>{cuttingQty[s] || ''}</td>
                      <td style={{ borderBottom: '1px solid black', fontWeight: '950' }}>{inspQty[s] || ''}</td>
                    </tr>
                  ))}
                  <tr style={{ fontSize: '13pt', height: '30px', textAlign: 'center', fontWeight: '950', background: '#e0e0e0' }}>
                    <td style={{ borderRight: '1px solid black' }}>TOTAL</td>
                    <td style={{ borderRight: '1px solid black' }}>{totalOrder || ''}</td>
                    <td style={{ borderRight: '1px solid black' }}>{totalCut || ''}</td>
                    <td>{totalInsp}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
                    <th key={s} colSpan="2">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measurementRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="point-label">{row.label}</td>
                    {sizes.map(s => (
                      <React.Fragment key={s}>
                        <td style={{ borderRight: 'none' }}>{row.specs[s]}</td>
                        <td className="meas-writein-box" style={{ borderLeft: 'none' }}></td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
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

          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#000', fontWeight: '950', marginTop: '2px' }}>
            TEXTRACK
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
