import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

const ReportDetails = ({ report, onBack }) => {
  if (!report) return null;

  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  const totalQty = Object.values(report.quantities).reduce((a, b) => a + b, 0);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="report-view-wrapper">
      <div className="no-print header-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={18} /> Print Final Report
        </button>
      </div>

      <div className="report-scroll-container">
        <div className="qc-report-paper">
          {/* Main Top Header */}
          <div className="header-grid">
            <div className="logo-section">
               <div className="brand-logo-exact">MANIAC</div>
            </div>
            <div className="title-section">
               <div className="company-name-exact">FRISKE KNITS PRIVATE LIMITED</div>
               <div className="report-type-exact">FINAL INSPECTION REPORT</div>
               <div style={{fontWeight: '900', fontSize: '16pt', marginTop: '5px', color: '#000'}}>PO NO : {report.po}</div>
            </div>
            <div className="units-top-right">
               <div className="unit-box-exact">UNIT NAME: HA</div>
               <div className="unit-box-exact">QC NAME: GANESH</div>
            </div>
          </div>

          {/* New Summary Bar (Content moved DOWN) */}
          <div className="summary-bar-exact">
             <table className="summary-table-exact">
               <thead>
                 <tr>
                   <th>Size</th>
                   {sizes.map(s => <th key={s}>{s}</th>)}
                   <th>TOTAL</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td>INSP QTY</td>
                   {sizes.map(s => <td key={s} className="insp-qty-val">{report.quantities[s]}</td>)}
                   <td className="insp-qty-total">{totalQty}</td>
                 </tr>
               </tbody>
             </table>
          </div>

          {/* Checklist Area */}
          <div className="checklist-grid-slim">
            {/* Column 1: Meta */}
            <div className="meta-column">
               <div className="meta-box"><span className="label">DATE</span><span className="value">{formatDate(report.date)}</span></div>
               <div className="meta-box"><span className="label">BRAND</span><span className="value">{report.brand}</span></div>
               <div className="meta-box-half">
                  <div className="label">MAIN LABLE</div>
                  <div className="opts"><span>Okay</span><span>Not Okay</span></div>
               </div>
               <div className="meta-box-half">
                  <div className="label">FLOGE LABLE</div>
                  <div className="opts"><span>Okay</span><span>Not Okay</span></div>
               </div>
               <div className="meta-box-tag">
                  <div className="label">HANG TAG</div>
                  <div className="opts"><span>Okay</span><span>Not Okay</span></div>
               </div>
            </div>

            {/* Column 2: Checks 1 */}
            <div className="checks-column">
               <div className="check-box"><div className="label">BARCODE</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">PRINT POSITION</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">WASHING QUALITY</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">TITCHIN</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">SPI</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
            </div>

            {/* Column 3: Checks 2 */}
            <div className="checks-column">
               <div className="check-box"><div className="label">W / CARE LABLE</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">GSM</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">IRONING-PACKING</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">POLY BAG</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
               <div className="check-box"><div className="label">FABRIC</div><div className="opts"><span>Okay</span><span>Not Okay</span></div></div>
            </div>
          </div>

          {/* PO BAR */}
          <div className="po-bar-exact">
            <div className="po-no-box">
               <div className="label">PO NO</div>
               <div className="value">{report.po}</div>
            </div>
            <div className="product-code-box">
               <div className="label">PRODUCT CODE</div>
               <div className="value">{report.productCode}</div>
            </div>
            <div className="status-labels">
               <div className="stat">PASS</div>
               <div className="stat">FAIL</div>
               <div className="stat" style={{fontSize: '10pt', background: '#f8fafc', fontWeight: 'bold'}}>TOTAL : {totalQty}</div>
               <div className="stat">TOTAL BOX</div>
            </div>
          </div>

          {/* Measurement Table */}
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
                 <tr>
                    <td className="point-label">CHEST</td>
                    <td>18 3/4</td><td>19 3/4</td><td>20 3/4</td><td>21 3/4</td><td>22 3/4</td><td>23 3/4</td><td>24 3/4</td>
                 </tr>
                 <tr>
                    <td className="point-label">BODY LENGTH</td>
                    <td>27</td><td>28</td><td>28 1/2</td><td>29</td><td>29 1/2</td><td>30</td><td>30 1/2</td>
                 </tr>
                 <tr>
                    <td className="point-label">ARMHOLE</td>
                    <td>8</td><td>8 1/2</td><td>8 3/4</td><td>9 1/4</td><td>9 1/2</td><td>9 3/4</td><td>9 3/4</td>
                 </tr>
                 <tr>
                    <td className="point-label">BACK NECK WIDTH</td>
                    <td>7</td><td>7 1/4</td><td>7 1/2</td><td>7 1/2</td><td>7 3/4</td><td>8</td><td>8</td>
                 </tr>
                 <tr><td className="point-label">SLEEV LENGTH</td>{sizes.map(s => <td key={s}></td>)}</tr>
                 <tr><td className="point-label">SLEEVE OPEN</td>{sizes.map(s => <td key={s}></td>)}</tr>
                 <tr style={{background: '#f8fafc', fontWeight: 'bold'}}>
                    <td className="point-label">TOTAL</td>
                    {sizes.map(s => <td key={s} style={{fontSize: '11pt'}}>{report.quantities[s]}</td>)}
                 </tr>
               </tbody>
             </table>
          </div>

          {/* Total Pieces Highlight */}
          <div className="total-pieces-footer">
             <div className="total-label">TOTAL PIECE</div>
             <div className="total-value">{totalQty} PIECES</div>
          </div>

          {/* Remarks */}
          <div className="remarks-area-exact">
            <div className="label">Remarks</div>
            <div className="value">Garment construction and measurements are within specified tolerance levels. Quality approved.</div>
          </div>

          {/* Footer Signatures */}
          <div className="signature-area-exact">
             <div className="sign-box">UNIT INCHARGE</div>
             <div className="sign-box">MD</div>
             <div className="sign-box">INSPECTION Q.A</div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .report-view-wrapper {
          padding: 20px;
          background: #f1f5f9;
        }



        .no-print {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          max-width: 1100px;
          margin-left: auto;
          margin-right: auto;
        }

        .report-scroll-container {
          overflow-x: auto;
          width: 100%;
        }

        .qc-report-paper {
          background: white;
          color: black;
          width: 297mm;
          min-height: 210mm;
          margin: 0 auto;
          border: 2px solid black;
          font-family: 'Arial Narrow', sans-serif;
          position: relative;
          padding: 10mm 5mm 5mm 5mm;
          box-sizing: border-box;
        }

        .header-grid {
          display: flex;
          border-bottom: 1.5px solid black;
        }

        .logo-section {
          flex: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1.5px solid black;
          padding: 10px;
        }

        .brand-logo-exact {
          font-size: 20pt;
          font-weight: 900;
          border: 3px solid black;
          padding: 2px 8px;
          letter-spacing: -1px;
        }

        .title-section {
          flex: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-right: 1.5px solid black;
          text-align: center;
        }

        .company-name-exact {
          font-size: 16pt;
          font-weight: bold;
          font-style: italic;
          margin-bottom: 5px;
        }

        .report-type-exact {
          font-size: 18pt;
          font-weight: bold;
          text-decoration: underline;
          letter-spacing: 1px;
        }

        .units-top-right {
          flex: 2;
          display: flex;
          flex-direction: column;
        }
        .unit-box-exact {
          flex: 1;
          border-bottom: 1px solid black;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 11pt;
          text-align: center;
        }
        .unit-box-exact:last-child { border-bottom: none; }

        .summary-bar-exact {
          border-bottom: 1.5px solid black;
        }
        .summary-table-exact {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
        }
        .summary-table-exact th, .summary-table-exact td {
          border: 1px solid black;
          text-align: center;
          padding: 4px;
          min-width: 50px;
        }
        .summary-table-exact th { background: #f8fafc; font-weight: bold; }

        /* Checklist Grid Slimmed Down */
        .checklist-grid-slim {
          display: flex;
          border-bottom: 1.5px solid black;
          height: auto;
          min-height: 80px;
        }

        .meta-column {
          flex: 1.5;
          display: flex;
          flex-direction: column;
          border-right: 1.5px solid black;
        }

        .meta-box {
          flex: 1;
          display: flex;
          border-bottom: 1px solid black;
          min-height: 20px;
        }
        .meta-box .label { width: 40%; border-right: 1px solid black; padding: 2px; font-weight: bold; font-size: 7.5pt; }
        .meta-box .value { width: 60%; padding: 2px; text-align: center; font-weight: bold; font-size: 9pt; }

        .meta-box-half {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid black;
          min-height: 28px;
        }
        .meta-box-half .label { border-bottom: 1px solid black; padding: 1px; font-size: 7pt; font-weight: bold; text-align: center; }
        .meta-box-half .opts { display: flex; flex: 1; }
        .meta-box-half .opts span { flex: 1; border-right: 1px solid black; font-size: 6.5pt; text-align: center; display: flex; align-items: center; justify-content: center; }
        .meta-box-half .opts span:last-child { border-right: none; }

        .meta-box-tag { flex: 2; display: flex; flex-direction: column; }
        .meta-box-tag .label { border-bottom: 1px solid black; padding: 2px; font-size: 7.5pt; font-weight: bold; text-align: center; }
        .meta-box-tag .opts { display: flex; flex: 1; }
        .meta-box-tag .opts span { flex: 1; border-right: 1px solid black; font-size: 7pt; text-align: center; display: flex; align-items: center; justify-content: center; }
        .meta-box-tag .opts span:last-child { border-right: none; }

        .checks-column {
          flex: 2;
          display: flex;
          flex-direction: column;
          border-right: 1.5px solid black;
        }

        .check-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid black;
          min-height: 18px;
        }
        .check-box:last-child { border-bottom: none; }
        .check-box .label { border-bottom: 1px solid black; padding: 1px; font-size: 7.5pt; font-weight: bold; text-align: center; background: #f8fafc; }
        .check-box .opts { display: flex; flex: 1; }
        .check-box .opts span { flex: 1; border-right: 1px solid black; font-size: 6.5pt; text-align: center; display: flex; align-items: center; justify-content: center; }
        .check-box .opts span:last-child { border-right: none; }

        .checks-column:last-child { border-right: none; }

        /* PO Bar */
        .po-bar-exact {
          display: flex;
          border-bottom: 1.5px solid black;
          background: white;
        }

        .po-no-box, .product-code-box {
          border-right: 1.5px solid black;
          padding: 5px;
          display: flex;
          flex-direction: column;
        }
        .po-no-box { flex: 1.5; }
        .product-code-box { flex: 5; text-align: center; }
        .po-bar-exact .label { font-weight: bold; font-size: 8pt; border-bottom: 1px solid #ddd; margin-bottom: 2px; }
        .po-bar-exact .value { font-weight: bold; font-size: 11pt; }

        .status-labels {
          flex: 3.5;
          display: flex;
        }
        .status-labels .stat {
          flex: 1;
          border-right: 1px solid black;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 8.5pt;
        }
        .status-labels .stat:last-child { border-right: none; }

        /* Measurement Area */
        .measurement-table-exact {
          width: 100%;
          border-collapse: collapse;
        }
        .measurement-table-exact th, .measurement-table-exact td {
          border: 1px solid black;
          padding: 5px;
          text-align: center;
        }
        .measurement-table-exact th { background: white; font-size: 11pt; font-weight: bold; }
        .ls-col { width: 180px; text-align: left !important; }
        .point-label { text-align: left; font-weight: bold; font-size: 9.5pt; }
        
        .qty-row-exact { background: #f8fafc; }
        .qty-row-exact .qty-val { font-weight: 900; font-size: 12pt; }

        .total-pieces-footer {
          display: flex;
          border: 2px solid black;
          border-top: none;
        }
        .total-label { flex: 1; background: black; color: white; padding: 10px; font-weight: bold; font-size: 12pt; }
        .total-value { flex: 4; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16pt; background: #fffbeb; }

        /* Remarks */
        .remarks-area-exact {
          border: 2px solid black;
          border-top: none;
          padding: 8px;
          display: flex;
        }
        .remarks-area-exact .label { width: 100px; font-weight: bold; font-size: 11pt; border-right: 1px solid black; margin-right: 10px; }
        .remarks-area-exact .value { flex: 1; font-size: 11pt; }

        /* Signatures */
        .signature-area-exact {
          display: flex;
          height: 80px;
          border: 2px solid black;
          border-top: 2px solid black;
          margin-top: 5px;
        }
        .sign-box {
          flex: 1;
          border-right: 2px solid black;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 10px;
          font-weight: bold;
          font-size: 9pt;
        }
        .sign-box:last-child { border-right: none; }

        @page {
          size: A4 landscape;
          margin: 0; 
        }

        @media print {
          .no-print { display: none !important; }
          .report-view-wrapper { padding: 0 !important; margin: 0 !important; background: white; height: 210mm; overflow: hidden; }
          .qc-report-paper { 
            margin: 5mm 0 0 0; 
            border: 1px solid black; 
            width: 100%; 
            height: 200mm; /* Fixed height to force single page */
            padding: 0;
            box-shadow: none;
            transform: scale(0.82);
            transform-origin: top center;
            font-size: 8pt;
            break-inside: avoid;
            overflow: hidden; /* Prevent any overflow from creating page 2 */
          }
          .header-grid { height: auto; }
          .checklist-grid-slim { height: auto; min-height: 40px; }
          .meta-box .label, .check-box .label { font-size: 6.5pt; padding: 0px 2px; }
          .meta-box .value { font-size: 8pt; padding: 0px 2px; }
          .po-no-box { flex: 1.5; padding: 1px 4px; }
          .product-code-box { flex: 4; padding: 1px 4px; }
          .status-labels { flex: 4.5; }
          .measurement-table-exact th, .measurement-table-exact td { padding: 0px 2px; font-size: 8pt; }
          .signature-area-exact { height: 60px; margin-top: 5px; border: 1.5px solid black; }
          .total-pieces-footer { display: flex !important; } 
          body { margin: 0; padding: 0; background: white; height: 210mm; overflow: hidden; }
          * { -webkit-print-color-adjust: exact !important; }
        }
      `}} />
    </div>
  );
};

export default ReportDetails;
