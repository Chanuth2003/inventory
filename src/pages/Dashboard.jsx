// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Chart from 'chart.js/auto';
// import '../styles/dashboard.css';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [salesSummary, setSalesSummary] = useState({ total_sales: 0, completed_sales: 0, pending_sales: 0 });
//   const [topProducts, setTopProducts] = useState([]);
//   const [inventorySummary, setInventorySummary] = useState([]);
//   const [salesTrend, setSalesTrend] = useState([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const salesChartRef = useRef(null);
//   const productsChartRef = useRef(null);
//   const trendChartRef = useRef(null);
//   const salesChartInstanceRef = useRef(null);
//   const productsChartInstanceRef = useRef(null);
//   const trendChartInstanceRef = useRef(null);
//   const [userName] = useState('Admin'); // Placeholder for user context

//   const fetchData = async () => {
//     if (!startDate || !endDate) {
//       setError('Please select both start and end dates');
//       return;
//     }
//     if (new Date(startDate) > new Date(endDate)) {
//       setError('Start date must be before end date');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       const salesRes = await fetch(`http://localhost:5000/sales/summary?startDate=${startDate}&endDate=${endDate}`);
//       if (!salesRes.ok) throw new Error(`Sales summary fetch failed: ${salesRes.status}`);
//       const salesData = await salesRes.json();

//       const productsRes = await fetch(`http://localhost:5000/sales/top-products?startDate=${startDate}&endDate=${endDate}`);
//       if (!productsRes.ok) throw new Error(`Top products fetch failed: ${productsRes.status}`);
//       const productsData = await productsRes.json();

//       const inventoryRes = await fetch('http://localhost:5000/inventory/summary');
//       if (!inventoryRes.ok) throw new Error(`Inventory summary fetch failed: ${inventoryRes.status}`);
//       const inventoryData = await inventoryRes.json();

//       // Mock sales trend data (replace with actual API call if available)
//       const trendRes = await fetch(`http://localhost:5000/sales/trend?startDate=${startDate}&endDate=${endDate}`);
//       const trendData = trendRes.ok ? await trendRes.json() : [
//         { date: '2025-09-01', sales: 1000 },
//         { date: '2025-09-02', sales: 1200 },
//         { date: '2025-09-03', sales: 900 },
//         { date: '2025-09-04', sales: 1500 },
//         { date: '2025-09-05', sales: 1300 },
//       ];

//       setSalesSummary(salesData);
//       setTopProducts(productsData);
//       setInventorySummary(inventoryData);
//       setSalesTrend(trendData);
//     } catch (err) {
//       setError(`Failed to fetch data: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (salesChartRef.current && salesSummary.total_sales > 0) {
//       if (salesChartInstanceRef.current) salesChartInstanceRef.current.destroy();
//       salesChartInstanceRef.current = new Chart(salesChartRef.current, {
//         type: 'pie',
//         data: {
//           labels: ['Completed Sales', 'Pending Sales'],
//           datasets: [{
//             data: [salesSummary.completed_sales, salesSummary.pending_sales],
//             backgroundColor: ['#10B981', '#EF4444'],
//             borderColor: ['#10B981', '#EF4444'],
//             borderWidth: 1,
//           }],
//         },
//         options: {
//           plugins: {
//             legend: { position: 'bottom', labels: { font: { size: 14 } } },
//             title: { display: true, text: `Sales Status (${startDate} to ${endDate})`, font: { size: 18 } },
//           },
//         },
//       });
//     }
//     return () => { if (salesChartInstanceRef.current) salesChartInstanceRef.current.destroy(); };
//   }, [salesSummary, startDate, endDate]);

