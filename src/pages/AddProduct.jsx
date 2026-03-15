

import { useState } from 'react';
import '../styles/addproduct.css';

export default function AddProduct() {
  const [product, setProduct] = useState({
    type: '',
    id: '',
    unit: 'meter',
    price: ''
  });
  const [successMessage, setSuccessMessage] = useState(''); // Added state for success message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur(); // Optional: blur to prevent further scroll interaction
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: product.type,
          product_id: product.id,
          unit: product.unit,
          price: parseFloat(product.price)
        })
      });

      if (response.ok) {
        setSuccessMessage('✅ Product successfully added to the database!'); // Updated success message
        setProduct({ type: '', id: '', unit: 'meter', price: '' });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert('❌ Submission failed: ' + errorData.error);
      }
    } catch (err) {
      console.error('❌ Error submitting product:', err);
      alert('❌ Something went wrong while submitting.');
    }
  };

  return (
    <div className="add-product-wrapper">
      <div className="add-product-container">
        <div className="add-product-card">
          <h2 className="add-product-title">Add Product</h2>
          {successMessage && (
            <div className="success-message" style={{
              color: '#28a745',
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              {successMessage}
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