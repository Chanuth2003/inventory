import { useState, useEffect } from 'react';
import '../styles/addinventory.css';

export default function AddInventory() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({
    date: '',
    product_id: '',
    product_type: '',
    quantity: '',
    unit: 'meter'
  });
  const [successMessage, setSuccessMessage] = useState(''); // Added state for success message

  // Fetch product list from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('❌ Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Auto-fill product_type and unit on product selection
  useEffect(() => {
    const selected = products.find(p => p.product_id === inventory.product_id);
    if (selected) {
      setInventory(prev => ({ ...prev, product_type: selected.type, unit: selected.unit }));
    }
  }, [inventory.product_id, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInventory(prev => ({ ...prev, [name]: value }));
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur(); // Optional: blur to prevent further scroll interaction
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/add-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: inventory.date,
          product_id: inventory.product_id,
          quantity: parseInt(inventory.quantity),
          unit: inventory.unit
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('✅ Inventory successfully added to the database!'); // Updated success message
        setInventory({
          date: '',
          product_id: '',
          product_type: '',
          quantity: '',
          unit: 'meter'
        });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('❌ Submission failed: ' + data.error);
      }
    } catch (err) {
      console.error('❌ Error submitting inventory:', err);
      alert('❌ Something went wrong while submitting.');
    }
  };

  return (
    <div className="add-inventory-wrapper">
      <div className="add-inventory-container">
        <div className="add-inventory-card">
          <h2 className="add-inventory-title">Add Inventory</h2>
          {successMessage && (
            <div className="success-message" style={{
              color: '#28a745',
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="add-inventory-form">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={inventory.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product_id">Product ID</label>
              <select
                id="product_id"
                name="product_id"
                value={inventory.product_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.product_id} value={p.product_id}>{p.product_id}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="product_type">Product Type</label>
              <input
                type="text"
                id="product_type"
                name="product_type"
                value={inventory.product_type}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={inventory.unit}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={inventory.quantity}
                onChange={handleChange}
                onWheel={handleWheel}
                placeholder="e.g. 100"
                required
                min="1"
              />
            </div>
            <button type="submit" className="submit-btn">
              Add Inventory
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}