//   useEffect(() => {
//     if (productsChartRef.current && topProducts.length > 0) {
//       if (productsChartInstanceRef.current) productsChartInstanceRef.current.destroy();
//       productsChartInstanceRef.current = new Chart(productsChartRef.current, {
//         type: 'bar',
//         data: {
//           labels: topProducts.map(p => p.product_name),
//           datasets: [{
//             label: 'Quantity Sold',
//             data: topProducts.map(p => p.total_quantity),
//             backgroundColor: '#3B82F6',
//             borderColor: '#3B82F6',
//             borderWidth: 1,
//           }],
//         },
//         options: {
//           scales: {
//             y: { beginAtZero: true, title: { display: true, text: 'Quantity', font: { size: 14 } } },
//             x: { title: { display: true, text: 'Product', font: { size: 14 } } },
//           },
//           plugins: {
//             legend: { display: false },
//             title: { display: true, text: `Top 5 Products (${startDate} to ${endDate})`, font: { size: 18 } },
//           },
//         },
//       });
//     }
//     return () => { if (productsChartInstanceRef.current) productsChartInstanceRef.current.destroy(); };
//   }, [topProducts, startDate, endDate]);

//   useEffect(() => {
//     if (trendChartRef.current && salesTrend.length > 0) {
//       if (trendChartInstanceRef.current) trendChartInstanceRef.current.destroy();
//       trendChartInstanceRef.current = new Chart(trendChartRef.current, {
//         type: 'line',
//         data: {
//           labels: salesTrend.map(t => t.date),
//           datasets: [{
//             label: 'Sales Over Time',
//             data: salesTrend.map(t => t.sales),
//             borderColor: '#8B5CF6',
//             backgroundColor: 'rgba(139, 92, 246, 0.2)',
//             fill: true,
//             tension: 0.4,
//           }],
//         },
//         options: {
//           scales: {
//             y: { beginAtZero: true, title: { display: true, text: 'Sales ($)', font: { size: 14 } } },
//             x: { title: { display: true, text: 'Date', font: { size: 14 } } },
//           },
//           plugins: {
//             legend: { display: true, position: 'top', labels: { font: { size: 14 } } },
//             title: { display: true, text: `Sales Trend (${startDate} to ${endDate})`, font: { size: 18 } },
//           },
//         },
//       });
//     }
//     return () => { if (trendChartInstanceRef.current) trendChartInstanceRef.current.destroy(); };
//   }, [salesTrend, startDate, endDate]);

//   const handleNavigation = (path) => navigate(path);

//   return (
//     <div className="dashboard-container">
//       {/* Header */}
//       <header className="dashboard-header">
//         <div>
//           <h1 className="dashboard-title">Benn Rubber ERP Dashboard</h1>
//           <p className="welcome-message">Welcome, {userName}! Here's your overview for today.</p>
//         </div>
//         <button onClick={() => handleNavigation('/')} className="logout-btn">Logout</button>
//       </header>

//       {/* Quick Actions */}
//       <div className="quick-actions">
//         <button onClick={() => handleNavigation('/add-sale')} className="action-btn">Add Sale</button>
//         <button onClick={() => handleNavigation('/add-inventory')} className="action-btn">Add Inventory</button>
//         <button onClick={() => handleNavigation('/add-customer')} className="action-btn">Add Customer</button>
//       </div>

//       {/* Quick Stats */}
//       <div className="quick-stats">
//         <div className="stat-card">
//           <h3>Total Sales</h3>
//           <p className="stat-value">{salesSummary.total_sales.toFixed(2)}</p>
//           <span className="stat-status">Healthy</span>
//         </div>
//         <div className="stat-card">
//           <h3>Completed Sales</h3>
//           <p className="stat-value">{salesSummary.completed_sales.toFixed(2)}</p>
//           <span className="stat-status">On Track</span>
//         </div>
//         <div className="stat-card">
//           <h3>Pending Sales</h3>
//           <p className="stat-value">{salesSummary.pending_sales.toFixed(2)}</p>
//           <span className={salesSummary.pending_sales > 1000 ? 'stat-status warning' : 'stat-status'}>Action Needed</span>
//         </div>
//       </div>

