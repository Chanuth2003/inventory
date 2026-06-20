import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/Production.css';

function Production() {
  const [code, setCode] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  const [rows, setRows] = useState([{ raw_material_id: '', weight: 0, price: 0 }]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch raw materials
  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const response = await api.get('/api/raw-materials');
        setRawMaterials(response.data || []);
      } catch (err) {
        console.error('Error fetching raw materials:', err);
        setError('Failed to load raw materials. Please login again.');
      }
    };

    fetchRawMaterials();
  }, []);

  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };

    if (field === 'raw_material_id' || field === 'weight') {
      const selected = rawMaterials.find(m => m.raw_material_id === updatedRows[index].raw_material_id);
      if (selected && updatedRows[index].weight > 0) {
        updatedRows[index].price = (updatedRows[index].weight * selected.unit_price) || 0;
      } else {
        updatedRows[index].price = 0;
      }
    }

    setRows(updatedRows);

    const newTotalWeight = updatedRows.reduce((sum, row) => sum + (parseFloat(row.weight) || 0), 0);
    const newTotalPrice = updatedRows.reduce((sum, row) => sum + (row.price || 0), 0);

    setTotalWeight(newTotalWeight);
    setTotalPrice(newTotalPrice);
  };

  const addRow = () => {
    setRows([...rows, { raw_material_id: '', weight: 0, price: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const usedMaterials = rows.filter(row => row.raw_material_id && row.weight > 0);

    if (usedMaterials.length === 0) {
      setError('Please add at least one raw material with weight > 0');
      setLoading(false);
      return;
    }

    const productionData = {
      code,
      total_weight: totalWeight,
      total_price: totalPrice,
      raw_materials: usedMaterials.map(row => ({
        raw_material_id: row.raw_material_id,
        weight: parseFloat(row.weight),
        price: parseFloat(row.price),
      })),
    };

    try {
      await api.post('/api/production', productionData);
      setSuccess('Production saved successfully!');
      
      // Reset form
      setCode('');
      setRows([{ raw_material_id: '', weight: 0, price: 0 }]);
      setTotalWeight(0);
      setTotalPrice(0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save production');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="production-container">
      <h2>Production Entry</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Production Code (e.g., A-150)</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Enter production code"
          />
        </div>

        <table className="raw-materials-table">
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
                  />
                </td>
                <td>{row.price ? row.price.toFixed(2) : '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="add-row-button" onClick={addRow}>
          + Add Row
        </button>

        <div className="totals">
          <p><strong>Total Weight:</strong> {totalWeight.toFixed(2)} kg</p>
          <p><strong>Total Price:</strong> Rs. {totalPrice.toFixed(2)}</p>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Saving...' : 'Save Production'}
        </button>
      </form>
    </div>
  );
}

export default Production;