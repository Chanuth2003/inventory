import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/ProductionInventory.css';

function ProductionInventory() {
  const [productions, setProductions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [editedValues, setEditedValues] = useState({});

  // Fetch productions
  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      setError(null);
      const response = await api.get('/api/production-joined');
      setProductions(response.data || []);
    } catch (err) {
      console.error('Error fetching productions:', err);
      setError('Failed to load production records');
    }
  };

  const toggleEditMode = (id) => {
    setEditMode(prev => ({ ...prev, [id]: !prev[id] }));

    if (!editMode[id]) {
      const prod = productions.find(p => p.id === id);
      if (prod) {
        setEditedValues(prev => ({
          ...prev,
          [id]: { 
            total_weight: prod.total_weight, 
            total_price: prod.total_price 
          }
        }));
      }
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const saveProduction = async (id) => {
    const values = editedValues[id];
    if (!values) return;

    try {
      await api.put(`/api/production/${id}`, {
        total_weight: parseFloat(values.total_weight),
        total_price: parseFloat(values.total_price)
      });

      // Refresh the list
      fetchProductions();

      setSuccess('Production updated successfully!');
      setTimeout(() => setSuccess(null), 3000);

      setEditMode(prev => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update production');
    }
  };

  const deleteProduction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this production record?')) return;

    try {
      await api.delete(`/api/production/${id}`);
      setProductions(productions.filter(p => p.id !== id));
      setSuccess('Production deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete production');
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
            <th>Actions</th>
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
                      value={editedValues[prod.id]?.total_weight ?? prod.total_weight}
                      onChange={(e) => handleInputChange(prod.id, 'total_weight', e.target.value)}
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
                      value={editedValues[prod.id]?.total_price ?? prod.total_price}
                      onChange={(e) => handleInputChange(prod.id, 'total_price', e.target.value)}
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
                    <>
                      <button onClick={() => saveProduction(prod.id)}>Save</button>
                      <button onClick={() => toggleEditMode(prod.id)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => toggleEditMode(prod.id)}>Edit</button>
                      <button onClick={() => deleteProduction(prod.id)}>Delete</button>
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