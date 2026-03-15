


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/salessummary.css';

// const SalesSummary = () => {
//   const navigate = useNavigate();
//   const [sales, setSales] = useState([]);
//   const [filteredSales, setFilteredSales] = useState([]);
//   const [error, setError] = useState('');
//   const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
//   const [searchTerm, setSearchTerm] = useState('');
//   const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'daily', 'weekly', 'monthly', 'yearly'
//   const [selectedDate, setSelectedDate] = useState('');
//   const [salesSummary, setSalesSummary] = useState({
//     daily: { total: 0, count: 0 },
//     weekly: { total: 0, count: 0 },
//     monthly: { total: 0, count: 0 },
//     yearly: { total: 0, count: 0 }
//   });

//   useEffect(() => {
//     const fetchSales = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/sales');
//         const salesData = res.data;
//         setSales(salesData);
//         setFilteredSales(salesData);
//         calculateSummaries(salesData);
//       } catch (err) {
//         console.error('Error fetching sales:', err);
//         setError('Failed to fetch sales data. Please try again.');
//       }
//     };

//     fetchSales();
//   }, []);

//   // Calculate daily, weekly, monthly, yearly summaries
//   const calculateSummaries = (salesData) => {
//     const now = new Date();
//     const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const startOfYear = new Date(now.getFullYear(), 0, 1);

//     const summaries = {
//       daily: { total: 0, count: 0 },
//       weekly: { total: 0, count: 0 },
//       monthly: { total: 0, count: 0 },
//       yearly: { total: 0, count: 0 }
//     };

//     salesData.forEach(sale => {
//       const saleDate = new Date(sale.date);
//       const total = parseFloat(sale.total_amount) || 0;

//       if (saleDate >= startOfDay) {
//         summaries.daily.total += total;
//         summaries.daily.count += 1;
//       }
//       if (saleDate >= startOfWeek) {
//         summaries.weekly.total += total;
//         summaries.weekly.count += 1;
//       }
//       if (saleDate >= startOfMonth) {
//         summaries.monthly.total += total;
//         summaries.monthly.count += 1;
//       }
//       if (saleDate >= startOfYear) {
//         summaries.yearly.total += total;
//         summaries.yearly.count += 1;
//       }
//     });

//     setSalesSummary(summaries);
//   };

//   // Handle search, sort, and date filter
//   useEffect(() => {
//     let result = [...sales];

//     // Filter by search term
//     if (searchTerm) {
//       result = result.filter(sale =>
//         sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Filter by selected date or time period
//     if (selectedDate) {
//       const selected = new Date(selectedDate);
//       const startOfSelected = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
//       const endOfSelected = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
//       result = result.filter(sale => {
//         const saleDate = new Date(sale.date);
//         return saleDate >= startOfSelected && saleDate < endOfSelected;
//       });
//     } else if (timeFilter !== 'all') {
//       const now = new Date();
//       let startDate;
//       if (timeFilter === 'daily') {
//         startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       } else if (timeFilter === 'weekly') {
//         startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//       } else if (timeFilter === 'monthly') {
//         startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//       } else if (timeFilter === 'yearly') {
//         startDate = new Date(now.getFullYear(), 0, 1);
//       }
//       result = result.filter(sale => new Date(sale.date) >= startDate);
//     }

//     // Sort by date
//     result.sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);
//       return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
//     });

//     setFilteredSales(result);
//   }, [sales, searchTerm, sortOrder, timeFilter, selectedDate]);

//   const handleViewDetails = (saleId) => {
//     navigate(`/sales/${saleId}`);
//   };

//   const handleViewInvoice = (saleId) => {
//     navigate(`/invoice/${saleId}`);
//   };

//   const handleChequeStatus = async (paymentId, status) => {
//     try {
//       const res = await axios.put(`http://localhost:5000/payments/${paymentId}/update-cheque-status`, {
//         cheque_status: status
//       });

//       if (res.status === 200) {
//         const updatedRes = await axios.get('http://localhost:5000/sales');
//         setSales(updatedRes.data);
//         setFilteredSales(updatedRes.data);
//         calculateSummaries(updatedRes.data);
//         setError('');
//       }
//     } catch (err) {
//       console.error(`Error updating cheque status to ${status}:`, err);
//       setError(err.response?.data?.error || `Failed to update cheque status to ${status}.`);
//     }
//   };

//   if (error) {
//     return <div className="error-message">{error}</div>;
//   }

//   return (
//     <div className="sales-summary-container">
//       <h2>Sales Summary</h2>

