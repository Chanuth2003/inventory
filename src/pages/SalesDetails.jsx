// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/saledetails.css';

// const SaleDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [sale, setSale] = useState(null);
//   const [error, setError] = useState('');
//   const [paymentAmount, setPaymentAmount] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('credit');
//   const [chequeNumber, setChequeNumber] = useState('');
//   const [bankName, setBankName] = useState('');
//   const [chequeDate, setChequeDate] = useState('');

//   useEffect(() => {
//     const fetchSaleDetails = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/sales/${id}`);
//         setSale(res.data);
//       } catch (err) {
//         console.error('Error fetching sale details:', err);
//         setError('Failed to fetch sale details. Please try again.');
//       }
//     };

//     fetchSaleDetails();
//   }, [id]);

//   const handlePayment = async (e) => {
//     e.preventDefault();
//     if (!paymentAmount || paymentAmount <= 0) {
//       setError('Please enter a valid payment amount.');
//       return;
//     }

//     if (paymentAmount > sale.remaining_credit) {
//       setError('Payment amount cannot exceed remaining credit.');
//       return;
//     }

//     if (paymentMethod === 'cheque') {
//       if (!chequeNumber || !bankName || !chequeDate) {
//         setError('Please fill in all cheque details.');
//         return;
//       }
//     }

//     try {
//       if (paymentMethod === 'credit') {
//         const creditPayment = sale.payments.find(p => p.method === 'credit');
//         if (!creditPayment) {
//           setError('No credit payment record found for this sale.');
//           return;
//         }

//         const res = await axios.put(`http://localhost:5000/payments/${creditPayment.id}/pay-credit`, {
//           amount_paid: parseFloat(paymentAmount)
//         });

//         if (res.status === 200) {
//           // Refresh sale details
//           const updatedRes = await axios.get(`http://localhost:5000/sales/${id}`);
//           setSale(updatedRes.data);
//           setPaymentAmount('');
//           setError('');
//         }
//       } else {
//         // Handle cash or cheque payment
//         const paymentData = {
//           sale_id: sale.sale_id,
//           method: paymentMethod,
//           amount: parseFloat(paymentAmount)
//         };

//         if (paymentMethod === 'cheque') {
//           paymentData.cheque_number = chequeNumber;
//           paymentData.bank_name = bankName;
//           paymentData.cheque_date = chequeDate;
//         }

//         const res = await axios.post(`http://localhost:5000/pay-sale`, paymentData);

//         if (res.status === 201) {
//           // Refresh sale details
//           const updatedRes = await axios.get(`http://localhost:5000/sales/${id}`);
//           setSale(updatedRes.data);
//           setPaymentAmount('');
//           setPaymentMethod('credit');
//           setChequeNumber('');
//           setBankName('');
//           setChequeDate('');
//           setError('');
//         }
//       }
//     } catch (err) {
//       console.error('Error processing payment:', err.response?.data || err.message);
//       setError(err.response?.data?.error || 'Failed to process payment. Please try again.');
//     }
//   };

//   if (error) {
//     return <div className="error-message">{error}</div>;
//   }

//   if (!sale) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <div className="sale-details-container">
//       <h2>Sale Details - Bill No: {sale.bill_no}</h2>
//       <button onClick={() => navigate('/sales-summary')} className="btn btn-back">
//         Back to Sales Summary
//       </button>

//       <div className="sale-info">
//         <h3>Sale Information</h3>
//         <p><strong>Date:</strong> {new Date(sale.date).toLocaleDateString()}</p>
//         <p><strong>Customer:</strong> {sale.customer_name}</p>
//         <p><strong>Total Amount:</strong> Rs. {sale.total_amount}</p>
//         <p><strong>Total Paid:</strong> Rs. {sale.total_paid}</p>
//         <p><strong>Remaining Credit:</strong> Rs. {sale.remaining_credit}</p>
//         <p><strong>Payment Method:</strong> {sale.method}</p>
//         <p><strong>Status:</strong> {sale.status}</p>
//       </div>

