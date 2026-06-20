import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/addrawmaterial.css';

function AddRawMaterial() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    quantity: '',
    unitPrice: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingNames, setExistingNames] = useState([]);

  // Fetch existing raw material names
  useEffect(() => {
    const fetchExistingNames = async () => {
      try {
        const response = await api.get('/api/raw-materials');
        setExistingNames(response.data.map(material => material.name.toLowerCase()));
      } catch (err) {
        console.error('Error fetching raw materials:', err);
        setError('Failed to load existing raw materials');
      }
    };

    fetchExistingNames();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const nameLower = formData.name.toLowerCase().trim();
    if (existingNames.includes(nameLower)) {
      setError('A raw material with this name already exists.');
      return;
    }

    const rawMaterialData = {
      raw_material_id: `RM${Date.now()}`,
      name: formData.name.trim(),
      unit: 'kg',
      unit_price: parseFloat(formData.unitPrice) || 0,
    };

    const inventoryData = {
      date: formData.date,
      raw_material_id: rawMaterialData.raw_material_id,
      quantity: parseFloat(formData.quantity) || 0,
      unit: 'kg',
    };

    try {
      // Add to rawmaterials table
      await api.post('/api/raw-materials', rawMaterialData);
      
      // Add to raw_material_inventory
      await api.post('/api/raw-material-inventory', inventoryData);

      setSuccess('Raw material and inventory added successfully!');
      
      // Reset form
      setFormData({ name: '', date: '', quantity: '', unitPrice: '' });
      
      // Update existing names list
      setExistingNames([...existingNames, nameLower]);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving raw material:', err);
      setError(err.response?.data?.error || 'Failed to save raw material. Please try again.');
    }
  };

  return (
    <div className="add-raw-material-wrapper">
      <div className="add-raw-material-container">
        <div className="add-raw-material-card">
          <h2 className="add-raw-material-title">Add Raw Material</h2>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="add-raw-material-form">
            <div className="form-group">
              <label htmlFor="name">Raw Material Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter material name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
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
              <label htmlFor="quantity">Quantity (kg)</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onWheel={handleWheel}
                step="0.01"
                min="0"
                required
                placeholder="Enter quantity"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unitPrice">Price per kg (Rs.)</label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                onWheel={handleWheel}
                step="0.01"
                min="0"
                required
                placeholder="Enter price per kg"
              />
            </div>

            <button type="submit" className="submit-btn">
              Add Raw Material
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRawMaterial;