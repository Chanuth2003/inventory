// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../utils/api';
// import '../styles/salessummary.css';

// const SalesSummary = () => {
//   const navigate = useNavigate();
//   const [sales, setSales] = useState([]);
//   const [filteredSales, setFilteredSales] = useState([]);
//   const [error, setError] = useState('');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [timeFilter, setTimeFilter] = useState('all');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [salesSummary, setSalesSummary] = useState({
//     daily: { total: 0, count: 0 },
//     weekly: { total: 0, count: 0 },
//     monthly: { total: 0, count: 0 },
//     yearly: { total: 0, count: 0 }
//   });

//   // Fetch Sales Data
//   useEffect(() => {
//     const fetchSales = async () => {
//       try {
//         const response = await api.get('/api/sales');
//         const salesData = response.data || [];
//         setSales(salesData);
//         setFilteredSales(salesData);
//         calculateSummaries(salesData);
//       } catch (err) {
//         console.error('Error fetching sales:', err);
//         setError('Failed to fetch sales data. Please login again.');
//         if (err.response?.status === 401) {
//           navigate('/login');
//         }
//       }
//     };

//     fetchSales();
//   }, [navigate]);

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

//   // Filter and Sort
//   useEffect(() => {
//     let result = [...sales];

//     if (searchTerm) {
//       result = result.filter(sale =>
//         sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (selectedDate) {
//       const selected = new Date(selectedDate);
//       const start = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
//       const end = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
//       result = result.filter(sale => {
//         const saleDate = new Date(sale.date);
//         return saleDate >= start && saleDate < end;
//       });
//     } else if (timeFilter !== 'all') {
//       const now = new Date();
//       let startDate;
//       if (timeFilter === 'daily') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       else if (timeFilter === 'weekly') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//       else if (timeFilter === 'monthly') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//       else if (timeFilter === 'yearly') startDate = new Date(now.getFullYear(), 0, 1);

//       result = result.filter(sale => new Date(sale.date) >= startDate);
//     }

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

//   // handleChequeStatus was removed because it was not used; re-add or rename (e.g. _handleChequeStatus) if needed in the UI.

//   return (
//     <div className="sales-summary-container">
//       <h2>Sales Summary</h2>
//       {error && <div className="error-message">{error}</div>}

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
//           />
//           {selectedDate && <button onClick={() => setSelectedDate('')}>Clear</button>}
//         </div>
//         <div className="sort-filter">
//           <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
//             <option value="all">All Sales</option>
//             <option value="daily">Daily</option>
//             <option value="weekly">Weekly</option>
//             <option value="monthly">Monthly</option>
//             <option value="yearly">Yearly</option>
//           </select>
//           <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
//             Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
//           </button>
//         </div>
//       </div>

//       {/* Sales Table */}
//       <div className="table-card">
//         <table className="sales-table">
//           <thead>
//             <tr>
//               <th>Bill No</th>
//               <th>Date</th>
//               <th>Customer</th>
//               <th>Total Amount</th>
//               <th>Total Paid</th>
//               <th>Debt</th>
//               <th>Payment Method</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredSales.length === 0 ? (
//               <tr>
//                 <td colSpan="9" className="no-data">No sales found.</td>
//               </tr>
//             ) : (
//               filteredSales.map((sale) => (
//                 <tr key={sale.sale_id}>
//                   <td>{sale.bill_no}</td>
//                   <td>{new Date(sale.date).toLocaleDateString()}</td>
//                   <td>{sale.customer_name}</td>
//                   <td>Rs. {parseFloat(sale.total_amount || 0).toFixed(2)}</td>
//                   <td>Rs. {parseFloat(sale.total_paid || 0).toFixed(2)}</td>
//                   <td>Rs. {parseFloat(sale.remaining_credit || 0).toFixed(2)}</td>
//                   <td>{sale.method}</td>
//                   <td>
//                     <span className={`status-badge ${sale.status === 'Complete' ? 'status-complete' : 'status-pending'}`}>
//                       {sale.status}
//                     </span>
//                   </td>
//                   <td>
//                     <button onClick={() => handleViewDetails(sale.sale_id)} className="btn btn-details">
//                       Details
//                     </button>
//                     <button onClick={() => handleViewInvoice(sale.sale_id)} className="btn btn-invoice">
//                       Invoice
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default SalesSummary;

































import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/salessummary.css';

const SalesSummary = () => {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [error, setError] = useState('');
  
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const [salesSummary, setSalesSummary] = useState({
    daily: { total: 0, count: 0 },
    weekly: { total: 0, count: 0 },
    monthly: { total: 0, count: 0 },
    yearly: { total: 0, count: 0 }
  });

  // Fetch Sales Data
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get('/api/sales');
        const salesData = response.data || [];
        
        setSales(salesData);
        setFilteredSales(salesData);
        calculateSummaries(salesData);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError('Failed to fetch sales data. Please login again.');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchSales();
  }, [navigate]);

  // Calculate Daily, Weekly, Monthly, Yearly Summaries
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

  // Filter, Search & Sort
  useEffect(() => {
    let result = [...sales];

    // Search by customer name
    if (searchTerm) {
      result = result.filter(sale =>
        sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date Filter
    if (selectedDate) {
      const selected = new Date(selectedDate);
      const start = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
      const end = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
      
      result = result.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate < end;
      });
    } 
    else if (timeFilter !== 'all') {
      const now = new Date();
      let startDate;

      if (timeFilter === 'daily') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (timeFilter === 'weekly') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      else if (timeFilter === 'monthly') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      else if (timeFilter === 'yearly') startDate = new Date(now.getFullYear(), 0, 1);

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

  const handleViewInvoice = (saleId) => {
    navigate(`/invoice/${saleId}`);
  };

  return (
    <div className="sales-summary-container">
      <h2>Sales Summary</h2>
      {error && <div className="error-message">{error}</div>}

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
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate('')}>Clear</button>
          )}
        </div>

        <div className="sort-filter">
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="all">All Sales</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="table-card">
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
                <tr key={sale.sale_id}>
                  <td>{sale.bill_no}</td>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                  <td>{sale.customer_name}</td>
                  <td>Rs. {parseFloat(sale.total_amount || 0).toFixed(2)}</td>
                  <td>Rs. {parseFloat(sale.total_paid || 0).toFixed(2)}</td>
                  <td>Rs. {parseFloat(sale.remaining_credit || 0).toFixed(2)}</td>
                  <td>{sale.method}</td>
                  <td>
                    <span className={`status-badge ${sale.status === 'Complete' ? 'status-complete' : 'status-pending'}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleViewInvoice(sale.sale_id)} 
                      className="btn btn-invoice"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesSummary;