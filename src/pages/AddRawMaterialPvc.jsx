import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AddRawMaterialPvc.css'; // This will contain the provided CSS

function AddRawMaterialPvc() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    quantity: '',
    unitPrice: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingNames, setExistingNames] = useState([]);

  useEffect(() => {
    const fetchExistingNames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pvc-rawmaterials');
        setExistingNames(response.data.map(material => material.name.toLowerCase()));
      } catch (err) {
        console.error('Error fetching PVC raw materials:', err);
        setError('Failed to load existing PVC raw materials');
      }
    };

    fetchExistingNames();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Check if raw material name already exists
    const nameLower = formData.name.toLowerCase().trim();
    if (existingNames.includes(nameLower)) {
      setError('A PVC raw material with this name already exists.');
      return;
    }

    // Validate inputs
    if (!formData.name.trim()) {
      setError('Raw material name is required.');
      return;
    }
    if (!formData.date) {
      setError('Date is required.');
      return;
    }
    if (parseFloat(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }
    if (parseFloat(formData.unitPrice) < 0) {
      setError('Unit price cannot be negative.');
      return;
    }

    // Generate unique raw_material_id (PVC-RM prefix for PVC materials)
    const rawMaterialId = `PVC-RM${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const rawMaterialData = {
      raw_material_id: rawMaterialId,
      name: formData.name.trim(),
      unit: 'kg',
      unit_price: parseFloat(formData.unitPrice) || 0,
    };

    const inventoryData = {
      date: formData.date,
      raw_material_id: rawMaterialId,
      quantity: parseFloat(formData.quantity) || 0,
      unit: 'kg',
    };

    try {
      // First, insert into pvc_rawmaterials table
      const rawMaterialResponse = await axios.post(
        'http://localhost:5000/api/pvc-rawmaterials', 
        rawMaterialData
      );
      
      if (rawMaterialResponse.status === 201) {
        // Then, insert into pvc_raw_material_inventory table
        const inventoryResponse = await axios.post(
          'http://localhost:5000/api/pvc-raw-material-inventory', 
          inventoryData
        );
        
        if (inventoryResponse.status === 201) {
          setSuccess('PVC raw material and inventory entry added successfully!');
          setFormData({ name: '', date: '', quantity: '', unitPrice: '' });
          setExistingNames([...existingNames, nameLower]);
          
          // Reset error if any
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error saving PVC raw material:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to save PVC raw material. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="add-raw-material-wrapper">
      <div className="add-raw-material-container">
        <div className="add-raw-material-card">
          <h2 className="add-raw-material-title">Add PVC Raw Material</h2>
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
                min="0.01"
                required
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
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Add PVC Raw Material
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRawMaterialPvc;