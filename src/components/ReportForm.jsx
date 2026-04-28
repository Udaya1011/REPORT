import React, { useState } from 'react';
import { X, Calendar, Hash, Tag, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

const ReportForm = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    date: new Date().toISOString().split('T')[0],
    po: '',
    productCode: '',
    quantities: { S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0 },
    finish: 'Standard',
    unitName: 'Main Unit',
    qamName: 'Admin'
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
    onSubmit({ ...formData, id: Date.now().toString() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-container" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>Create New QC Report</h2>
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
              <div className="form-group">
                <label className="form-label">PO Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. PO-2024-001"
                  value={formData.po}
                  onChange={e => setFormData({...formData, po: e.target.value})}
                />
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

              <div className="form-group">
                <label className="form-label">Finish / Washing</label>
                <select 
                  className="form-select"
                  value={formData.finish}
                  onChange={e => setFormData({...formData, finish: e.target.value})}
                >
                  <option value="Standard">Standard Finish</option>
                  <option value="Bio-Wash">Bio-Wash</option>
                  <option value="Silicon Wash">Silicon Wash</option>
                  <option value="Enzyme Wash">Enzyme Wash</option>
                </select>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  disabled={!formData.po || !formData.productCode}
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
                  Generate Report <CheckCircle2 size={18} />
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
