

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../styles/addsale.css';

// export default function AddSale() {
//   const [products, setProducts] = useState([]);
//   const [inventory, setInventory] = useState([]);
//   const [customers, setCustomers] = useState([]);

//   const [saleInfo, setSaleInfo] = useState({
//     date: '',
//     billNo: '',
//     customerId: '',
//     deliveryCharges: '', // Added delivery charges
//     paymentMethod: 'cash',
//     paidAmount: '',
//     chequeNo: '',
//     chequeBank: '',
//     chequeDate: '',
//     chequeAmount: ''
//   });

//   const [items, setItems] = useState([
//     { productId: '', type: '', unit: '', price: 0, quantity: '', total: 0 }
//   ]);

//   useEffect(() => {
//     axios.get('http://localhost:5000/products')
//       .then(res => setProducts(res.data))
//       .catch(err => console.error('Error fetching products:', err));

//     axios.get('http://localhost:5000/inventory')
//       .then(res => setInventory(res.data))
//       .catch(err => console.error('Error fetching inventory:', err));

//     axios.get('http://localhost:5000/customers')
//       .then(res => setCustomers(res.data))
//       .catch(err => console.error('Error fetching customers:', err));
//   }, []);

//   const handleSaleInfoChange = e => {
//     const { name, value } = e.target;
//     setSaleInfo(prev => ({ ...prev, [name]: value }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...items];
//     const item = updatedItems[index];

//     if (field === 'productId') {
//       item.productId = value;
//       const selectedProduct = products.find(p => p.product_id === value);
//       if (selectedProduct) {
//         item.type = selectedProduct.type;
//         item.unit = selectedProduct.unit;
//         item.price = parseFloat(selectedProduct.price);
//         item.quantity = '';
//         item.total = 0;
//       }
//     }

//     if (field === 'quantity') {
//       item.quantity = value;
//       item.total = parseFloat(item.price) * parseFloat(value || 0);
//     }

//     updatedItems[index] = item;
//     setItems(updatedItems);
//   };

//   const addAnotherProduct = () => {
//     setItems(prev => [...prev, { productId: '', type: '', unit: '', price: 0, quantity: '', total: 0 }]);
//   };

//   const calculateGrandTotal = () => {
//     const itemsSubtotal = items.reduce((sum, i) => sum + (i.total || 0), 0);
//     const delivery = parseFloat(saleInfo.deliveryCharges) || 0;
//     return itemsSubtotal + delivery;
//   };

//   const getPaidAmount = () => {
//     if (saleInfo.paymentMethod === 'cash') return parseFloat(saleInfo.paidAmount) || 0;
//     if (saleInfo.paymentMethod === 'cheque') return parseFloat(saleInfo.chequeAmount) || 0;
//     return 0;
//   };

//   const calculateCredit = () => Math.max(0, calculateGrandTotal() - getPaidAmount());

//   const handleSubmit = async e => {
//   e.preventDefault();
  
//   // Parse delivery charges with Number() for better empty string handling
//   const deliveryChargesNum = Number(saleInfo.deliveryCharges) || 0;
  
//   if (deliveryChargesNum < 0) {
//     alert('Delivery charges cannot be negative');
//     return;
//   }
  
//   try {
//     const payload = {
//       date: saleInfo.date,
//       billNo: saleInfo.billNo,
//       customerId: saleInfo.customerId,
//       paymentMethod: saleInfo.paymentMethod,
//       paidAmount: Number(saleInfo.paidAmount) || 0,
//       chequeNo: saleInfo.chequeNo,
//       chequeBank: saleInfo.chequeBank,
//       chequeDate: saleInfo.chequeDate,
//       chequeAmount: Number(saleInfo.chequeAmount) || 0,
//       items: items.filter(item => item.productId && item.quantity > 0), // Filter empty items
//       deliveryCharges: deliveryChargesNum, // Explicitly send as number
//       grandTotal: calculateGrandTotal(),
//       credit: calculateCredit()
//     };

//     // Debug log to confirm value
//     console.log('Sending deliveryCharges:', deliveryChargesNum, 'Full payload:', payload);

//     const response = await axios.post('http://localhost:5000/add-sale', payload);
//     alert('✅ Sale recorded successfully! Sale ID: ' + response.data.saleId);

//     // Update inventory (only for valid items)
//     for (const item of payload.items) {
//       const inv = inventory.find(i => i.product_id === item.productId && i.unit === item.unit);
//       if (inv) {
//         await axios.post('http://localhost:5000/reduce-inventory', {
//           inventoryId: inv.id,
//           reduceBy: Number(item.quantity)
//         });
//       }
//     }

