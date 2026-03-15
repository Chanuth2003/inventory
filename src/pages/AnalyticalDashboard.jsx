

// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import Chart from 'chart.js/auto';
// import ChartDataLabels from 'chartjs-plugin-datalabels'; 
// import '../styles/analyticaldashboard.css';

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="error-message">
//           <h2>Error: Something went wrong</h2>
//           <p>{this.state.error?.message || 'Unknown error'}</p>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const AnalyticalManagement = () => {
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [threshold, setThreshold] = useState(50);
//   const [productSearch, setProductSearch] = useState('');
//   const [customerSearch, setCustomerSearch] = useState('');
//   const [analyticsData, setAnalyticsData] = useState({
//     totalSales: 0,
//     totalOrders: 0,
//     topProducts: [],
//     salesByDate: [],
//     paymentBreakdown: [],
//     customerGrowth: 0,
//     topCustomers: [],
//     inventorySummary: [],
//     lowStockItems: [],
//   });
//   const [error, setError] = useState('');

//   const salesChartRef = useRef(null);
//   const productsChartRef = useRef(null);
//   const paymentChartRef = useRef(null);
//   const customersChartRef = useRef(null);
//   const inventoryChartRef = useRef(null);

//   const salesChartInstanceRef = useRef(null);
//   const productsChartInstanceRef = useRef(null);
//   const paymentChartInstanceRef = useRef(null);
//   const customersChartInstanceRef = useRef(null);
//   const inventoryChartInstanceRef = useRef(null);

//   // Default date: past 30 days
//   useEffect(() => {
//     const today = new Date();
//     const pastMonth = new Date(today);
//     pastMonth.setDate(today.getDate() - 30);
//     setStartDate(pastMonth.toISOString().split('T')[0]);
//     setEndDate(today.toISOString().split('T')[0]);
//   }, []);

//   // Fetch analytics
//   const fetchAnalytics = useCallback(async () => {
//     if (!startDate || !endDate) {
//       setError('Please select both start and end dates');
//       return;
//     }
//     if (new Date(startDate) > new Date(endDate)) {
//       setError('Start date must be before end date');
//       return;
//     }

//     try {
//       const res = await fetch(
//         `http://localhost:5000/analytics?startDate=${startDate}&endDate=${endDate}&threshold=${threshold}`
//       );
//       if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
//       const data = await res.json();
//       setAnalyticsData({
//         totalSales: data.totalSales || 0,
//         totalOrders: data.totalOrders || 0,
//         topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
//         salesByDate: Array.isArray(data.salesByDate) ? data.salesByDate : [],
//         paymentBreakdown: Array.isArray(data.paymentBreakdown) ? data.paymentBreakdown : [],
//         customerGrowth: data.customerGrowth || 0,
//         topCustomers: Array.isArray(data.topCustomers) ? data.topCustomers : [],
//         inventorySummary: Array.isArray(data.inventorySummary) ? data.inventorySummary : [],
//         lowStockItems: Array.isArray(data.lowStockItems) ? data.lowStockItems : [],
//       });
//       setError('');
//     } catch (err) {
//       setError(`Failed to fetch analytics: ${err.message}`);
//     }
//   }, [startDate, endDate, threshold]);

//   useEffect(() => {
//     if (startDate && endDate) fetchAnalytics();
//   }, [startDate, endDate, threshold, fetchAnalytics]);

//   // Filter logic for products & customers
//   const filteredProducts = useMemo(() => {
//     if (!productSearch.trim()) return analyticsData.topProducts;
//     const searchList = productSearch
//       .split(',')
//       .map(p => p.trim().toLowerCase())
//       .filter(Boolean);

//     return analyticsData.topProducts.filter(p =>
//       searchList.includes((p.product || '').toLowerCase())
//     );
//   }, [analyticsData.topProducts, productSearch]);

//   const filteredCustomers = useMemo(() => {
//     if (!customerSearch.trim()) return analyticsData.topCustomers;
//     const searchList = customerSearch
//       .split(',')
//       .map(c => c.trim().toLowerCase())
//       .filter(Boolean);

//     return analyticsData.topCustomers.filter(c =>
//       searchList.includes((c.customer || '').toLowerCase())
//     );
//   }, [analyticsData.topCustomers, customerSearch]);

//   // Calculate extra metric
//   const averageOrderValue =
//     analyticsData.totalOrders > 0
//       ? (analyticsData.totalSales / analyticsData.totalOrders).toFixed(2)
//       : 0;

