import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/ProductionOut.css';

function ProductionOut() {
  const [formData, setFormData] = useState({
    date: '',
    batchCode: '',
    quantity: '',
  });
  const [productionCodes, setProductionCodes] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProductionCodes = async () => {
      try {
        const response = await api.get('/api/production-codes');
        setProductionCodes(response.data);
      } catch (err) {
        console.error('Error fetching production codes:', err);
        setError('Failed to fetch production codes');
      }
    };

    fetchProductionCodes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur(); // Optional: blur to prevent further scroll interaction
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.batchCode || !formData.quantity) {
      setError('Please fill in all fields.');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (quantity <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    try {
      await api.post('/api/production-out', {
        date: formData.date,
        batchCode: formData.batchCode,
        quantity,
      });
      setSuccess('Production output recorded and inventory updated successfully!');
      setFormData({ date: '', batchCode: '', quantity: '' });
    } catch (err) {
      console.error('Error recording production out:', err);
      setError(err.response?.data?.error || 'Failed to record production output.');
    }
  };

  return (
    <div className="production-out">
      <h2>Production Output</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="production-out-form">
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="batchCode">Batch Code:</label>
          <select
            id="batchCode"
            name="batchCode"
            value={formData.batchCode}
            onChange={handleChange}
            required
          >
            <option value="">Select Batch Code</option>
            {productionCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity (kg):</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            onWheel={handleWheel}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="submit-button">Submit Output</button>
      </form>
    </div>
  );
}

export default ProductionOut;