//       {/* Summary Cards */}
//       <div className="summary-cards">
//         <div className="summary-card">
//           <h3>Daily Sales</h3>
//           <p>Total: Rs. {salesSummary.daily.total.toFixed(2)}</p>
//           <p>Count: {salesSummary.daily.count}</p>
//         </div>
//         <div className="summary-card">
//           <h3>Weekly Sales</h3>
//           <p>Total: Rs. {salesSummary.weekly.total.toFixed(2)}</p>
//           <p>Count: {salesSummary.weekly.count}</p>
//         </div>
//         <div className="summary-card">
//           <h3>Monthly Sales</h3>
//           <p>Total: Rs. {salesSummary.monthly.total.toFixed(2)}</p>
//           <p>Count: {salesSummary.monthly.count}</p>
//         </div>
//         <div className="summary-card">
//           <h3>Yearly Sales</h3>
//           <p>Total: Rs. {salesSummary.yearly.total.toFixed(2)}</p>
//           <p>Count: {salesSummary.yearly.count}</p>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="controls">
//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Search by customer name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div className="date-picker">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             placeholder="Select a date"
//           />
//           {selectedDate && (
//             <button
//               onClick={() => setSelectedDate('')}
//               className="clear-date-button"
//             >
//               Clear Date
//             </button>
//           )}
//         </div>
//         <div className="sort-filter">
//           <select
//             value={timeFilter}
//             onChange={(e) => setTimeFilter(e.target.value)}
//             disabled={selectedDate}
//           >
//             <option value="all">All Sales</option>
//             <option value="daily">Daily</option>
//             <option value="weekly">Weekly</option>
//             <option value="monthly">Monthly</option>
//             <option value="yearly">Yearly</option>
//           </select>
//           <button
//             onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
//             className="sort-button"
//           >
//             Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
//           </button>
//         </div>
//       </div>

//       {/* Sales Table */}
//       <div className="table-card">
//         <div className="table-wrapper">
//           <table className="sales-table">
//             <thead>
//               <tr>
//                 <th>Bill No</th>
//                 <th>Date</th>
//                 <th>Customer</th>
//                 <th>Total Amount</th>
//                 <th>Total Paid</th>
//                 <th>Debt</th>
//                 <th>Payment Method</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSales.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="no-data">No sales found.</td>
//                 </tr>
//               ) : (
//                 filteredSales.map((sale) => (
//                   <tr key={sale.sale_id} className="table-row">
//                     <td>{sale.bill_no}</td>
//                     <td>{new Date(sale.date).toLocaleDateString()}</td>
//                     <td>{sale.customer_name}</td>
//                     <td>Rs. {sale.total_amount}</td>
//                     <td>Rs. {sale.total_paid}</td>
//                     <td>Rs. {sale.remaining_credit}</td>
//                     <td>{sale.method}</td>
//                     <td>
//                       <span
//                         className={`status-badge ${
//                           sale.status === 'Complete' ? 'status-complete' : 'status-pending'
//                         }`}
//                       >
//                         {sale.status}
//                       </span>
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => handleViewDetails(sale.sale_id)}
//                         className="btn btn-details"
//                       >
//                         View Details
//                       </button>
//                       <button
//                         onClick={() => handleViewInvoice(sale.sale_id)}
//                         className="btn btn-invoice"
//                       >
//                         Invoice
//                       </button>
//                       {sale.payments
//                         .filter((payment) => payment.method === 'cheque' && payment.cheque_status === 'pending')
//                         .map((payment) => (
//                           <div key={payment.id} className="cheque-actions">
//                             <button
//                               onClick={() => handleChequeStatus(payment.id, 'processed')}
//                               className="btn btn-processed"
//                             >
//                               Processed
//                             </button>
//                             <button
//                               onClick={() => handleChequeStatus(payment.id, 'returned')}
//                               className="btn btn-returned"
//                             >
//                               Returned
//                             </button>
//                           </div>
//                         ))}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesSummary;






import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/salessummary.css';