//   // Render charts
//   useEffect(() => {
//     // Destroy existing charts before re-render
//     if (salesChartInstanceRef.current) salesChartInstanceRef.current.destroy();
//     if (productsChartInstanceRef.current) productsChartInstanceRef.current.destroy();
//     if (paymentChartInstanceRef.current) paymentChartInstanceRef.current.destroy();
//     if (customersChartInstanceRef.current) customersChartInstanceRef.current.destroy();
//     if (inventoryChartInstanceRef.current) inventoryChartInstanceRef.current.destroy();

//     // Sales Trend
//     if (salesChartRef.current && analyticsData.salesByDate.length > 0) {
//       salesChartInstanceRef.current = new Chart(salesChartRef.current, {
//         type: 'line',
//         data: {
//           labels: analyticsData.salesByDate.map(d => d.saleDate || ''),
//           datasets: [{
//             label: 'Daily Sales',
//             data: analyticsData.salesByDate.map(d => d.dailyTotal || 0),
//             borderColor: 'rgba(75, 192, 192, 1)',
//             backgroundColor: 'rgba(75, 192, 192, 0.2)',
//             fill: true,
//             tension: 0.4,
//           }],
//         },
//         options: {
//           responsive: true,
//           plugins: { title: { display: true, text: 'Sales Trend' } },
//         },
//       });
//     }

//     // Products Chart
//     if (productsChartRef.current && filteredProducts.length > 0) {
//       productsChartInstanceRef.current = new Chart(productsChartRef.current, {
//         type: 'bar',
//         data: {
//           labels: filteredProducts.map(p => p.product || ''),
//           datasets: [{
//             label: 'Quantity Sold',
//             data: filteredProducts.map(p => p.qty || 0),
//             backgroundColor: 'rgba(255, 99, 132, 0.5)',
//             borderColor: 'rgba(255, 99, 132, 1)',
//             borderWidth: 1,
//           }],
//         },
//         options: {
//           responsive: true,
//           indexAxis: 'y',
//           maintainAspectRatio: false,
//           plugins: { title: { display: true, text: 'Products Comparison' } },
//         },
//       });
//     }

//     // Payment Breakdown
//     if (paymentChartRef.current && analyticsData.paymentBreakdown.length > 0) {
//       paymentChartInstanceRef.current = new Chart(paymentChartRef.current, {
//         type: 'pie',
//         plugins: [ChartDataLabels],
//         data: {
//           labels: analyticsData.paymentBreakdown.map(p => p.payment_method || ''),
//           datasets: [{
//             label: 'Payment Amount',
//             data: analyticsData.paymentBreakdown.map(item => item.total || 0),
//             backgroundColor: [
//               'rgba(75, 192, 192, 0.5)',
//               'rgba(255, 99, 132, 0.5)',
//               'rgba(54, 162, 235, 0.5)',
//               'rgba(255, 206, 86, 0.5)',
//               'rgba(153, 102, 255, 0.5)',
//             ],
//           }],
//         },
//         options: {
//           plugins: {
//             datalabels: {
//               color: '#fff',
//               font: { weight: 'bold', size: 14 },
//               formatter: (value, ctx) => {
//                 const dataset = ctx.chart.data.datasets[0];
//                 const total = dataset.data.reduce((acc, val) => acc + val, 0);
//                 const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
//                 return `${percentage}%`;
//               },
//             },
//           },
//         },
//       });
//     }

//     // Customers Chart
//     if (customersChartRef.current && filteredCustomers.length > 0) {
//       customersChartInstanceRef.current = new Chart(customersChartRef.current, {
//         type: 'bar',
//         data: {
//           labels: filteredCustomers.map(c => c.customer || ''),
//           datasets: [{
//             label: 'Total Spent (LKR)',
//             data: filteredCustomers.map(c => c.total_spent || 0),
//             backgroundColor: 'rgba(54, 162, 235, 0.5)',
//             borderColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 1,
//           }],
//         },
//         options: {
//           responsive: true,
//           indexAxis: 'y',
//           maintainAspectRatio: false,
//           plugins: { title: { display: true, text: 'Customers Comparison' } },
//         },
//       });
//     }

//     // Inventory Chart
//     if (inventoryChartRef.current && analyticsData.inventorySummary.length > 0) {
//       inventoryChartInstanceRef.current = new Chart(inventoryChartRef.current, {
//         type: 'bar',
//         data: {
//           labels: analyticsData.inventorySummary.map(i => i.product || ''),
//           datasets: [{
//             label: 'Stock Quantity',
//             data: analyticsData.inventorySummary.map(i => i.total_quantity || 0),
//             backgroundColor: 'rgba(153, 102, 255, 0.5)',
//             borderColor: 'rgba(153, 102, 255, 1)',
//             borderWidth: 1,
//           }],
//         },
//         options: {
//           indexAxis: 'y',
//           responsive: true,
//           plugins: { title: { display: true, text: 'Current Inventory Levels' } },
//         },
//       });
//     }
//   }, [analyticsData, filteredProducts, filteredCustomers]);