//       {/* Navigation Cards */}
//       <div className="dashboard-grid">
//         {[
//           { path: '/sales-summary', title: 'Sales Summary', desc: 'View and manage all sales records.', icon: '📊' },
//           { path: '/production-inventory', title: 'Production Inventory', desc: 'Track and manage production stock.', icon: '🏭' },
//           { path: '/inventory', title: 'Inventory', desc: 'Manage stock levels and inventory.', icon: '📦' },
//           { path: '/customer-management', title: 'Customers', desc: 'Add or update customer information.', icon: '👥' },
//           { path: '/raw-materials-inventory', title: 'Raw Materials', desc: 'Manage raw materials catalog.', icon: '🧪' },
//         ].map((item, index) => (
//           <div key={index} className="dashboard-card" onClick={() => handleNavigation(item.path)}>
//             <span className="card-icon">{item.icon}</span>
//             <div>
//               <h2 className="card-title">{item.title}</h2>
//               <p className="card-description">{item.desc}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Analytics Section */}
//       <div className="analytics-section">
//         <h2 className="section-title">Analytics</h2>
//         <div className="date-range-selector">
//           <div className="form-group">
//             <label>Start Date</label>
//             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//           </div>
//           <div className="form-group">
//             <label>End Date</label>
//             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//           </div>
//           <div className="button-group">
//             <button onClick={fetchData} className="btn-fetch" disabled={loading}>
//               {loading ? 'Loading...' : 'Fetch Analytics'}
//             </button>
//             <button onClick={fetchData} className="btn-refresh" disabled={loading}>
//               Refresh
//             </button>
//           </div>
//         </div>
//         {error && <div className="error-message">{error}</div>}

//         <div className="charts-container">
//           <div className="chart-box">
//             <h3>Sales Status</h3>
//             <canvas ref={salesChartRef} />
//             {salesSummary.total_sales === 0 && !loading && (
//               <p>No sales data for the selected period.</p>
//             )}
//           </div>
//           <div className="chart-box">
//             <h3>Top Products Sold</h3>
//             <canvas ref={productsChartRef} />
//             {topProducts.length === 0 && !loading && (
//               <p>No sales data for the selected period.</p>
//             )}
//           </div>
//           <div className="chart-box">
//             <h3>Sales Trend</h3>
//             <canvas ref={trendChartRef} />
//             {salesTrend.length === 0 && !loading && (
//               <p>No trend data for the selected period.</p>
//             )}
//           </div>
//         </div>

//         <div className="inventory-summary">
//           <h3>Inventory Summary</h3>
//           {loading ? (
//             <p>Loading inventory data...</p>
//           ) : inventorySummary.length > 0 ? (
//             <div className="table-container">
//               <table className="inventory-table">
//                 <thead>
//                   <tr>
//                     <th>Product ID</th>
//                     <th>Product Name</th>
//                     <th>Quantity</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {inventorySummary.map(item => (
//                     <tr key={item.product_id}>
//                       <td>{item.product_id}</td>
//                       <td>{item.product_name}</td>
//                       <td>{item.total_quantity}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <p>No inventory data available.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





























