// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import '../styles/RawMaterialsPvcInventory.css';

// function RawMaterialsPvcInventory() {
//   const [inventory, setInventory] = useState([]);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [editMode, setEditMode] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchInventory = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('http://localhost:5000/api/pvc-raw-material-inventory-joined');
//         console.log('Fetched PVC inventory data:', response.data);
//         if (!Array.isArray(response.data) || response.data.length === 0) {
//           setError('No PVC inventory records found or invalid data format');
//         } else {
//           const parsedInventory = response.data.map(item => ({
//             ...item,
//             unit_price: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price) || 0,
//             quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0,
//           }));
//           setInventory(parsedInventory);
//         }
//       } catch (err) {
//         console.error('Error fetching PVC inventory:', err.response?.data || err.message);
//         setError(`Failed to fetch PVC inventory: ${err.response?.data?.error || err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInventory();
//   }, []);

//   const toggleEditMode = (id) => {
//     setEditMode(prev => ({ ...prev, [id]: !prev[id] }));
//   };

//   const updateQuantity = async (id, newQuantity) => {
//     if (newQuantity < 0) {
//       setError('Quantity cannot be negative');
//       return;
//     }

//     try {
//       await axios.put(`http://localhost:5000/api/pvc-raw-material-inventory/${id}`, { quantity: newQuantity });
//       setInventory(inventory.map(item => 
//         item.id === id ? { ...item, quantity: newQuantity } : item
//       ));
//       toggleEditMode(id);
//       setSuccess('PVC inventory updated successfully!');
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err) {
//       console.error('Error updating PVC inventory:', err.response?.data || err.message);
//       setError(`Failed to update PVC inventory: ${err.response?.data?.error || err.message}`);
//     }
//   };

//   const cancelEdit = (id) => {
//     toggleEditMode(id);
//   };

//   return (
//     <div className="raw-materials-inventory pvc-raw-materials-inventory">
//       <h2>Raw Materials Inventory PVC</h2>
//       {loading && <div className="loading-message">Loading...</div>}
//       {error && <div className="error-message">{error}</div>}
//       {success && <div className="success-message">{success}</div>}
//       <table className="inventory-table">
//         <thead>
//           <tr>
//             <th>Raw Material ID</th>
//             <th>Name</th>
//             <th>Unit Price (Rs./kg)</th>
//             <th>Date</th>
//             <th>Quantity (kg)</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {inventory.length > 0 ? (
//             inventory.map(item => (
//               <tr key={item.id}>
//                 <td>{item.raw_material_id || 'N/A'}</td>
//                 <td>{item.name || 'Unknown'}</td>
//                 <td>{Number(item.unit_price).toFixed(2)}</td>
//                 <td>{item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A'}</td>
//                 <td>
//                   {editMode[item.id] ? (
//                     <input
//                       type="number"
//                       defaultValue={item.quantity.toFixed(2)}
//                       onBlur={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter') {
//                           updateQuantity(item.id, parseFloat(e.target.value) || 0);
//                         }
//                       }}
//                       min="0"
//                       step="0.01"
//                       autoFocus
//                     />
//                   ) : (
//                     item.quantity.toFixed(2)
//                   )}
//                 </td>
//                 <td>
//                   {editMode[item.id] ? (
//                     <button onClick={() => cancelEdit(item.id)}>Cancel</button>
//                   ) : (
//                     <button onClick={() => toggleEditMode(item.id)}>Edit</button>
//                   )}
//                 </td>
//               </tr>
//             ))
//           ) : !loading && !error && (
//             <tr>
//               <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
//                 No PVC inventory records found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default RawMaterialsPvcInventory;


































import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RawMaterialsPvcInventory.css';

function RawMaterialsPvcInventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/pvc-raw-material-inventory-joined');
        console.log('Fetched PVC inventory data:', response.data);
        if (!Array.isArray(response.data) || response.data.length === 0) {
          setError('No PVC inventory records found or invalid data format');
        } else {
          const parsedInventory = response.data.map(item => ({
            ...item,
            unit_price: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price) || 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0,
          }));
          setInventory(parsedInventory);
        }
      } catch (err) {
        console.error('Error fetching PVC inventory:', err.response?.data || err.message);
        setError(`Failed to fetch PVC inventory: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const toggleEditMode = (id) => {
    setEditMode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateInventory = async (id, updatedItem) => {
    if (updatedItem.quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    try {
      
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, ...updatedItem, unit_price: parseFloat(updatedItem.unit_price) || 0, quantity: parseFloat(updatedItem.quantity) || 0 } : item
      ));
      toggleEditMode(id);
      setSuccess('PVC inventory updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating PVC inventory:', err.response?.data || err.message);
      setError(`Failed to update PVC inventory: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleInputChange = (id, field, value) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const cancelEdit = (id) => {
    toggleEditMode(id);
  };

  return (
    <div className="raw-materials-inventory pvc-raw-materials-inventory">
      <h2>Raw Materials Inventory PVC</h2>
      {loading && <div className="loading-message">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Raw Material ID</th>
            <th>Name</th>
            <th>Unit Price (Rs./kg)</th>
            <th>Date</th>
            <th>Quantity (kg)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length > 0 ? (
            inventory.map(item => (
              <tr key={item.id}>
                <td>{item.raw_material_id || 'N/A'}</td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="text"
                      defaultValue={item.name || 'Unknown'}
                      onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                      autoFocus
                    />
                  ) : (
                    item.name || 'Unknown'
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="number"
                      defaultValue={item.unit_price.toFixed(2)}
                      onChange={(e) => handleInputChange(item.id, 'unit_price', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    Number(item.unit_price).toFixed(2)
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="date"
                      defaultValue={item.date ? new Date(item.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange(item.id, 'date', e.target.value)}
                    />
                  ) : (
                    item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A'
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <input
                      type="number"
                      defaultValue={item.quantity.toFixed(2)}
                      onChange={(e) => handleInputChange(item.id, 'quantity', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    item.quantity.toFixed(2)
                  )}
                </td>
                <td>
                  {editMode[item.id] ? (
                    <>
                      <button onClick={() => updateInventory(item.id, item)}>Save</button>
                      <button onClick={() => cancelEdit(item.id)}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => toggleEditMode(item.id)}>Edit</button>
                  )}
                </td>
              </tr>
            ))
          ) : !loading && !error && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                No PVC inventory records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RawMaterialsPvcInventory;