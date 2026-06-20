




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

//   // Function to format date as YYYY-MM-DD
//   const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   // Initialize dates and fetch data on component mount
//   useEffect(() => {
//     const today = new Date();
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(today.getDate() - 30);

//     setEndDate(formatDate(today));
//     setStartDate(formatDate(thirtyDaysAgo));
//   }, []);

//   // Fetch data function wrapped in useCallback to avoid missing dependency warning
//   const fetchData = React.useCallback(async () => {
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
//   }, [startDate, endDate]);

//   // Fetch data when startDate and endDate are set
//   useEffect(() => {
//     if (startDate && endDate) {
//       fetchData();
//     }
//   }, [startDate, endDate, fetchData]);

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
//           { path: '/profit-summary', title: 'Profit Summary', desc: 'View profit and loss statements.', icon: '💰' },
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

















import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const BASE_URL = "http://localhost:5000";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ value }) {
  const v = (value || "").toLowerCase();
  const cls =
    v === "complete" || v === "completed" || v === "processed" ? "bdg bdg-green"
    : v === "pending"  ? "bdg bdg-yellow"
    : v === "returned" ? "bdg bdg-red"
    : v === "cash"     ? "bdg bdg-green"
    : v === "credit"   ? "bdg bdg-blue"
    : v === "cheque"   ? "bdg bdg-orange"
    : "bdg bdg-gray";
  return <span className={cls}>{value || "—"}</span>;
}

