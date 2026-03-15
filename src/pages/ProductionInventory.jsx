import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProductionInventory.css';

function ProductionInventory() {
  const [productions, setProductions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [editedValues, setEditedValues] = useState({});

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/production-joined');
        setProductions(response.data);
      } catch (err) {
        console.error('Error fetching productions:', err);
        setError('Failed to fetch productions');
      }
    };

    fetchProductions();
  }, []);

  const toggleEditMode = (id) => {
    setEditMode(prev => ({ ...prev, [id]: !prev[id] }));
    if (!editMode[id]) {
      const prod = productions.find(p => p.id === id);
      setEditedValues(prev => ({
        ...prev,
        [id]: { total_weight: prod.total_weight, total_price: prod.total_price }
      }));
    }
  };

  const updateProduction = async (id, field, value) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue < 0) {
      setError('Please enter a valid non-negative number.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/production/${id}`, { [field]: parsedValue });
      setProductions(productions.map(p => 
        p.id === id ? { ...p, [field]: parsedValue } : p
      ));
      toggleEditMode(id);
      setSuccess('Production updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating production:', err.response?.data || err.message);
      setError(`Failed to update production: ${err.response?.data?.error || err.message}`);
    }
  };

  const deleteProduction = async (id) => {
    if (window.confirm('Are you sure you want to delete this production?')) {
      try {
        await axios.delete(`http://localhost:5000/api/production/${id}`);
        setProductions(productions.filter(p => p.id !== id));
        setSuccess('Production deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting production:', err.response?.data || err.message);
        setError(`Failed to delete production: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  return (
    <div className="production-inventory">
      <h2>Production Inventory</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <table className="production-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Total Weight (kg)</th>
            <th>Total Price (Rs.)</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {productions.length > 0 ? (
            productions.map(prod => (
              <tr key={prod.id}>
                <td>{prod.code}</td>
                <td>
                  {editMode[prod.id] ? (
                    <input
                      type="number"
                      defaultValue={editedValues[prod.id]?.total_weight || prod.total_weight}
                      onChange={(e) => setEditedValues(prev => ({
                        ...prev,
                        [prod.id]: { ...prev[prod.id], total_weight: e.target.value }
                      }))}
                      onBlur={(e) => updateProduction(prod.id, 'total_weight', e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') updateProduction(prod.id, 'total_weight', e.target.value); }}
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                  ) : (
                    prod.total_weight
                  )}
                </td>
                <td>
                  {editMode[prod.id] ? (
                    <input
                      type="number"
                      defaultValue={editedValues[prod.id]?.total_price || prod.total_price}
                      onChange={(e) => setEditedValues(prev => ({
                        ...prev,
                        [prod.id]: { ...prev[prod.id], total_price: e.target.value }
                      }))}
                      onBlur={(e) => updateProduction(prod.id, 'total_price', e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') updateProduction(prod.id, 'total_price', e.target.value); }}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    prod.total_price
                  )}
                </td>
                <td>{new Date(prod.created_at).toLocaleString()}</td>
                <td>
                  {editMode[prod.id] ? (
                    <button onClick={() => {
                      updateProduction(prod.id, 'total_weight', editedValues[prod.id]?.total_weight || prod.total_weight);
                      updateProduction(prod.id, 'total_price', editedValues[prod.id]?.total_price || prod.total_price);
                    }}>Save</button>
                  ) : (
                    <>
                      <button onClick={() => toggleEditMode(prod.id)}>Edit</button>
                      <button onClick={() => deleteProduction(prod.id)} >Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No production records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductionInventory;