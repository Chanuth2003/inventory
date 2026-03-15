




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Production.css'; // Assume a CSS file for styling

function Production() {
  const [code, setCode] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]); // List of raw materials from backend
  const [rows, setRows] = useState([{ raw_material_id: '', weight: 0, price: 0 }]); // Start with 1 row
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch raw materials from backend
  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/raw-materials');
        setRawMaterials(response.data);
      } catch (err) {
        console.error('Error fetching raw materials:', err);
        setError('Failed to fetch raw materials');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
        weight: row.weight,
        price: row.price,
      })),
    };

    try {
      await axios.post('http://localhost:5000/api/production', productionData);
      setSuccess('Production saved and inventory updated successfully!');
      setCode('');
      setRows([{ raw_material_id: '', weight: 0, price: 0 }]); // Reset to 1 row after success
      setTotalWeight(0);
      setTotalPrice(0);
    } catch (err) {
      console.error('Error saving production:', err);
      setError(err.response?.data?.error || 'Failed to save production and update inventory.');
    }
  };

  return (
    <div className="production-container">
      <h2>Production</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="code">Code (e.g., A-150):</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
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
                <td>{row.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="add-row-button"
          onClick={addRow}
        >
          Add Row
        </button>
        <div className="totals">
          <p>Total Weight: {totalWeight.toFixed(2)} kg</p>
          <p>Total Price: Rs. {totalPrice.toFixed(2)}</p>
        </div>
        <button type="submit" className="submit-button">Save Production</button>
      </form>
    </div>
  );
}

export default Production;