//       <div className="sale-items">
//         <h3>Sale Items</h3>
//         <table className="sale-items-table">
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Price</th>
//               <th>Quantity</th>
//               <th>Piece</th>
//               <th>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sale.items.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="no-data">No items found.</td>
//               </tr>
//             ) : (
//               sale.items.map((item) => (
//                 <tr key={item.id}>
//                   <td>{item.product_name}</td>
//                   <td>Rs. {item.price}</td>
//                   <td>{item.quantity}</td>
//                   <td>{item.piece}</td>
//                   <td>Rs. {item.total_price}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="payment-history">
//         <h3>Payment History</h3>
//         <table className="payment-history-table">
//           <thead>
//             <tr>
//               <th>Method</th>
//               <th>Amount</th>
//               <th>Cheque Number</th>
//               <th>Bank Name</th>
//               <th>Cheque Date</th>
//               <th>Cheque Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sale.payments.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="no-data">No payments found.</td>
//               </tr>
//             ) : (
//               sale.payments.map((payment) => (
//                 <tr key={payment.id}>
//                   <td>{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</td>
//                   <td>Rs. {payment.amount}</td>
//                   <td>{payment.cheque_number || '-'}</td>
//                   <td>{payment.bank_name || '-'}</td>
//                   <td>{payment.cheque_date || '-'}</td>
//                   <td>{payment.cheque_status || '-'}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {sale.remaining_credit > 0 && (
//         <div className="payment-form">
//           <h3>Pay Remaining Credit</h3>
//           <form onSubmit={handlePayment}>
//             <div className="form-group">
//               <label htmlFor="paymentAmount">Payment Amount (Rs.):</label>
//               <input
//                 type="number"
//                 id="paymentAmount"
//                 value={paymentAmount}
//                 onChange={(e) => setPaymentAmount(e.target.value)}
//                 placeholder="Enter amount"
//                 min="0"
//                 step="0.01"
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="paymentMethod">Payment Method:</label>
//               <select
//                 id="paymentMethod"
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 required
//               >
//                 <option value="credit">Credit</option>
//                 <option value="cash">Cash</option>
//                 <option value="cheque">Cheque</option>
//               </select>
//             </div>
//             {paymentMethod === 'cheque' && (
//               <>
//                 <div className="form-group">
//                   <label htmlFor="chequeNumber">Cheque Number:</label>
//                   <input
//                     type="text"
//                     id="chequeNumber"
//                     value={chequeNumber}
//                     onChange={(e) => setChequeNumber(e.target.value)}
//                     placeholder="Enter cheque number"
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="bankName">Bank Name:</label>
//                   <input
//                     type="text"
//                     id="bankName"
//                     value={bankName}
//                     onChange={(e) => setBankName(e.target.value)}
//                     placeholder="Enter bank name"
//                     required
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="chequeDate">Cheque Date:</label>
//                   <input
//                     type="date"
//                     id="chequeDate"
//                     value={chequeDate}
//                     onChange={(e) => setChequeDate(e.target.value)}
//                     required
//                   />
//                 </div>
//               </>
//             )}
//             <button type="submit" className="btn btn-pay">Submit Payment</button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SaleDetails;






