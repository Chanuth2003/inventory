import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/pvcproductioninventory.css';

function PvcProductionInventory() {
  const [productions, setProductions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch PVC production data
  useEffect(() => {
    const fetchProductions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/pvc-production');
        console.log('Fetched PVC production data:', response.data);
        if (!Array.isArray(response.data) || response.data.length === 0) {
          setError('No PVC production records found or invalid data format');
        } else {
          const parsedProductions = response.data.map(item => ({
            ...item,
            total_weight: typeof item.total_weight === 'number' ? item.total_weight : parseFloat(item.total_weight) || 0,
            total_price: typeof item.total_price === 'number' ? item.total_price : parseFloat(item.total_price) || 0,
          }));
          setProductions(parsedProductions);
        }
      } catch (err) {
        console.error('Error fetching PVC production:', err.response?.data || err.message);
        setError(`Failed to fetch PVC production: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductions();
  }, []);

  // Toggle edit mode for a production record
  const toggleEditMode = (id) => {
    setEditMode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Update production record
  const updateProduction = async (id, updatedData) => {
    if (updatedData.total_weight < 0 || updatedData.total_price < 0) {
      setError('Total weight and price cannot be negative');
      return;
    }

    try {
      await api.put(`/api/pvc-production/${id}`, {
        total_weight: parseFloat(updatedData.total_weight),
        total_price: parseFloat(updatedData.total_price),
      });
      setProductions(productions.map(item =>
        item.id === id ? { ...item, ...updatedData } : item
      ));
      toggleEditMode(id);
      setSuccess('PVC production updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating PVC production:', err.response?.data || err.message);
      setError(`Failed to update PVC production: ${err.response?.data?.error || err.message}`);
    }
  };

  // Delete production record
  const deleteProduction = async (id) => {
    try {
      await api.delete(`/api/pvc-production/${id}`);
      setProductions(productions.filter(item => item.id !== id));
      setSuccess('PVC production deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting PVC production:', err.response?.data || err.message);
      setError(`Failed to delete PVC production: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="production-inventory pvc-production-inventory">
      <h2>PVC Production Inventory</h2>
      {loading && <div className="error-message">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <table className="production-table">
        <thead>
          <tr>
            <th>Production Code</th>
            <th>Total Weight (kg)</th>
            <th>Total Price (Rs.)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {productions.length > 0 ? (
            productions.map(item => (
              <tr key={item.id}>
                <td>{item.code || 'N/A'}</td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="number"
                      defaultValue={item.total_weight.toFixed(2)}
                      onBlur={(e) => updateProduction(item.id, {
                        total_weight: parseFloat(e.target.value) || 0,
                        total_price: item.total_price
                      })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateProduction(item.id, {
                            total_weight: parseFloat(e.target.value) || 0,
                            total_price: item.total_price
                          });
                        }
                      }}
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                  ) : (
                    item.total_weight.toFixed(2)
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="number"
                      defaultValue={item.total_price.toFixed(2)}
                      onBlur={(e) => updateProduction(item.id, {
                        total_weight: item.total_weight,
                        total_price: parseFloat(e.target.value) || 0
                      })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateProduction(item.id, {
                            total_weight: item.total_weight,
                            total_price: parseFloat(e.target.value) || 0
                          });
                        }
                      }}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    item.total_price.toFixed(2)
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <>
                      <button onClick={() => toggleEditMode(item.id)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => toggleEditMode(item.id)}>Edit</button>
                      <button onClick={() => deleteProduction(item.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : !loading && !error && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                No PVC production records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PvcProductionInventory;