// ─── Panel ────────────────────────────────────────────────────────────────────
function Panel({ title, icon, count, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-head-left">
          <span className="panel-icon">{icon}</span>
          <span className="panel-title">{title}</span>
        </div>
        {count != null && <span className="panel-count">{count}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────
function Empty({ msg }) {
  return (
    <div className="empty">
      <span className="empty-ico">📭</span>
      <span>{msg || "No data available"}</span>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, colorClass }) {
  return (
    <div className={`stat ${colorClass}`}>
      <div className="stat-ico">{icon}</div>
      <div>
        <div className="stat-lbl">{label}</div>
        <div className="stat-val">{value}</div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate();
  const today     = toDateStr(new Date());
  const thirtyAgo = toDateStr(new Date(Date.now() - 30 * 86400000));

  const [startDate,  setStartDate]  = useState(thirtyAgo);
  const [endDate,    setEndDate]    = useState(today);
  const [billFilter, setBillFilter] = useState("all");
  const [billSearch, setBillSearch] = useState("");
  const [dueSearch,  setDueSearch]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const [finalInv, setFinalInv] = useState([]);
  const [pvcInv,   setPvcInv]   = useState([]);
  const [normInv,  setNormInv]  = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [dueBills, setDueBills] = useState([]);
  const [totals,   setTotals]   = useState({ cash: 0, credit: 0, cheque: 0 });

  const fetchAll = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError("");
    try {
      const params = `startDate=${startDate}&endDate=${endDate}`;
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        fetch(`${BASE_URL}/dashboard/inventory/summary`,              { credentials: "include" }),
        fetch(`${BASE_URL}/dashboard/production/summary?type=normal`, { credentials: "include" }),
        fetch(`${BASE_URL}/dashboard/production/summary?type=pvc`,    { credentials: "include" }),
        fetch(`${BASE_URL}/dashboard/sales?${params}`,                { credentials: "include" }),
        fetch(`${BASE_URL}/dashboard/sales/due?${params}`,            { credentials: "include" }),
        fetch(`${BASE_URL}/dashboard/totals?${params}`,               { credentials: "include" }),
      ]);
      if (r1.ok) setFinalInv(await r1.json());
      if (r2.ok) setNormInv(await r2.json());
      if (r3.ok) setPvcInv(await r3.json());
      if (r4.ok) setAllBills(await r4.json());
      if (r5.ok) setDueBills(await r5.json());
      if (r6.ok) setTotals(await r6.json());
    } catch (e) {
      setError(`Load failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const chequeBills = allBills.flatMap((b) =>
    (b.payments || [])
      .filter((p) => p.method === "cheque")
      .map((p) => ({
        customer_name: b.customer_name,
        bill_no:       b.bill_no,
        cheque_number: p.cheque_number,
        cheque_date:   p.cheque_date,
        amount:        p.amount,
        cheque_status: p.cheque_status || "Pending",
      }))
  );

  const filteredBills = allBills.filter((b) => {
    const method = (b.method || "").toLowerCase();
    const matchFilter = billFilter === "all" || method.includes(billFilter);
    const q = billSearch.toLowerCase();
    return matchFilter && (
      !q ||
      String(b.bill_no || "").toLowerCase().includes(q) ||
      (b.customer_name || "").toLowerCase().includes(q) ||
      method.includes(q)
    );
  });

  const filteredDue = dueBills.filter((b) => {
    const q = dueSearch.toLowerCase();
    return !q ||
      String(b.bill_no || "").toLowerCase().includes(q) ||
      (b.customer_name || "").toLowerCase().includes(q);
  });

  const grand = totals.cash + totals.credit + totals.cheque;

  // ── shared production table renderer ──────────────────────────────────────
  const ProductionTable = ({ data, pillClass, emptyMsg }) => (
    <div className="tbl-wrap tbl-wrap-sm">
      {data.length === 0 ? <Empty msg={emptyMsg} /> : (
        <table className="tbl">
          <thead>
            <tr><th>Batch</th><th>Unit</th><th className="r">Qty</th></tr>
          </thead>
          <tbody>
            {data.map((x) => (
              <tr key={x.product_id}>
                <td className="fw">{x.product_name}</td>
                <td className="dim">{x.unit || "Kg"}</td>
                <td className="r">
                  <span className={`qpill ${pillClass}`}>{x.total_quantity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="db">

      {/* ══ TOPBAR ══════════════════════════════════════════════════════ */}
      <div className="db-topbar">
        <div>
          <h1 className="db-heading">Overview</h1>
          <p className="db-sub">Benn Rubber ERP</p>
        </div>
        <div className="db-controls">
          <div className="db-ctrl-group">
            <label>From</label>
            <input type="date" value={startDate} className="db-date"
              onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="db-ctrl-group">
            <label>To</label>
            <input type="date" value={endDate} className="db-date"
              onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="db-btn-refresh" onClick={fetchAll} disabled={loading}>
            {loading ? <span className="spin" /> : "↻ Refresh"}
          </button>
          {error && <span className="db-err">{error}</span>}
        </div>
      </div>

      {/* ══ QUICK ACTIONS ═══════════════════════════════════════════════ */}
      {/* ══ QUICK ACTIONS ═══════════════════════════════════════════════ */}
      <div className="db-actions">
        <button className="qa-btn qa-btn--purple" onClick={() => navigate("/raw-materials-inventory")}>
          <span className="qa-icon">🧪</span>
          Raw Mat.
        </button>
        <button className="qa-btn qa-btn--teal" onClick={() => navigate("/raw-materials-pvc-inventory")}>
          <span className="qa-icon">🏗️</span>
          PVC Mat.
        </button>
        <button className="qa-btn qa-btn--blue" onClick={() => navigate("/sales-summary")}>
          <span className="qa-icon">📊</span>
          Sales
        </button>
        <button className="qa-btn qa-btn--green" onClick={() => navigate("/customer-management")}>
          <span className="qa-icon">👥</span>
          Customers
        </button>
      </div>

      {/* ══ BODY ════════════════════════════════════════════════════════ */}
      <div className="db-body">

        {/* ── LEFT: Final Products only ──────────────────────────────── */}
        <div className="col col-left">

          <Panel title="Final Products" icon="📦" count={finalInv.length}>
            <div className="tbl-wrap tbl-wrap-final">
              {finalInv.length === 0 ? <Empty msg="No products found." /> : (
                <table className="tbl">
                  <thead>
                    <tr><th>Product</th><th>Unit</th><th className="r">Qty</th></tr>
                  </thead>
                  <tbody>
                    {finalInv.map((x) => (
                      <tr key={x.product_id}>
                        <td className="fw">{x.product_name}</td>
                        <td className="dim">{x.unit || "Pcs"}</td>
                        <td className="r">
                          <span className={`qpill ${Number(x.total_quantity) <= 10 ? "qlow" : "qok"}`}>
                            {x.total_quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>

        </div>

        {/* ── CENTER: Bills + Production ─────────────────────────────── */}
        <div className="col col-center">

          {/* All Bills */}
          <Panel title="All Bills" icon="🧾" count={allBills.length}>
            <div className="toolbar">
              <div className="search-box">
                <span className="search-ico">⌕</span>
                <input className="search-inp" placeholder="Search bill no., customer…"
                  value={billSearch} onChange={(e) => setBillSearch(e.target.value)} />
              </div>
              <div className="tabs">
                {["all", "cash", "credit", "cheque"].map((f) => (
                  <button key={f}
                    className={`tab ${billFilter === f ? "tab-on" : ""}`}
                    onClick={() => setBillFilter(f)}>
                    {f[0].toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="tbl-wrap tbl-wrap-lg">
              {filteredBills.length === 0
                ? <Empty msg="No bills match the filter." />
                : (
                <table className="tbl tbl-stripe">
                  <thead>
                    <tr>
                      <th>Date</th><th>Bill No.</th><th>Customer</th>
                      <th>Method</th><th className="r">Amount</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((b, i) => (
                      <tr key={i} className={(b.status || "").toLowerCase() === "pending" ? "row-warn" : ""}>
                        <td className="dim mono">{b.date || "—"}</td>
                        <td className="billno">{b.bill_no || b.sale_id}</td>
                        <td className="fw">{b.customer_name || "—"}</td>
                        <td><Badge value={b.method} /></td>
                        <td className="r mono fw">Rs.{fmt(b.total_amount)}</td>
                        <td><Badge value={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>

          {/* Due Bills */}
          <Panel title="Due Bills" icon="⚠️"
            count={dueBills.length > 0 ? `${dueBills.length} overdue` : null}>
            <div className="toolbar">
              <div className="search-box">
                <span className="search-ico">⌕</span>
                <input className="search-inp" placeholder="Search due bills…"
                  value={dueSearch} onChange={(e) => setDueSearch(e.target.value)} />
              </div>
            </div>
            <div className="tbl-wrap tbl-wrap-md">
              {filteredDue.length === 0
                ? <Empty msg="No due bills — all clear! ✅" />
                : (
                <table className="tbl tbl-due">
                  <thead>
                    <tr>
                      <th>Date</th><th>Bill No.</th><th>Customer</th>
                      <th>Method</th><th className="r">Due Amount</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDue.map((b, i) => (
                      <tr key={i} className="row-due">
                        <td className="dim mono">{b.date || "—"}</td>
                        <td className="billno due-red">{b.bill_no || b.sale_id}</td>
                        <td className="fw">{b.customer_name || "—"}</td>
                        <td><Badge value={b.method} /></td>
                        <td className="r mono due-red fw">Rs.{fmt(b.due_amount || b.total_amount)}</td>
                        <td><Badge value="Pending" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>

          {/* ── Production panels side-by-side below due bills ── */}
          <div className="production-row">

            <Panel title="Production — PVC" icon="🏭" count={pvcInv.length}>
              <ProductionTable
                data={pvcInv}
                pillClass="qpvc"
                emptyMsg="No PVC data."
              />
            </Panel>

            <Panel title="Production — Normal" icon="⚙️" count={normInv.length}>
              <ProductionTable
                data={normInv}
                pillClass="qnorm"
                emptyMsg="No normal production data."
              />
            </Panel>

          </div>

        </div>

        {/* ── RIGHT: Financials ──────────────────────────────────────── */}
        <div className="col col-right">

          <div className="stat-row">
            <StatCard label="Cash"   value={`Rs. ${fmt(totals.cash)}`}   icon="💵" colorClass="stat-green" />
            <StatCard label="Credit" value={`Rs. ${fmt(totals.credit)}`} icon="🏦" colorClass="stat-blue" />
            <StatCard label="Cheque" value={`Rs. ${fmt(totals.cheque)}`} icon="📋" colorClass="stat-orange" />
          </div>

          <div className="grand-card">
            <div className="grand-lbl">Total Revenue</div>
            <div className="grand-val">Rs. {fmt(grand)}</div>
            <div className="grand-period">{startDate} — {endDate}</div>
            <div className="grand-bar">
              {grand > 0 && (
                <>
                  <div className="grand-bar-seg seg-green"  style={{ width: `${(totals.cash   / grand) * 100}%` }} />
                  <div className="grand-bar-seg seg-blue"   style={{ width: `${(totals.credit / grand) * 100}%` }} />
                  <div className="grand-bar-seg seg-orange" style={{ width: `${(totals.cheque / grand) * 100}%` }} />
                </>
              )}
            </div>
            <div className="grand-legend">
              <span className="leg-dot leg-green"  />Cash
              <span className="leg-dot leg-blue"   />Credit
              <span className="leg-dot leg-orange" />Cheque
            </div>
          </div>

          <Panel title="Cheque Bills" icon="🏦" count={chequeBills.length}>
            <div className="tbl-wrap tbl-wrap-cheque">
              {chequeBills.length === 0
                ? <Empty msg="No cheque bills this period." />
                : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Customer</th><th>Cheque No.</th>
                      <th>Date</th><th className="r">Amount</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chequeBills.map((b, i) => (
                      <tr key={i}>
                        <td className="fw">{b.customer_name || "—"}</td>
                        <td className="billno">{b.cheque_number || "—"}</td>
                        <td className="dim mono">{b.cheque_date || "—"}</td>
                        <td className="r mono fw">Rs.{fmt(b.amount)}</td>
                        <td><Badge value={b.cheque_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}