import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/saledetails.css';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [error, setError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [chequeNumber, setChequeNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [chequeDate, setChequeDate] = useState('');

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/sales/${id}`);
        setSale(res.data);
      } catch (err) {
        console.error('Error fetching sale details:', err);
        setError('Failed to fetch sale details. Please try again.');
      }
    };

    fetchSaleDetails();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    if (paymentAmount > sale.remaining_credit) {
      setError('Payment amount cannot exceed remaining credit.');
      return;
    }

    if (paymentMethod === 'cheque') {
      if (!chequeNumber || !bankName || !chequeDate) {
        setError('Please fill in all cheque details.');
        return;
      }
    }

    try {
      if (paymentMethod === 'credit') {
        const creditPayment = sale.payments.find(p => p.method === 'credit');
        if (!creditPayment) {
          setError('No credit payment record found for this sale.');
          return;
        }

        const res = await axios.put(`http://localhost:5000/payments/${creditPayment.id}/pay-credit`, {
          amount_paid: parseFloat(paymentAmount)
        });

        if (res.status === 200) {
          // Refresh sale details
          const updatedRes = await axios.get(`http://localhost:5000/sales/${id}`);
          setSale(updatedRes.data);
          setPaymentAmount('');
          setError('');
        }
      } else {
        // Handle cash or cheque payment
        const paymentData = {
          sale_id: sale.sale_id,
          method: paymentMethod,
          amount: parseFloat(paymentAmount)
        };

        if (paymentMethod === 'cheque') {
          paymentData.cheque_number = chequeNumber;
          paymentData.bank_name = bankName;
          paymentData.cheque_date = chequeDate;
        }

        const res = await axios.post(`http://localhost:5000/pay-sale`, paymentData);

        if (res.status === 201) {
          // Refresh sale details
          const updatedRes = await axios.get(`http://localhost:5000/sales/${id}`);
          setSale(updatedRes.data);
          setPaymentAmount('');
          setPaymentMethod('credit');
          setChequeNumber('');
          setBankName('');
          setChequeDate('');
          setError('');
        }
      }
    } catch (err) {
      console.error('Error processing payment:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to process payment. Please try again.');
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!sale) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="sale-details-container">
      <h2>Sale Details - Bill No: {sale.bill_no}</h2>
      <button onClick={() => navigate('/sales-summary')} className="btn btn-back">
        Back to Sales Summary
      </button>

      <div className="sale-info">
        <h3>Sale Information</h3>
        <p><strong>Date:</strong> {new Date(sale.date).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> {sale.customer_name}</p>
        <p><strong>Total Amount:</strong> Rs. {parseFloat(sale.total_amount).toFixed(2)}</p>
        <p><strong>Total Paid:</strong> Rs. {parseFloat(sale.total_paid).toFixed(2)}</p>
        <p><strong>Remaining Credit:</strong> Rs. {parseFloat(sale.remaining_credit).toFixed(2)}</p>
        <p><strong>Payment Method:</strong> {sale.method}</p>
        <p><strong>Status:</strong> {sale.status}</p>
      </div>

      <div className="sale-items">
        <h3>Sale Items</h3>
        <table className="sale-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No items found.</td>
              </tr>
            ) : (
              sale.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>Rs. {parseFloat(item.price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>Rs. {parseFloat(item.total_price).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="payment-history">
        <h3>Payment History</h3>
        <table className="payment-history-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Amount</th>
              <th>Cheque Number</th>
              <th>Bank Name</th>
              <th>Cheque Date</th>
              <th>Cheque Status</th>
            </tr>
          </thead>
          <tbody>
            {sale.payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No payments found.</td>
              </tr>
            ) : (
              sale.payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</td>
                  <td>Rs. {parseFloat(payment.amount).toFixed(2)}</td>
                  <td>{payment.cheque_number || '-'}</td>
                  <td>{payment.bank_name || '-'}</td>
                  <td>{payment.cheque_date ? new Date(payment.cheque_date).toLocaleDateString() : '-'}</td>
                  <td>{payment.cheque_status || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sale.remaining_credit > 0 && (
        <div className="payment-form">
          <h3>Pay Remaining Credit</h3>
          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label htmlFor="paymentAmount">Payment Amount (Rs.):</label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method:</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="credit">Credit</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            {paymentMethod === 'cheque' && (
              <>
                <div className="form-group">
                  <label htmlFor="chequeNumber">Cheque Number:</label>
                  <input
                    type="text"
                    id="chequeNumber"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="Enter cheque number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bankName">Bank Name:</label>
                  <input
                    type="text"
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="chequeDate">Cheque Date:</label>
                  <input
                    type="date"
                    id="chequeDate"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-pay">Submit Payment</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SaleDetails;