const SalesSummary = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'daily', 'weekly', 'monthly', 'yearly'
  const [selectedDate, setSelectedDate] = useState('');
  const [salesSummary, setSalesSummary] = useState({
    daily: { total: 0, count: 0 },
    weekly: { total: 0, count: 0 },
    monthly: { total: 0, count: 0 },
    yearly: { total: 0, count: 0 }
  });

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get('http://localhost:5000/sales');
        const salesData = res.data;
        setSales(salesData);
        setFilteredSales(salesData);
        calculateSummaries(salesData);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Failed to fetch sales data. Please try again.');
      }
    };

    fetchSales();
  }, []);

  // Calculate daily, weekly, monthly, yearly summaries
  const calculateSummaries = (salesData) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const summaries = {
      daily: { total: 0, count: 0 },
      weekly: { total: 0, count: 0 },
      monthly: { total: 0, count: 0 },
      yearly: { total: 0, count: 0 }
    };

    salesData.forEach(sale => {
      const saleDate = new Date(sale.date);
      const total = parseFloat(sale.total_amount) || 0;

      if (saleDate >= startOfDay) {
        summaries.daily.total += total;
        summaries.daily.count += 1;
      }
      if (saleDate >= startOfWeek) {
        summaries.weekly.total += total;
        summaries.weekly.count += 1;
      }
      if (saleDate >= startOfMonth) {
        summaries.monthly.total += total;
        summaries.monthly.count += 1;
      }
      if (saleDate >= startOfYear) {
        summaries.yearly.total += total;
        summaries.yearly.count += 1;
      }
    });

    setSalesSummary(summaries);
  };

  // Handle search, sort, and date filter
  useEffect(() => {
    let result = [...sales];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(sale =>
        sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected date or time period
    if (selectedDate) {
      const selected = new Date(selectedDate);
      const startOfSelected = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
      const endOfSelected = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
      result = result.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startOfSelected && saleDate < endOfSelected;
      });
    } else if (timeFilter !== 'all') {
      const now = new Date();
      let startDate;
      if (timeFilter === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (timeFilter === 'weekly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      } else if (timeFilter === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (timeFilter === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      result = result.filter(sale => new Date(sale.date) >= startDate);
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredSales(result);
  }, [sales, searchTerm, sortOrder, timeFilter, selectedDate]);

  const handleViewDetails = (saleId) => {
    navigate(`/sales/${saleId}`);
  };

  const handleViewInvoice = (saleId) => {
    navigate(`/invoice/${saleId}`);
  };

  const handleChequeStatus = async (paymentId, status) => {
    try {
      const res = await axios.put(`http://localhost:5000/payments/${paymentId}/update-cheque-status`, {
        cheque_status: status
      });

      if (res.status === 200) {
        const updatedRes = await axios.get('http://localhost:5000/sales');
        setSales(updatedRes.data);
        setFilteredSales(updatedRes.data);
        calculateSummaries(updatedRes.data);
        setError('');
      }
    } catch (err) {
      console.error(`Error updating cheque status to ${status}:`, err);
      setError(err.response?.data?.error || `Failed to update cheque status to ${status}.`);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="sales-summary-container">
      <h2>Sales Summary</h2>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Daily Sales</h3>
          <p>Total: Rs. {salesSummary.daily.total.toFixed(2)}</p>
          <p>Count: {salesSummary.daily.count}</p>
        </div>
        <div className="summary-card">
          <h3>Weekly Sales</h3>
          <p>Total: Rs. {salesSummary.weekly.total.toFixed(2)}</p>
          <p>Count: {salesSummary.weekly.count}</p>
        </div>
        <div className="summary-card">
          <h3>Monthly Sales</h3>
          <p>Total: Rs. {salesSummary.monthly.total.toFixed(2)}</p>
          <p>Count: {salesSummary.monthly.count}</p>
        </div>
        <div className="summary-card">
          <h3>Yearly Sales</h3>
          <p>Total: Rs. {salesSummary.yearly.total.toFixed(2)}</p>
          <p>Count: {salesSummary.yearly.count}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="date-picker">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder="Select a date"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="clear-date-button"
            >
              Clear Date
            </button>
          )}
        </div>
        <div className="sort-filter">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            disabled={selectedDate}
          >
            <option value="all">All Sales</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-button"
          >
            Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Total Paid</th>
                <th>Debt</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No sales found.</td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.sale_id} className="table-row">
                    <td>{sale.bill_no}</td>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                    <td>{sale.customer_name}</td>
                    <td>Rs. {parseFloat(sale.total_amount).toFixed(2)}</td>
                    <td>Rs. {parseFloat(sale.total_paid).toFixed(2)}</td>
                    <td>Rs. {parseFloat(sale.remaining_credit).toFixed(2)}</td>
                    <td>{sale.method}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          sale.status === 'Complete' ? 'status-complete' : 'status-pending'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(sale.sale_id)}
                        className="btn btn-details"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleViewInvoice(sale.sale_id)}
                        className="btn btn-invoice"
                      >
                        Invoice
                      </button>
                      {sale.payments
                        .filter((payment) => payment.method === 'cheque' && payment.cheque_status === 'pending')
                        .map((payment) => (
                          <div key={payment.id} className="cheque-actions">
                            <button
                              onClick={() => handleChequeStatus(payment.id, 'processed')}
                              className="btn btn-processed"
                            >
                              Processed
                            </button>
                            <button
                              onClick={() => handleChequeStatus(payment.id, 'returned')}
                              className="btn btn-returned"
                            >
                              Returned
                            </button>
                          </div>
                        ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;