import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesSummary, setSalesSummary] = useState({ total_sales: 0, completed_sales: 0, pending_sales: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [inventorySummary, setInventorySummary] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const salesChartRef = useRef(null);
  const productsChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const salesChartInstanceRef = useRef(null);
  const productsChartInstanceRef = useRef(null);
  const trendChartInstanceRef = useRef(null);
  const [userName] = useState('Admin'); // Placeholder for user context

  // Function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize dates and fetch data on component mount
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(formatDate(today));
    setStartDate(formatDate(thirtyDaysAgo));
  }, []);

  // Fetch data function wrapped in useCallback to avoid missing dependency warning
  const fetchData = React.useCallback(async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const salesRes = await fetch(`http://localhost:5000/sales/summary?startDate=${startDate}&endDate=${endDate}`);
      if (!salesRes.ok) throw new Error(`Sales summary fetch failed: ${salesRes.status}`);
      const salesData = await salesRes.json();

      const productsRes = await fetch(`http://localhost:5000/sales/top-products?startDate=${startDate}&endDate=${endDate}`);
      if (!productsRes.ok) throw new Error(`Top products fetch failed: ${productsRes.status}`);
      const productsData = await productsRes.json();

      const inventoryRes = await fetch('http://localhost:5000/inventory/summary');
      if (!inventoryRes.ok) throw new Error(`Inventory summary fetch failed: ${inventoryRes.status}`);
      const inventoryData = await inventoryRes.json();

      const trendRes = await fetch(`http://localhost:5000/sales/trend?startDate=${startDate}&endDate=${endDate}`);
      const trendData = trendRes.ok ? await trendRes.json() : [
        { date: '2025-09-01', sales: 1000 },
        { date: '2025-09-02', sales: 1200 },
        { date: '2025-09-03', sales: 900 },
        { date: '2025-09-04', sales: 1500 },
        { date: '2025-09-05', sales: 1300 },
      ];

      setSalesSummary(salesData);
      setTopProducts(productsData);
      setInventorySummary(inventoryData);
      setSalesTrend(trendData);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Fetch data when startDate and endDate are set
  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, fetchData]);

  useEffect(() => {
    if (salesChartRef.current && salesSummary.total_sales > 0) {
      if (salesChartInstanceRef.current) salesChartInstanceRef.current.destroy();
      salesChartInstanceRef.current = new Chart(salesChartRef.current, {
        type: 'pie',
        data: {
          labels: ['Completed Sales', 'Pending Sales'],
          datasets: [{
            data: [salesSummary.completed_sales, salesSummary.pending_sales],
            backgroundColor: ['#10B981', '#EF4444'],
            borderColor: ['#10B981', '#EF4444'],
            borderWidth: 1,
          }],
        },
        options: {
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 14 } } },
            title: { display: true, text: `Sales Status (${startDate} to ${endDate})`, font: { size: 18 } },
          },
        },
      });
    }
    return () => { if (salesChartInstanceRef.current) salesChartInstanceRef.current.destroy(); };
  }, [salesSummary, startDate, endDate]);

  useEffect(() => {
    if (productsChartRef.current && topProducts.length > 0) {
      if (productsChartInstanceRef.current) productsChartInstanceRef.current.destroy();
      productsChartInstanceRef.current = new Chart(productsChartRef.current, {
        type: 'bar',
        data: {
          labels: topProducts.map(p => p.product_name),
          datasets: [{
            label: 'Quantity Sold',
            data: topProducts.map(p => p.total_quantity),
            backgroundColor: '#3B82F6',
            borderColor: '#3B82F6',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Quantity', font: { size: 14 } } },
            x: { title: { display: true, text: 'Product', font: { size: 14 } } },
          },
          plugins: {
            legend: { display: false },
            title: { display: true, text: `Top 5 Products (${startDate} to ${endDate})`, font: { size: 18 } },
          },
        },
      });
    }
    return () => { if (productsChartInstanceRef.current) productsChartInstanceRef.current.destroy(); };
  }, [topProducts, startDate, endDate]);

  useEffect(() => {
    if (trendChartRef.current && salesTrend.length > 0) {
      if (trendChartInstanceRef.current) trendChartInstanceRef.current.destroy();
      trendChartInstanceRef.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: {
          labels: salesTrend.map(t => t.date),
          datasets: [{
            label: 'Sales Over Time',
            data: salesTrend.map(t => t.sales),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Sales ($)', font: { size: 14 } } },
            x: { title: { display: true, text: 'Date', font: { size: 14 } } },
          },
          plugins: {
            legend: { display: true, position: 'top', labels: { font: { size: 14 } } },
            title: { display: true, text: `Sales Trend (${startDate} to ${endDate})`, font: { size: 18 } },
          },
        },
      });
    }
    return () => { if (trendChartInstanceRef.current) trendChartInstanceRef.current.destroy(); };
  }, [salesTrend, startDate, endDate]);

  const handleNavigation = (path) => navigate(path);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Benn Rubber ERP Dashboard</h1>
          <p className="welcome-message">Welcome, {userName}! Here's your overview for today.</p>
        </div>
        <button onClick={() => handleNavigation('/')} className="logout-btn">Logout</button>
      </header>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => handleNavigation('/add-sale')} className="action-btn">Add Sale</button>
        <button onClick={() => handleNavigation('/add-inventory')} className="action-btn">Add Inventory</button>
        <button onClick={() => handleNavigation('/add-customer')} className="action-btn">Add Customer</button>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{salesSummary.total_sales.toFixed(2)}</p>
          <span className="stat-status">Healthy</span>
        </div>
        <div className="stat-card">
          <h3>Completed Sales</h3>
          <p className="stat-value">{salesSummary.completed_sales.toFixed(2)}</p>
          <span className="stat-status">On Track</span>
        </div>
        <div className="stat-card">
          <h3>Pending Sales</h3>
          <p className="stat-value">{salesSummary.pending_sales.toFixed(2)}</p>
          <span className={salesSummary.pending_sales > 1000 ? 'stat-status warning' : 'stat-status'}>Action Needed</span>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="dashboard-grid">
        {[
          { path: '/sales-summary', title: 'Sales Summary', desc: 'View and manage all sales records.', icon: '📊' },
          { path: '/production-inventory', title: 'Production Inventory', desc: 'Track and manage production stock.', icon: '🏭' },
          { path: '/inventory', title: 'Inventory', desc: 'Manage stock levels and inventory.', icon: '📦' },
          { path: '/customer-management', title: 'Customers', desc: 'Add or update customer information.', icon: '👥' },
          { path: '/raw-materials-inventory', title: 'Raw Materials', desc: 'Manage raw materials catalog.', icon: '🧪' },
          { path: '/profit-summary', title: 'Profit Summary', desc: 'View profit and loss statements.', icon: '💰' },
        ].map((item, index) => (
          <div key={index} className="dashboard-card" onClick={() => handleNavigation(item.path)}>
            <span className="card-icon">{item.icon}</span>
            <div>
              <h2 className="card-title">{item.title}</h2>
              <p className="card-description">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <h2 className="section-title">Analytics</h2>
        <div className="date-range-selector">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="button-group">
            <button onClick={fetchData} className="btn-fetch" disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Analytics'}
            </button>
            <button onClick={fetchData} className="btn-refresh" disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}

        <div className="charts-container">
          <div className="chart-box">
            <h3>Sales Status</h3>
            <canvas ref={salesChartRef} />
            {salesSummary.total_sales === 0 && !loading && (
              <p>No sales data for the selected period.</p>
            )}
          </div>
          <div className="chart-box">
            <h3>Top Products Sold</h3>
            <canvas ref={productsChartRef} />
            {topProducts.length === 0 && !loading && (
              <p>No sales data for the selected period.</p>
            )}
          </div>
          <div className="chart-box">
            <h3>Sales Trend</h3>
            <canvas ref={trendChartRef} />
            {salesTrend.length === 0 && !loading && (
              <p>No trend data for the selected period.</p>
            )}
          </div>
        </div>

        <div className="inventory-summary">
          <h3>Inventory Summary</h3>
          {loading ? (
            <p>Loading inventory data...</p>
          ) : inventorySummary.length > 0 ? (
            <div className="table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {inventorySummary.map(item => (
                    <tr key={item.product_id}>
                      <td>{item.product_id}</td>
                      <td>{item.product_name}</td>
                      <td>{item.total_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No inventory data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;