//     // Reset form
//     setSaleInfo({
//       date: '',
//       billNo: '',
//       customerId: '',
//       deliveryCharges: '',
//       paymentMethod: 'cash',
//       paidAmount: '',
//       chequeNo: '',
//       chequeBank: '',
//       chequeDate: '',
//       chequeAmount: ''
//     });
//     setItems([{ productId: '', type: '', unit: '', price: 0, quantity: '', total: 0 }]);
//   } catch (err) {
//     console.error('Submit error:', err);
//     alert('❌ Error submitting sale: ' + (err.response?.data?.error || err.message));
//   }
// };

//   return (
//     <div className="add-sale-wrapper">
//       <div className="add-sale-container">
//         <div className="add-sale-card">
//           <h2 className="add-sale-title">Add Sale</h2>
//           <form onSubmit={handleSubmit} className="add-sale-form">
//             <div className="form-group">
//               <label htmlFor="date">Date</label>
//               <input
//                 id="date"
//                 type="date"
//                 name="date"
//                 value={saleInfo.date}
//                 onChange={handleSaleInfoChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="billNo">Bill No.</label>
//               <input
//                 id="billNo"
//                 type="text"
//                 name="billNo"
//                 value={saleInfo.billNo}
//                 onChange={handleSaleInfoChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="customerId">Customer</label>
//               <select
//                 id="customerId"
//                 name="customerId"
//                 value={saleInfo.customerId}
//                 onChange={handleSaleInfoChange}
//                 required
//               >
//                 <option value="">Select customer</option>
//                 {customers.map(c => (
//                   <option key={c.id} value={c.id}>{c.name}</option>
//                 ))}
//               </select>
//             </div>
//             <hr />
//             <h3 className="section-title">Products</h3>
//             {items.map((item, index) => (
//               <div key={index} className="sale-item">
//                 <div className="form-group">
//                   <label htmlFor={`productId-${index}`}>Product ID</label>
//                   <select
//                     id={`productId-${index}`}
//                     value={item.productId}
//                     onChange={e => handleItemChange(index, 'productId', e.target.value)}
//                     required
//                   >
//                     <option value="">Select product</option>
//                     {products.map(p => (
//                       <option key={p.product_id} value={p.product_id}>{p.product_id}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor={`type-${index}`}>Product Type</label>
//                   <input
//                     id={`type-${index}`}
//                     value={item.type}
//                     readOnly
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor={`unit-${index}`}>Unit</label>
//                   <input
//                     id={`unit-${index}`}
//                     value={item.unit}
//                     readOnly
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor={`price-${index}`}>Price (per unit)</label>
//                   <input
//                     id={`price-${index}`}
//                     type="number"
//                     value={item.price}
//                     readOnly
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor={`quantity-${index}`}>Quantity</label>
//                   <input
//                     id={`quantity-${index}`}
//                     type="number"
//                     value={item.quantity}
//                     onChange={e => handleItemChange(index, 'quantity', e.target.value)}
//                     required
//                     min="1"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor={`total-${index}`}>Total</label>
//                   <input
//                     id={`total-${index}`}
//                     value={isNaN(item.total) ? '0.00' : item.total.toFixed(2)}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             ))}
//             <button type="button" className="add-product-btn" onClick={addAnotherProduct}>+ Add Product</button>
//             <div className="form-group">
//               <label htmlFor="deliveryCharges">Delivery Charges (Rs.)</label>
//               <input
//                 type="number"
//                 id="deliveryCharges"
//                 name="deliveryCharges"
//                 value={saleInfo.deliveryCharges}
//                 onChange={handleSaleInfoChange}
//                 min="0"
//                 step="0.01"
//                 placeholder="0.00"
//               />
//             </div>
//             <h3 className="grand-total">Grand Total: Rs. {calculateGrandTotal().toFixed(2)}</h3>
//             <hr />
//             <h3 className="section-title">Payment Method</h3>
//             <div className="form-group">
//               <label htmlFor="paymentMethod">Method</label>
//               <select
//                 id="paymentMethod"
//                 name="paymentMethod"
//                 value={saleInfo.paymentMethod}
//                 onChange={handleSaleInfoChange}
//               >
//                 <option value="cash">Cash</option>
//                 <option value="cheque">Cheque</option>
//                 <option value="credit">Credit</option>
//               </select>
//             </div>
//             {saleInfo.paymentMethod === 'cash' && (
//               <div className="form-group">
//                 <label htmlFor="paidAmount">Amount Paid</label>
//                 <input
//                   id="paidAmount"
//                   type="number"
//                   name="paidAmount"
//                   value={saleInfo.paidAmount}
//                   onChange={handleSaleInfoChange}
//                   required
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//             )}
//             {saleInfo.paymentMethod === 'cheque' && (
//               <>
//                 <div className="form-group">
//                   <label htmlFor="chequeNo">Cheque Number</label>
//                   <input
//                     id="chequeNo"
//                     type="text"
//                     name="chequeNo"
//                     value={saleInfo.chequeNo}
//                     onChange={handleSaleInfoChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="chequeBank">Bank</label>
//                   <input
//                     id="chequeBank"
//                     type="text"
//                     name="chequeBank"
//                     value={saleInfo.chequeBank}
//                     onChange={handleSaleInfoChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="chequeDate">Cheque Date</label>
//                   <input
//                     id="chequeDate"
//                     type="date"
//                     name="chequeDate"
//                     value={saleInfo.chequeDate}
//                     onChange={handleSaleInfoChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="chequeAmount">Cheque Amount</label>
//                   <input
//                     id="chequeAmount"
//                     type="number"
//                     name="chequeAmount"
//                     value={saleInfo.chequeAmount}
//                     onChange={handleSaleInfoChange}
//                     required
//                     min="0"
//                     step="0.01"
//                   />
//                 </div>
//               </>
//             )}
//             {calculateCredit() > 0 && (
//               <p className="credit-note">💳 Credit: Rs. {calculateCredit().toFixed(2)}</p>
//             )}
//             <button type="submit" className="submit-btn">
//               Submit Sale
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }









