//   return (
//     <ErrorBoundary>
//       <div className="analytical-dashboard-container">
//         <h2 className="dashboard-title">Analytical Dashboard</h2>
//         {error && <div className="error-message">{error}</div>}

//         {/* Date selector */}
//         <div className="date-range-selector">
//           <div className="form-group">
//             <label>Start Date</label>
//             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
//           </div>
//           <div className="form-group">
//             <label>End Date</label>
//             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
//           </div>
//           <button onClick={fetchAnalytics} className="btn btn-fetch">Fetch Data</button>
//         </div>

//         {/* Summary */}
//         <div className="analytics-summary">
//           <h3>Key Metrics Summary</h3>
//           <div className="summary-cards">
//             <div className="summary-card">
//               <h4>Total Sales (LKR)</h4>
//               <p>{Number(analyticsData.totalSales).toFixed(2)}</p>
//             </div>
//             <div className="summary-card">
//               <h4>Total Orders</h4>
//               <p>{analyticsData.totalOrders}</p>
//             </div>
//             <div className="summary-card">
//               <h4>Average Order Value (LKR)</h4>
//               <p>{averageOrderValue}</p>
//             </div>
//             <div className="summary-card">
//               <h4>New Customers</h4>
//               <p>{analyticsData.customerGrowth}</p>
//             </div>
//           </div>
//         </div>

//         {/* Charts */}
//         <div className="analytics-charts">
//           <div className="chart-section">
//             <h3>Sales Trend</h3>
//             <canvas ref={salesChartRef}></canvas>
//           </div>

//           <div className="chart-section">
//             <h3>Products</h3>
//             <div className="search-group">
//               <label>Search Products (comma-separated)</label>
//               <input
//                 type="text"
//                 value={productSearch}
//                 onChange={e => setProductSearch(e.target.value)}
//                 placeholder="e.g., Product1, Product2"
//               />
//             </div>
//             <div className="scrollable-chart">
//               <canvas ref={productsChartRef}></canvas>
//             </div>
//           </div>

//           <div className="chart-section">
//             <h3>Payment Breakdown</h3>
//             <canvas ref={paymentChartRef}></canvas>
//           </div>

//           <div className="chart-section">
//             <h3>Customers</h3>
//             <div className="search-group">
//               <label>Search Customers (comma-separated)</label>
//               <input
//                 type="text"
//                 value={customerSearch}
//                 onChange={e => setCustomerSearch(e.target.value)}
//                 placeholder="e.g., Customer1, Customer2"
//               />
//             </div>
//             <div className="scrollable-chart">
//               <canvas ref={customersChartRef}></canvas>
//             </div>
//           </div>

//           <div className="chart-section">
//             <h3>Inventory Levels</h3>
//             <canvas ref={inventoryChartRef}></canvas>
//           </div>
//         </div>

//         {/* Low stock */}
//         <div className="low-stock-section">
//           <h3>Low Stock Alert</h3>
//           <div className="threshold-selector">
//             <label>Low Stock Threshold</label>
//             <input
//               type="number"
//               value={threshold}
//               onChange={e => setThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
//               min="0"
//               step="1"
//             />
//           </div>
//           {analyticsData.lowStockItems.length > 0 ? (
//             <table className="low-stock-table">
//               <thead>
//                 <tr>
//                   <th>Product</th>
//                   <th>Quantity</th>
//                   <th>Threshold</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {analyticsData.lowStockItems.map(item => (
//                   <tr key={item.id} className={item.total_quantity < threshold ? 'low-stock-highlight' : ''}>
//                     <td>{item.product || 'N/A'}</td>
//                     <td>{item.total_quantity || 0}</td>
//                     <td>{threshold}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No low stock items found.</p>
//           )}
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default AnalyticalManagement;
































