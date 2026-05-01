import React, { useState } from 'react';
import { X, Calendar, Hash, Tag, CheckCircle2, ChevronRight, ChevronLeft, Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

const ReportForm = ({ onClose, onSubmit, report = null }) => {
  const [step, setStep] = useState(1);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [poPrefix, setPoPrefix] = useState(() => {
    if (report && report.po) {
      const match = report.po.match(/(HA[_\-]\d{2}[\-\_]\d{2}[_\-])/i);
      return match ? match[1].toUpperCase() : 'HA_25-26_';
    }
    return 'HA_25-26_';
  });
  const [poSuffix, setPoSuffix] = useState(() => {
    if (report && report.po) {
      const match = report.po.match(/(?:HA[_\-]\d{2}[\-\_]\d{2}[_\-])(\d+)/i);
      return match ? match[1] : report.po.split('_').pop();
    }
    return '';
  });
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  React.useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Camera access denied. Please check your browser permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    stopCamera();
    
    canvas.toBlob(blob => {
      runOCR(blob);
    }, 'image/jpeg');
  };

  const runOCR = async (imageSource) => {
    setIsScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(imageSource, 'eng');
      console.log('OCR Extracted:', text);
      
      let foundProduct = false;
      let foundPo = false;

      // Match everything until the end of the line to ensure the FULL name is captured without getting cut off by spaces
      const productMatch = text.match(/(?:Product|Code|roduct|Cade)[^\n:]*[:;\s]+([^\n]+)/i);
      if (productMatch && productMatch[1]) {
        setFormData(prev => ({...prev, productCode: productMatch[1].trim().toUpperCase()}));
        foundProduct = true;
      }

      // Look directly for the HA pattern anywhere (e.g. HA_23-24_678 or HA-23-24-678)
      const poMatch = text.match(/(HA[_\-]\d{2}[\-\_]\d{2}[_\-])(\d+)/i);
      if (poMatch && poMatch[1] && poMatch[2]) {
        const prefix = poMatch[1].replace(/-/g, '_').toUpperCase();
        setPoPrefix(prefix);
        setPoSuffix(poMatch[2]);
        foundPo = true;
      }
      
      if (foundProduct || foundPo) {
        alert(`Scan Complete!\nFound Product Code: ${foundProduct ? 'Yes' : 'No'}\nFound PO: ${foundPo ? 'Yes' : 'No'}`);
      } else {
        alert("Couldn't find the PO or Product Code. The photo might be blurry.\n\nExtracted Text:\n" + text.substring(0, 80) + '...');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to extract text. Please enter manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const [formData, setFormData] = useState({
    brand: report?.brand || '',
    date: report?.date || todayStr,
    po: report?.po || '',
    productCode: report?.productCode || '',
    quantities: report?.quantities || { S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0 },
    unitName: report?.unitName || 'HA',
    qamName: report?.qamName || 'GANESH'
  });

  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  const handleQtyChange = (size, val) => {
    setFormData({
      ...formData,
      quantities: {
        ...formData.quantities,
        [size]: parseInt(val) || 0
      }
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPO = `${poPrefix}${poSuffix}`;
    onSubmit({ ...formData, po: finalPO, status: 'PASS' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-container" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>{report ? 'Edit QC Report' : 'Create New QC Report'}</h2>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        <div className="form-body">
          <div className="form-step-indicator">
            {[1, 2, 3].map(i => (
              <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Brand & Basic Info */}
            <div className={`form-section ${step === 1 ? 'active' : ''}`}>
              <div className="form-group">
                <label className="form-label">Select Brand</label>
                <div className="brand-selector">
                  <div 
                    className={`brand-option ${formData.brand === 'MANIAC' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, brand: 'MANIAC'})}
                  >
                    <div style={{fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px'}}>MANIAC</div>
                    <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Premium Casuals</span>
                  </div>
                  <div 
                    className={`brand-option ${formData.brand === 'JC' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, brand: 'JC'})}
                  >
                    <div style={{fontWeight: 800, fontSize: '1.2rem', color: '#ef4444'}}>JC</div>
                    <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Jumpcuts Original</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inspection Date</label>
                <div style={{position: 'relative'}}>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label className="form-label">Unit Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.unitName}
                    onChange={e => setFormData({...formData, unitName: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label className="form-label">QC Personnel</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.qamName}
                    onChange={e => setFormData({...formData, qamName: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '2rem'}}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  disabled={!formData.brand}
                  onClick={nextStep}
                >
                  Next Details <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Step 2: PO & Product Details */}
            <div className={`form-section ${step === 2 ? 'active' : ''}`}>
              {showCamera ? (
                <div style={{marginBottom: '1.5rem', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative'}}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{width: '100%', height: 'auto', display: 'block'}} 
                  />
                  <div style={{position: 'absolute', bottom: '15px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '15px'}}>
                    <button type="button" onClick={stopCamera} className="btn btn-secondary" style={{background: 'white', color: 'black'}}>Cancel</button>
                    <button type="button" onClick={capturePhoto} className="btn btn-primary" style={{background: 'var(--accent)', borderColor: 'var(--accent)'}}>
                      <Camera size={18} /> Capture
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', textAlign: 'center'}}>
                  <button type="button" onClick={startCamera} className="btn btn-secondary" style={{width: '100%', justifyContent: 'center', cursor: 'pointer', background: 'white'}}>
                    {isScanning ? <><Loader2 size={18} className="spin" /> Scanning Tag...</> : <><Camera size={18} /> Scan Tag with Camera</>}
                  </button>
                  <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Automatically extract PO and Product Code</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">PO Number</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <select 
                    className="form-select"
                    style={{width: 'auto', flex: '0 0 auto', background: 'var(--surface)', fontWeight: 'bold'}}
                    value={poPrefix}
                    onChange={e => setPoPrefix(e.target.value)}
                  >
                    <option value="HA_25-26_">HA_25-26_</option>
                    <option value="HA_26-27_">HA_26-27_</option>
                    {!['HA_25-26_', 'HA_26-27_'].includes(poPrefix) && <option value={poPrefix}>{poPrefix}</option>}
                  </select>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{flex: 1}}
                    placeholder="Enter PO digit (e.g. 001)"
                    value={poSuffix}
                    onChange={e => setPoSuffix(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Name / Brand Style</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Oversized T-Shirt"
                  value={formData.productCode}
                  onChange={e => setFormData({...formData, productCode: e.target.value})}
                />
              </div>


              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  disabled={!poSuffix || !formData.productCode}
                  onClick={nextStep}
                >
                  Quantities <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Step 3: Quantities */}
            <div className={`form-section ${step === 3 ? 'active' : ''}`}>
              <label className="form-label" style={{marginBottom: '1rem'}}>Enter Size Quantities (Total)</label>
              <div className="qty-grid">
                {sizes.map(size => (
                  <div key={size} className="qty-input-group">
                    <span className="qty-label">{size}</span>
                    <input 
                      type="number" 
                      className="qty-input" 
                      placeholder="0"
                      value={formData.quantities[size]}
                      onChange={e => handleQtyChange(size, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div style={{marginTop: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700}}>
                  <span>Total Quantity:</span>
                  <span style={{color: 'var(--accent)'}}>
                    {Object.values(formData.quantities).reduce((a, b) => a + b, 0)} Pcs
                  </span>
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  <ChevronLeft size={18} /> Back
                </button>
                <button type="submit" className="btn btn-primary" style={{background: 'var(--success)'}}>
                  {report ? 'Update Report' : 'Generate Report'} <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