import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/addsale.css';

export default function AddSale() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message

  const [saleInfo, setSaleInfo] = useState({
    date: '',
    billNo: '',
    customerId: '',
    deliveryCharges: '',
    paymentMethod: 'cash',
    paidAmount: '',
    chequeNo: '',
    chequeBank: '',
    chequeDate: '',
    chequeAmount: ''
  });

  const [items, setItems] = useState([
    { productId: '', type: '', unit: '', price: 0, quantity: '', total: 0 }
  ]);

  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error fetching products:', err));

    axios.get('http://localhost:5000/inventory')
      .then(res => setInventory(res.data))
      .catch(err => console.error('Error fetching inventory:', err));

    axios.get('http://localhost:5000/customers')
      .then(res => setCustomers(res.data))
      .catch(err => console.error('Error fetching customers:', err));
  }, []);

  const handleSaleInfoChange = e => {
    const { name, value } = e.target;
    setSaleInfo(prev => ({ ...prev, [name]: value }));
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur(); // Optional: blur to prevent further scroll interaction
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    if (field === 'productId') {
      item.productId = value;
      const selectedProduct = products.find(p => p.product_id === value);
      if (selectedProduct) {
        item.type = selectedProduct.type;
        item.unit = selectedProduct.unit;
        item.price = parseFloat(selectedProduct.price);
        item.quantity = '';
        item.total = 0;
      }
    }

    if (field === 'quantity') {
      item.quantity = value;
      item.total = parseFloat(item.price) * parseFloat(value || 0);
    }

    updatedItems[index] = item;
    setItems(updatedItems);
  };

  const addAnotherProduct = () => {
    setItems(prev => [...prev, { productId: '', type: '', unit: '', price: 0, quantity: '', total: 0 }]);
  };

  const calculateGrandTotal = () => {
    const itemsSubtotal = items.reduce((sum, i) => sum + (i.total || 0), 0);
    const delivery = parseFloat(saleInfo.deliveryCharges) || 0;
    return itemsSubtotal + delivery;
  };

  const getPaidAmount = () => {
    if (saleInfo.paymentMethod === 'cash') return parseFloat(saleInfo.paidAmount) || 0;
    if (saleInfo.paymentMethod === 'cheque') return parseFloat(saleInfo.chequeAmount) || 0;
    return 0;
  };

  const calculateCredit = () => Math.max(0, calculateGrandTotal() - getPaidAmount());

  const handleSubmit = async e => {
    e.preventDefault();

    const deliveryChargesNum = Number(saleInfo.deliveryCharges) || 0;

    if (deliveryChargesNum < 0) {
      alert('Delivery charges cannot be negative');
      return;
    }

    try {
      const payload = {
        date: saleInfo.date,
        billNo: saleInfo.billNo,
        customerId: saleInfo.customerId,
        paymentMethod: saleInfo.paymentMethod,
        paidAmount: Number(saleInfo.paidAmount) || 0,
        chequeNo: saleInfo.chequeNo,
        chequeBank: saleInfo.chequeBank,
        chequeDate: saleInfo.chequeDate,
        chequeAmount: Number(saleInfo.chequeAmount) || 0,
        items: items.filter(item => item.productId && item.quantity > 0),
        deliveryCharges: deliveryChargesNum,
        grandTotal: calculateGrandTotal(),
        credit: calculateCredit()
      };

      console.log('Sending deliveryCharges:', deliveryChargesNum, 'Full payload:', payload);

      const response = await axios.post('http://localhost:5000/add-sale', payload);
      
      // Set success message with sale ID
      setSuccessMessage(`Sale recorded successfully! Sale ID: ${response.data.saleId}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

      // Update inventory
      for (const item of payload.items) {
        const inv = inventory.find(i => i.product_id === item.productId && i.unit === item.unit);
        if (inv) {
          await axios.post('http://localhost:5000/reduce-inventory', {
            inventoryId: inv.id,
            reduceBy: Number(item.quantity)
          });
        }
      }

      // Reset form
      setSaleInfo({
        date: '',
        billNo: '',
        customerId: '',
        deliveryCharges: '',
        paymentMethod: 'cash',
        paidAmount: '',
        chequeNo: '',
        chequeBank: '',
        chequeDate: '',
        chequeAmount: ''
      });
      setItems([{ productId: '', type: '', unit: '', price: 0, quantity: '', total: 0 }]);
    } catch (err) {
      console.error('Submit error:', err);
      alert('❌ Error submitting sale: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="add-sale-wrapper">
      <div className="add-sale-container">
        <div className="add-sale-card">
          <h2 className="add-sale-title">Add Sale</h2>
          {successMessage && (
            <div className="success-message">
              ✅ {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="add-sale-form">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={saleInfo.date}
                onChange={handleSaleInfoChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="billNo">Bill No.</label>
              <input
                id="billNo"
                type="text"
                name="billNo"
                value={saleInfo.billNo}
                onChange={handleSaleInfoChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customerId">Customer</label>
              <select
                id="customerId"
                name="customerId"
                value={saleInfo.customerId}
                onChange={handleSaleInfoChange}
                required
              >
                <option value="">Select customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <hr />
            <h3 className="section-title">Products</h3>
            {items.map((item, index) => (
              <div key={index} className="sale-item">
                <div className="form-group">
                  <label htmlFor={`productId-${index}`}>Product ID</label>
                  <select
                    id={`productId-${index}`}
                    value={item.productId}
                    onChange={e => handleItemChange(index, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id}>{p.product_id}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor={`type-${index}`}>Product Type</label>
                  <input
                    id={`type-${index}`}
                    value={item.type}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`unit-${index}`}>Unit</label>
                  <input
                    id={`unit-${index}`}
                    value={item.unit}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`price-${index}`}>Price (per unit)</label>
                  <input
                    id={`price-${index}`}
                    type="number"
                    value={item.price}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`quantity-${index}`}>Quantity</label>
                  <input
                    id={`quantity-${index}`}
                    type="number"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                    onWheel={handleWheel}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`total-${index}`}>Total</label>
                  <input
                    id={`total-${index}`}
                    value={isNaN(item.total) ? '0.00' : item.total.toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
            ))}
            <button type="button" className="add-product-btn" onClick={addAnotherProduct}>+ Add Product</button>
            <div className="form-group">
              <label htmlFor="deliveryCharges">Delivery Charges (Rs.)</label>
              <input
                type="number"
                id="deliveryCharges"
                name="deliveryCharges"
                value={saleInfo.deliveryCharges}
                onChange={handleSaleInfoChange}
                onWheel={handleWheel}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <h3 className="grand-total">Grand Total: Rs. {calculateGrandTotal().toFixed(2)}</h3>
            <hr />
            <h3 className="section-title">Payment Method</h3>
            <div className="form-group">
              <label htmlFor="paymentMethod">Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={saleInfo.paymentMethod}
                onChange={handleSaleInfoChange}
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            {saleInfo.paymentMethod === 'cash' && (
              <div className="form-group">
                <label htmlFor="paidAmount">Amount Paid</label>
                <input
                  id="paidAmount"
                  type="number"
                  name="paidAmount"
                  value={saleInfo.paidAmount}
                  onChange={handleSaleInfoChange}
                  onWheel={handleWheel}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            {saleInfo.paymentMethod === 'cheque' && (
              <>
                <div className="form-group">
                  <label htmlFor="chequeNo">Cheque Number</label>
                  <input
                    id="chequeNo"
                    type="text"
                    name="chequeNo"
                    value={saleInfo.chequeNo}
                    onChange={handleSaleInfoChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="chequeBank">Bank</label>
                  <input
                    id="chequeBank"
                    type="text"
                    name="chequeBank"
                    value={saleInfo.chequeBank}
                    onChange={handleSaleInfoChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="chequeDate">Cheque Date</label>
                  <input
                    id="chequeDate"
                    type="date"
                    name="chequeDate"
                    value={saleInfo.chequeDate}
                    onChange={handleSaleInfoChange}
                    onWheel={handleWheel}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="chequeAmount">Cheque Amount</label>
                  <input
                    id="chequeAmount"
                    type="number"
                    name="chequeAmount"
                    value={saleInfo.chequeAmount}
                    onChange={handleSaleInfoChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </>
            )}
            {calculateCredit() > 0 && (
              <p className="credit-note">💳 Credit: Rs. {calculateCredit().toFixed(2)}</p>
            )}
            <button type="submit" className="submit-btn">
              Submit Sale
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}