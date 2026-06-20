import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/customermanagement.css';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // Helper function for authenticated requests
  const authFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return response;
    } catch (err) {
      console.error('Network error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setError('');
      const res = await authFetch('http://localhost:5000/customers');

      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    }
  };

  const handleEdit = (customer) => {
    setEditCustomer(customer);
    setEditForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setError('Customer name is required.');
      return;
    }

    try {
      const res = await authFetch(`http://localhost:5000/customers/${editCustomer.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        fetchCustomers(); // Refresh list
        setEditCustomer(null);
        setEditForm({ name: '', phone: '', email: '', address: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to update customer');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;

    try {
      const res = await authFetch(`http://localhost:5000/customers/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCustomers(customers.filter(c => c.id !== id));
      } else {
        setError('Failed to delete customer');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete customer');
    }
  };

  const handleCloseModal = () => {
    setEditCustomer(null);
    setEditForm({ name: '', phone: '', email: '', address: '' });
    setError('');
  };

  return (
    <div className="customer-management-container">
      <header className="customer-header">
        <h2>Customer Management</h2>
        <button onClick={() => navigate('/add-customer')} className="btn btn-add-new">
          Add New
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="table-card">
        <div className="table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.address || '-'}</td>
                    <td>
                      <button onClick={() => handleEdit(customer)} className="btn btn-edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(customer.id)} className="btn btn-delete">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editCustomer && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Customer</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-save">Save Changes</button>
                <button type="button" onClick={handleCloseModal} className="btn btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;