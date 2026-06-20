import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/inventorymanagement.css';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [date, setDate] = useState('');
  const [product_id, setProductId] = useState('');
  const [add_quantity, setAddQuantity] = useState(0);
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch data
  useEffect(() => {
    fetchInventory();
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    const formattedDate = item.date ? item.date.split('T')[0] : '';
    setDate(formattedDate);
    setProductId(item.product_id);
    setAddQuantity(0);
    setUnit(item.unit || '');
    setError('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (!editItem || !date || !product_id) {
      setError('Date and Product ID are required');
      return;
    }

    try {
      const response = await api.put(`/inventory/${editItem.id}`, {
        date,
        product_id,
        add_quantity: parseInt(add_quantity),
        unit
      });

      if (response.status === 200) {
        fetchInventory(); // Refresh list
        setSuccessMessage('✅ Inventory updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditItem(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update inventory');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;

    try {
      await api.delete(`/inventory/${id}`);
      setSuccessMessage('✅ Inventory item deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchInventory();
    } catch (err) {
      console.error(err);
      setError('Failed to delete inventory item');
    }
  };

  return (
    <div className="inventory-management-container">
      <h2 className="inventory-title">Inventory Management</h2>
      <button onClick={() => navigate('/add-inventory')} className="btn btn-add">
        Add New
      </button>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product ID</th>
              <th>Product Type</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No inventory records found</td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.product_id}</td>
                  <td>{item.product_type}</td>
                  <td>{Math.floor(item.quantity)}</td>
                  <td>{item.unit}</td>
                  <td>
                    <button onClick={() => handleEdit(item)} className="btn btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Inventory</h3>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Product ID</label>
              <select
                value={product_id}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_id} - {product.type}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Add Quantity</label>
              <input
                type="number"
                value={add_quantity}
                onChange={(e) => setAddQuantity(Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSave} className="btn btn-save">Save</button>
              <button 
                onClick={() => setEditItem(null)} 
                className="btn btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;