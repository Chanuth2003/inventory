import React, { useState } from 'react';
import api from '../utils/api';
import '../styles/addproduct.css';

export default function AddProduct() {
  const [product, setProduct] = useState({
    type: '',
    id: '',
    unit: 'meter',
    price: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/add-product', {
        type: product.type,
        product_id: product.id,
        unit: product.unit,
        price: parseFloat(product.price)
      });

      if (response.status === 201) {
        setSuccessMessage('✅ Product successfully added!');
        setProduct({ type: '', id: '', unit: 'meter', price: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.error || 'Failed to add product. Please try again.');
    }
  };

  return (
    <div className="add-product-wrapper">
      <div className="add-product-container">
        <div className="add-product-card">
          <h2 className="add-product-title">Add Product</h2>

          {successMessage && (
            <div className="success-message" style={{ color: '#28a745', textAlign: 'center', marginBottom: '20px' }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-product-form">
            <div className="form-group">
              <label htmlFor="type">Product Type</label>
              <input
                id="type"
                name="type"
                type="text"
                value={product.type}
                onChange={handleChange}
                placeholder="e.g. Rubber Beading"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="id">Product ID</label>
              <input
                id="id"
                name="id"
                type="text"
                value={product.id}
                onChange={handleChange}
                placeholder="e.g. RB1001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={product.unit}
                onChange={handleChange}
                required
              >
                <option value="meter">1 Meter</option>
                <option value="piece">Piece</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Selling Price (per unit)</label>
              <input
                id="price"
                name="price"
                type="number"
                value={product.price}
                onChange={handleChange}
                onWheel={handleWheel}
                placeholder="e.g. 500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <button type="submit" className="submit-btn">
              Add Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}