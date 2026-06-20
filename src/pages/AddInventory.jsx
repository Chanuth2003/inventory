import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/addinventory.css';

export default function AddInventory() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({
    date: '',
    product_id: '',
    product_type: '',
    quantity: '',
    unit: 'meter'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch product list
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please login again.');
      }
    };
    fetchProducts();
  }, []);

  // Auto-fill product type and unit when product is selected
  useEffect(() => {
    const selected = products.find(p => p.product_id === inventory.product_id);
    if (selected) {
      setInventory(prev => ({
        ...prev,
        product_type: selected.type || '',
        unit: selected.unit || 'meter'
      }));
    }
  }, [inventory.product_id, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInventory(prev => ({ ...prev, [name]: value }));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!inventory.product_id || !inventory.date || !inventory.quantity) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await api.post('/add-inventory', {
        date: inventory.date,
        product_id: inventory.product_id,
        quantity: parseInt(inventory.quantity),
        unit: inventory.unit
      });

      if (response.status === 201) {
        setSuccessMessage('✅ Inventory successfully added!');
        setInventory({
          date: '',
          product_id: '',
          product_type: '',
          quantity: '',
          unit: 'meter'
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding inventory:', err);
      setError(err.response?.data?.error || 'Failed to add inventory');
    }
  };

  return (
    <div className="add-inventory-wrapper">
      <div className="add-inventory-container">
        <div className="add-inventory-card">
          <h2 className="add-inventory-title">Add Inventory</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message" style={{ color: '#28a745', textAlign: 'center', marginBottom: '20px' }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-inventory-form">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={inventory.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product_id">Product ID</label>
              <select
                id="product_id"
                name="product_id"
                value={inventory.product_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_id} - {p.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="product_type">Product Type</label>
              <input
                type="text"
                id="product_type"
                name="product_type"
                value={inventory.product_type}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={inventory.unit}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={inventory.quantity}
                onChange={handleChange}
                onWheel={handleWheel}
                placeholder="e.g. 100"
                required
                min="1"
              />
            </div>

            <button type="submit" className="submit-btn">
              Add Inventory
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}