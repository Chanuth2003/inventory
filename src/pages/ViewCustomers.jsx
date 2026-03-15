import { useEffect, useState } from 'react';

export default function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:5000/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error('❌ Failed to fetch customers:', err);
    }
  };

  const handleEdit = (customer) => {
    setEditing(customer.id);
    setForm({ ...customer });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message);
      handleCancel();
      fetchCustomers();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('❌ Error updating customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const res = await fetch(`http://localhost:5000/customers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      alert(data.message);
      fetchCustomers();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('❌ Error deleting customer');
    }
  };

  return (
    <div className="container">
      <h2>Customer List</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <tr key={cust.id}>
              <td>
                {editing === cust.id ? (
                  <input name="name" value={form.name} onChange={handleChange} />
                ) : (
                  cust.name
                )}
              </td>
              <td>
                {editing === cust.id ? (
                  <input name="phone" value={form.phone} onChange={handleChange} />
                ) : (
                  cust.phone
                )}
              </td>
              <td>
                {editing === cust.id ? (
                  <input name="email" value={form.email} onChange={handleChange} />
                ) : (
                  cust.email
                )}
              </td>
              <td>
                {editing === cust.id ? (
                  <input name="address" value={form.address} onChange={handleChange} />
                ) : (
                  cust.address
                )}
              </td>
              <td>
                {editing === cust.id ? (
                  <>
                    <button onClick={() => handleUpdate(cust.id)}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(cust)}>Edit</button>
                    <button onClick={() => handleDelete(cust.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
