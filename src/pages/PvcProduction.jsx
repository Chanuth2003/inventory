import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PvcProduction.css';

function PvcProduction() {
  const [code, setCode] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  const [rows, setRows] = useState([{ raw_material_id: '', weight: 0, price: 0 }]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch PVC raw materials from backend
  useEffect(() => {
    const fetchRawMaterials = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/pvc-rawmaterials');
        console.log('Fetched PVC raw materials:', response.data);
        setRawMaterials(response.data);
      } catch (err) {
        console.error('Error fetching PVC raw materials:', err);
        setError('Failed to fetch PVC raw materials');
      } finally {
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, []);

  // Update row and recalculate totals
  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };

    // Calculate price if raw_material_id and weight are set
    if (field === 'raw_material_id' || field === 'weight') {
      const selectedMaterial = rawMaterials.find(m => m.raw_material_id === updatedRows[index].raw_material_id);
      if (selectedMaterial && updatedRows[index].weight > 0) {
        updatedRows[index].price = updatedRows[index].weight * selectedMaterial.unit_price;
      } else {
        updatedRows[index].price = 0;
      }
    }

    setRows(updatedRows);

    // Recalculate totals
    const newTotalWeight = updatedRows.reduce((sum, row) => sum + (parseFloat(row.weight) || 0), 0);
    const newTotalPrice = updatedRows.reduce((sum, row) => sum + row.price, 0);
    setTotalWeight(newTotalWeight);
    setTotalPrice(newTotalPrice);
  };

  // Add a new row
  const addRow = () => {
    setRows([...rows, { raw_material_id: '', weight: 0, price: 0 }]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate code
    if (!code.trim()) {
      setError('Production code is required');
      return;
    }

    // Filter out rows with no raw material or zero weight
    const usedMaterials = rows.filter(row => row.raw_material_id && row.weight > 0);

    if (usedMaterials.length === 0) {
      setError('Please select at least one raw material with a weight greater than 0.');
      return;
    }

    const productionData = {
      code,
      total_weight: totalWeight,
      total_price: totalPrice,
      raw_materials: usedMaterials.map(row => ({
        raw_material_id: row.raw_material_id,
        weight: parseFloat(row.weight),
        price: row.price,
      })),
    };

    try {
      await axios.post('http://localhost:5000/api/pvc-production', productionData);
      setSuccess('PVC production saved successfully!');
      setCode('');
      setRows([{ raw_material_id: '', weight: 0, price: 0 }]);
      setTotalWeight(0);
      setTotalPrice(0);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving PVC production:', err);
      setError(err.response?.data?.error || 'Failed to save PVC production.');
    }
  };

  return (
    <div className="raw-materials-inventory pvc-production">
      <h2>PVC Production</h2>
      {loading && <div className="loading-message">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="code">Production Code (e.g., PVC-001):</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter production code"
            required
          />
        </div>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Raw Material</th>
              <th>Weight (kg)</th>
              <th>Price (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={row.raw_material_id}
                    onChange={(e) => updateRow(index, 'raw_material_id', e.target.value)}
                    required
                  >
                    <option value="">Select Raw Material</option>
                    {rawMaterials.map(material => (
                      <option key={material.raw_material_id} value={material.raw_material_id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={row.weight}
                    onChange={(e) => updateRow(index, 'weight', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </td>
                <td>{row.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="inventory-table button add-row-button"
          onClick={addRow}
        >
          Add Row
        </button>
        <div className="totals">
          <p>Total Weight: {totalWeight.toFixed(2)} kg</p>
          <p>Total Price: Rs. {totalPrice.toFixed(2)}</p>
        </div>
        <button type="submit" className="inventory-table button submit-button">
          Save PVC Production
        </button>
      </form>
    </div>
  );
}

export default PvcProduction;