import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 
import '../styles/analyticaldashboard.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <h2>Error: Something went wrong</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const AnalyticalManagement = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [threshold, setThreshold] = useState(50);
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 0,
    totalOrders: 0,
    topProducts: [],
    salesByDate: [],
    paymentBreakdown: [],
    customerGrowth: 0,
    topCustomers: [],
    inventorySummary: [],
    lowStockItems: [],
  });
  const [error, setError] = useState('');

  const salesChartRef = useRef(null);
  const productsChartRef = useRef(null);
  const paymentChartRef = useRef(null);
  const customersChartRef = useRef(null);
  const inventoryChartRef = useRef(null);

  const salesChartInstanceRef = useRef(null);
  const productsChartInstanceRef = useRef(null);
  const paymentChartInstanceRef = useRef(null);
  const customersChartInstanceRef = useRef(null);
  const inventoryChartInstanceRef = useRef(null);

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur(); // Optional: blur to prevent further scroll interaction
  };

  // Default date: past 30 days
  useEffect(() => {
    const today = new Date();
    const pastMonth = new Date(today);
    pastMonth.setDate(today.getDate() - 30);
    setStartDate(pastMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/analytics?startDate=${startDate}&endDate=${endDate}&threshold=${threshold}`
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setAnalyticsData({
        totalSales: data.totalSales || 0,
        totalOrders: data.totalOrders || 0,
        topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
        salesByDate: Array.isArray(data.salesByDate) ? data.salesByDate : [],
        paymentBreakdown: Array.isArray(data.paymentBreakdown) ? data.paymentBreakdown : [],
        customerGrowth: data.customerGrowth || 0,
        topCustomers: Array.isArray(data.topCustomers) ? data.topCustomers : [],
        inventorySummary: Array.isArray(data.inventorySummary) ? data.inventorySummary : [],
        lowStockItems: Array.isArray(data.lowStockItems) ? data.lowStockItems : [],
      });
      setError('');
    } catch (err) {
      setError(`Failed to fetch analytics: ${err.message}`);
    }
  }, [startDate, endDate, threshold]);

  useEffect(() => {
    if (startDate && endDate) fetchAnalytics();
  }, [startDate, endDate, threshold, fetchAnalytics]);

  // Filter logic for products & customers
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return analyticsData.topProducts;
    const searchList = productSearch
      .split(',')
      .map(p => p.trim().toLowerCase())
      .filter(Boolean);

    return analyticsData.topProducts.filter(p =>
      searchList.includes((p.product || '').toLowerCase())
    );
  }, [analyticsData.topProducts, productSearch]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return analyticsData.topCustomers;
    const searchList = customerSearch
      .split(',')
      .map(c => c.trim().toLowerCase())
      .filter(Boolean);

    return analyticsData.topCustomers.filter(c =>
      searchList.includes((c.customer || '').toLowerCase())
    );
  }, [analyticsData.topCustomers, customerSearch]);

  // Calculate extra metric
  const averageOrderValue =
    analyticsData.totalOrders > 0
      ? (analyticsData.totalSales / analyticsData.totalOrders).toFixed(2)
      : 0;

  // Render charts
  useEffect(() => {
    // Destroy existing charts before re-render
    if (salesChartInstanceRef.current) salesChartInstanceRef.current.destroy();
    if (productsChartInstanceRef.current) productsChartInstanceRef.current.destroy();
    if (paymentChartInstanceRef.current) paymentChartInstanceRef.current.destroy();
    if (customersChartInstanceRef.current) customersChartInstanceRef.current.destroy();
    if (inventoryChartInstanceRef.current) inventoryChartInstanceRef.current.destroy();

    // Sales Trend
    if (salesChartRef.current && analyticsData.salesByDate.length > 0) {
      salesChartInstanceRef.current = new Chart(salesChartRef.current, {
        type: 'line',
        data: {
          labels: analyticsData.salesByDate.map(d => d.saleDate || ''),
          datasets: [{
            label: 'Daily Sales',
            data: analyticsData.salesByDate.map(d => d.dailyTotal || 0),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: 'Sales Trend' } },
        },
      });
    }

    // Products Chart
    if (productsChartRef.current && filteredProducts.length > 0) {
      productsChartInstanceRef.current = new Chart(productsChartRef.current, {
        type: 'bar',
        data: {
          labels: filteredProducts.map(p => p.product || ''),
          datasets: [{
            label: 'Quantity Sold',
            data: filteredProducts.map(p => p.qty || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Products Comparison' } },
        },
      });
    }

    // Payment Breakdown
    if (paymentChartRef.current && analyticsData.paymentBreakdown.length > 0) {
      paymentChartInstanceRef.current = new Chart(paymentChartRef.current, {
        type: 'pie',
        plugins: [ChartDataLabels],
        data: {
          labels: analyticsData.paymentBreakdown.map(p => p.payment_method || 'Unknown'),
          datasets: [{
            label: 'Payment Amount',
            data: analyticsData.paymentBreakdown.map(item => item.total || 0),
            backgroundColor: [
              'rgba(59, 130, 246, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(16, 185, 129, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(153, 102, 255, 0.5)',
            ],
          }],
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Payment Breakdown' },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold', size: 14 },
              formatter: (value, ctx) => {
                const dataset = ctx.dataset;
                const total = dataset.data.reduce((acc, val) => acc + (Number(val) || 0), 0);
                const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0;
                return `${percentage}%`;
              },
            },
          },
        },
      });
    }

    // Customers Chart
    if (customersChartRef.current && filteredCustomers.length > 0) {
      customersChartInstanceRef.current = new Chart(customersChartRef.current, {
        type: 'bar',
        data: {
          labels: filteredCustomers.map(c => c.customer || ''),
          datasets: [{
            label: 'Total Spent (LKR)',
            data: filteredCustomers.map(c => c.total_spent || 0),
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Customers Comparison' } },
        },
      });
    }

    // Inventory Chart
    if (inventoryChartRef.current && analyticsData.inventorySummary.length > 0) {
      inventoryChartInstanceRef.current = new Chart(inventoryChartRef.current, {
        type: 'bar',
        data: {
          labels: analyticsData.inventorySummary.map(i => i.product || ''),
          datasets: [{
            label: 'Stock Quantity',
            data: analyticsData.inventorySummary.map(i => i.total_quantity || 0),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { title: { display: true, text: 'Current Inventory Levels' } },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (salesChartInstanceRef.current) salesChartInstanceRef.current.destroy();
      if (productsChartInstanceRef.current) productsChartInstanceRef.current.destroy();
      if (paymentChartInstanceRef.current) paymentChartInstanceRef.current.destroy();
      if (customersChartInstanceRef.current) customersChartInstanceRef.current.destroy();
      if (inventoryChartInstanceRef.current) inventoryChartInstanceRef.current.destroy();
    };
  }, [analyticsData, filteredProducts, filteredCustomers]);

  return (
    <ErrorBoundary>
      <div className="analytical-dashboard-container">
        <h2 className="dashboard-title">Analytical Dashboard</h2>
        {error && <div className="error-message">{error}</div>}

        {/* Date selector */}
        <div className="date-range-selector">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button onClick={fetchAnalytics} className="btn btn-fetch">Fetch Data</button>
        </div>

        {/* Summary */}
        <div className="analytics-summary">
          <h3>Key Metrics Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <h4>Total Sales (LKR)</h4>
              <p>{Number(analyticsData.totalSales).toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h4>Total Orders</h4>
              <p>{analyticsData.totalOrders}</p>
            </div>
            <div className="summary-card">
              <h4>Average Order Value (LKR)</h4>
              <p>{averageOrderValue}</p>
            </div>
            <div className="summary-card">
              <h4>New Customers</h4>
              <p>{analyticsData.customerGrowth}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="analytics-charts">
          <div className="chart-section">
            <h3>Sales Trend</h3>
            <canvas ref={salesChartRef}></canvas>
          </div>

          <div className="chart-section">
            <h3>Products</h3>
            <div className="search-group">
              <label>Search Products (comma-separated)</label>
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="e.g., Product1, Product2"
              />
            </div>
            <div className="scrollable-chart">
              <canvas ref={productsChartRef}></canvas>
            </div>
          </div>

          <div className="chart-section">
            <h3>Payment Breakdown</h3>
            <canvas ref={paymentChartRef}></canvas>
          </div>

          <div className="chart-section">
            <h3>Customers</h3>
            <div className="search-group">
              <label>Search Customers (comma-separated)</label>
              <input
                type="text"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="e.g., Customer1, Customer2"
              />
            </div>
            <div className="scrollable-chart">
              <canvas ref={customersChartRef}></canvas>
            </div>
          </div>

          <div className="chart-section">
            <h3>Inventory Levels</h3>
            <canvas ref={inventoryChartRef}></canvas>
          </div>
        </div>

        {/* Low stock */}
        <div className="low-stock-section">
          <h3>Low Stock Alert</h3>
          <div className="threshold-selector">
            <label>Low Stock Threshold</label>
            <input
              type="number"
              value={threshold}
              onChange={e => setThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
              onWheel={handleWheel}
              min="0"
              step="1"
              placeholder="Enter threshold"
            />
          </div>
          {analyticsData.lowStockItems.length > 0 ? (
            <table className="low-stock-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.lowStockItems.map(item => (
                  <tr key={item.id} className={item.total_quantity < threshold ? 'low-stock-highlight' : ''}>
                    <td>{item.product || 'N/A'}</td>
                    <td>{item.total_quantity || 0}</td>
                    <td>{threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No low stock items found.</p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AnalyticalManagement;