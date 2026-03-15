// import { useState } from 'react';

// export default function AddCustomer() {
//   const [customer, setCustomer] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     address: ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCustomer(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await fetch('http://localhost:5000/add-customer', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(customer)
//       });

//       const data = await res.json();

//       if (res.ok) {
//         alert('✅ Customer added successfully!');
//         setCustomer({ name: '', phone: '', email: '', address: '' }); // reset form
//       } else {
//         alert('❌ Submission failed: ' + data.error);
//       }
//     } catch (err) {
//       console.error('❌ Error submitting customer:', err);
//       alert('❌ Something went wrong while submitting.');
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Add New Customer</h2>
//       <form onSubmit={handleSubmit}>
//         <label>Customer Name</label>
//         <input
//           type="text"
//           name="name"
//           value={customer.name}
//           onChange={handleChange}
//           placeholder="e.g. John Doe"
//         />

//         <label>Phone Number</label>
//         <input
//           type="tel"
//           name="phone"
//           value={customer.phone}
//           onChange={handleChange}
//           placeholder="e.g. 0771234567"
//         />

//         <label>Email Address</label>
//         <input
//           type="email"
//           name="email"
//           value={customer.email}
//           onChange={handleChange}
//           placeholder="e.g. john@example.com"
//         />

//         <label>Address</label>
//         <textarea
//           name="address"
//           rows="3"
//           value={customer.address}
//           onChange={handleChange}
//           placeholder="Customer address"
//           style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', marginTop: '0.5rem' }}
//         />

//         <button type="submit">Add Customer</button>
//       </form>
//     </div>
//   );
// }










import { useState } from 'react';
import '../styles/addCustomer.css';

export default function AddCustomer() {
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/add-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({ message: '✅ Customer added successfully!', type: 'success' });
        setCustomer({ name: '', phone: '', email: '', address: '' });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      } else {
        setNotification({ message: `❌ Submission failed: ${data.error}`, type: 'error' });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      }
    } catch (err) {
      console.error('❌ Error submitting customer:', err);
      setNotification({ message: '❌ Something went wrong while submitting.', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="add-customer-wrapper">
      <div className="add-customer-container">
        <div className="add-customer-card">
          <h2 className="add-customer-title">Add New Customer</h2>
          {notification.message && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="add-customer-form">
            <div className="form-group">
              <label htmlFor="name">Customer Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                placeholder="e.g. 0771234567"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={customer.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                rows="4"
                value={customer.address}
                onChange={handleChange}
                placeholder="Customer address"
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Add Customer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}