import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('http://localhost:5000/inventory');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log('Fetched inventory:', data);
        setInventory(data);
      } catch (err) {
        setError(`Failed to fetch inventory: ${err.message}`);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/products');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log('Fetched products:', data);
        setProducts(data);
      } catch (err) {
        setError(`Failed to fetch products: ${err.message}`);
      }
    };

    fetchInventory();
    fetchProducts();
  }, []);

  const handleEdit = (item) => {
    console.log('Editing item with ID:', item.id, 'Data:', item);
    if (!item.id || isNaN(item.id)) {
      setError('Invalid inventory item selected');
      return;
    }
    setEditItem(item);
    const formattedDate = item.date ? item.date.split('T')[0] : '';
    setDate(formattedDate);
    setProductId(item.product_id);
    setAddQuantity(0); // Initialize to 0 to indicate additional quantity
    setUnit(item.unit);
    setError('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (!editItem || !editItem.id || isNaN(editItem.id)) {
      setError('Invalid inventory item selected');
      console.error('Invalid editItem.id:', editItem?.id);
      return;
    }
    if (!date || !product_id) {
      setError('Date and product ID are required');
      return;
    }
    if (!Number.isInteger(add_quantity) || add_quantity < 0) {
      setError('Additional quantity must be a non-negative integer');
      return;
    }

    const selectedProduct = products.find(p => p.product_id === product_id);
    if (!selectedProduct) {
      setError('Invalid product selected');
      return;
    }

    const payload = { date, product_id, add_quantity, unit: selectedProduct.unit };
    const url = `http://localhost:5000/inventory/${editItem.id}`;
    console.log('Sending PUT request to:', url, 'with payload:', payload);

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('PUT response status:', res.status, 'OK:', res.ok);

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.slice(0, 100));
        setError('Server error: Invalid response format');
        return;
      }

      const data = await res.json();
      if (res.ok) {
        const refreshRes = await fetch('http://localhost:5000/inventory');
        if (refreshRes.ok) {
          const updatedInventory = await refreshRes.json();
          console.log('Refreshed inventory:', updatedInventory);
          setInventory(updatedInventory);
        } else {
          setError('Failed to refresh inventory data');
          console.error('Refresh inventory failed:', refreshRes.status);
        }
        setSuccessMessage('✅ Inventory updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditItem(null);
        setDate('');
        setProductId('');
        setAddQuantity(0);
        setUnit('');
        setError('');
      } else {
        setError(data.error || 'Failed to update inventory');
        console.error('PUT error:', data.error);
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(`Failed to update inventory: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!id || isNaN(id)) {
      setError('Invalid inventory item ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/inventory/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      if (res.ok) {
        const refreshRes = await fetch('http://localhost:5000/inventory');
        if (refreshRes.ok) {
          const updatedInventory = await refreshRes.json();
          console.log('Refreshed inventory after delete:', updatedInventory);
          setInventory(updatedInventory);
        } else {
          setError('Failed to refresh inventory data');
          console.error('Refresh inventory failed:', refreshRes.status);
        }
        setSuccessMessage('✅ Inventory item deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setError('');
      } else {
        setError(data.error || 'Failed to delete inventory item');
        console.error('DELETE error:', data.error);
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(`Failed to delete inventory item: ${err.message}`);
    }
  };

  return (
    <div className="inventory-management-container">
      <h2 className="inventory-title">Inventory Management</h2>
      <button
        onClick={() => navigate('/add-inventory')}
        className="btn btn-add"
      >
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
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.product_id}</td>
                <td>{item.product_type}</td>
                <td>{Math.floor(item.quantity)}</td>
                <td>{item.unit}</td>
                <td>
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editItem && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Inventory (Current Quantity: {Math.floor(editItem.quantity)})</h3>
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
              <label>Add Quantity (to {Math.floor(editItem.quantity)})</label>
              <input
                type="number"
                value={add_quantity}
                onChange={(e) => setAddQuantity(Number(e.target.value))}
                min="0"
                step="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={products.find(p => p.product_id === product_id)?.unit || unit}
                disabled
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSave} className="btn btn-save">
                Save
              </button>
              <button
                onClick={() => {
                  setEditItem(null);
                  setDate('');
                  setProductId('');
                  setAddQuantity(0);
                  setUnit('');
                  setError('');
                  setSuccessMessage('');
                }}
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