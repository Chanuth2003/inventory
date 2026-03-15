// import React, { useState } from 'react';
// import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
// import AdminLogin from './pages/AdminLogin';
// import AddProduct from './pages/AddProduct';
// import AddInventory from './pages/AddInventory';
// import AddSale from './pages/AddSale';
// import AddCustomer from './pages/AddCustomer';
// import Dashboard from './pages/Dashboard';
// import ViewCustomers from './pages/ViewCustomers';
// import SalesSummary from './pages/SalesSummary';
// import SaleDetails from './pages/SalesDetails';
// import CustomerManagement from './pages/CustomerManagement';
// import InventoryManagement from './pages/InventoryManagement';
// import Invoice from './pages/Invoice';
// import AnalyticalDashboard from './pages/AnalyticalDashboard';
// import RawMaterialsInventory from './pages/RawMaterialsInventory';
// import Production from './pages/Production';
// import AddRawMaterial from './pages/AddRawMaterial';
// import ProductionInventory from './pages/ProductionInventory';
// import ProductionOut from './pages/ProductionOut';
// import './styles/app.css';
// import { 
//   FaTachometerAlt, FaIndustry, FaPlus, FaWarehouse, FaCogs, FaBox, FaSignOutAlt, 
//   FaBoxOpen, FaPlusSquare, FaClipboardList, FaChartLine, FaChartPie, FaUsers, 
//   FaUserPlus, FaUsersCog, FaChartBar 
// } from 'react-icons/fa';
// import AddRawMaterialPvc from './pages/AddRawMaterialPvc';
// import RawMaterialsPvcInventory from './pages/RawMaterialsPvcInventory';   
// import PvcProduction from './pages/PvcProduction'; 
// import PvcProductionInventory from './pages/PvcProductionInventory';
// import PvcProductionOut from './pages/PvcProductionOut';
// import MonthlyExpenses from './pages/MonthlyExpenses';
// import ViewMonthlyExpenses from './pages/ViewMonthlyExpenses';
// import ProfitSummary from './pages/ProfitSummary';
// import PeriodExpensesForm from './pages/PeriodExpensesForm';
// import ViewPeriodExpenses from './pages/ViewPeriodExpenses';
// import EditPeriodExpenses from './pages/EditPeriodExpenses';    
// import ProtectedRoute from "./components/ProtectedRoute";
// import { AuthContext } from "./context/AuthContext";



// // Logout component
// const LogoutButton = () => {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       const res = await fetch('http://localhost:5000/logout', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       });
//       if (res.ok) {
//         navigate('/');
//       } else {
//         console.error('Logout failed:', res.status);
//       }
//     } catch (err) {
//       console.error('Error during logout:', err);
//     }
//   };

//   return (
//     <button onClick={handleLogout} className="logout-btn">
//       <FaSignOutAlt /> Logout
//     </button>
//   );
// };

// function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [openSubmenu, setOpenSubmenu] = useState(null); // Track which submenu is open

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleSubmenuToggle = (menu) => {
//     setOpenSubmenu(openSubmenu === menu ? null : menu);
//   };

//   return (
//     <BrowserRouter>
//       <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
//         {/* Toggle Button */}
//         <button className="sidebar-toggle" onClick={toggleSidebar}>
//           <span></span>
//           <span></span>
//           <span></span>
//         </button>

//         {/* Sidebar */}
//         <nav className="sidebar">
//           <div className="sidebar-header">
//             <h2 className="app-title">Benn Rubber</h2>
//           </div>
//           <ul className="sidebar-menu">
//             <li className="menu-item">
//               <Link to="/dashboard" className="menu-link" onClick={() => setIsSidebarOpen(false)}>
//                 <FaTachometerAlt /> Dashboard
//               </Link>
//             </li>

//             {/* Raw Materials & Production Submenu */}
//             <li className="menu-item has-submenu">
//               <span 
//                 className="menu-link" 
//                 onClick={() => handleSubmenuToggle('raw')}
//               >
//                 <FaIndustry /> Raw Materials & Production
//               </span>
//               <ul className={`submenu ${openSubmenu === 'raw' ? 'open' : ''}`}>
//                 <li><Link to="/add-raw-material" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaPlus /> Add Raw Material</Link></li>
//                 <li><Link to="/raw-materials-inventory" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaWarehouse /> Raw Materials Inventory</Link></li>
//                 <li><Link to="/production" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaCogs /> Production</Link></li>
//                 <li><Link to="/production-inventory" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaBox /> Production Inventory</Link></li>
//                 <li><Link to="/production-out" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaSignOutAlt /> Production Out</Link></li>
//               </ul>
//             </li>

//             {/* Raw Materials & Production (PVC) Submenu */}
//             <li className="menu-item has-submenu">
//               <span 
//                 className="menu-link" 
//                 onClick={() => handleSubmenuToggle('pvc')}
//               >
//                 <FaIndustry /> Raw Materials & Production (PVC)
//               </span>
//               <ul className={`submenu ${openSubmenu === 'pvc' ? 'open' : ''}`}>
//                 <li><Link to="/add-raw-material-pvc" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaPlus /> Add Raw Material (PVC)</Link></li>
//                 <li><Link to="/raw-materials-pvc-inventory" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaWarehouse /> Raw Materials Inventory (PVC)</Link></li>
//                 <li><Link to="/pvc-production" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaCogs /> Production (PVC)</Link></li>
//                 <li><Link to="/pvc-production-inventory" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaBox /> Production Inventory (PVC)</Link></li>
//                 <li><Link to="/pvc-production-out" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaSignOutAlt /> Production Out (PVC)</Link></li>
//               </ul>
//             </li>

//             {/* Expenses Submenu */}
//             <li className="menu-item has-submenu">
//               <span 
//                 className="menu-link" 
//                 onClick={() => handleSubmenuToggle('expenses')}
//               >
//                 <FaIndustry /> Expenses
//               </span>
//               <ul className={`submenu ${openSubmenu === 'expenses' ? 'open' : ''}`}>
//                 <li><Link to="/monthly-expenses" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaPlus /> Monthly Expenses</Link></li>
//                 <li><Link to="/view-monthly-expenses" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaWarehouse /> View Monthly Expenses</Link></li>
//                 <li><Link to="/period-expenses-form" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaCogs /> Period Expenses Form</Link></li>
//                 <li><Link to="/view-period-expenses" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaBox /> View Period Expenses</Link></li>
//               </ul>
//             </li>

//             {/* Inventory Submenu */}
//             <li className="menu-item has-submenu">
//               <span 
//                 className="menu-link" 
//                 onClick={() => handleSubmenuToggle('inventory')}
//               >
//                 <FaBoxOpen /> Inventory
//               </span>
//               <ul className={`submenu ${openSubmenu === 'inventory' ? 'open' : ''}`}>
//                 <li><Link to="/add-product" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaPlus /> Add Product</Link></li>
//                 <li><Link to="/add-inventory" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaPlusSquare /> Add Inventory</Link></li>
//                 <li><Link to="/inventory" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaClipboardList /> Inventory Management</Link></li>
//               </ul>
//             </li>

//             {/* Sales Submenu */}
//             <li className="menu-item has-submenu">
//               <span 
//                 className="menu-link" 
//                 onClick={() => handleSubmenuToggle('sales')}
//               >
//                 <FaChartLine /> Sales
//               </span>
//               <ul className={`submenu ${openSubmenu === 'sales' ? 'open' : ''}`}>
//                 <li><Link to="/sales-summary" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaChartPie /> Sales Summary</Link></li>
//                 <li><Link to="/add-sale" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaPlus /> Add Sale</Link></li>
//                 <li><Link to="/profit-summary" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaChartLine /> Profit Summary</Link></li>
//               </ul>
//             </li>

//             {/* Customers Submenu */}
//             <li className="menu-item has-submenu">
//               <span 
//                 className="menu-link" 
//                 onClick={() => handleSubmenuToggle('customers')}
//               >
//                 <FaUsers /> Customers
//               </span>
//               <ul className={`submenu ${openSubmenu === 'customers' ? 'open' : ''}`}>
//                 <li><Link to="/add-customer" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaUserPlus /> Add Customer</Link></li>
//                 <li><Link to="/customer-management" className="submenu-link" onClick={() => setIsSidebarOpen(false)}><FaUsersCog /> Customer Management</Link></li>
//               </ul>
//             </li>

//             <li className="menu-item">
//               <Link to="/analytical-dashboard" className="menu-link" onClick={() => setIsSidebarOpen(false)}>
//                 <FaChartBar /> Analytics
//               </Link>
//             </li>

//             <li className="menu-item logout-item">
//               <LogoutButton />
//             </li>
//           </ul>
//         </nav>

//         {/* Main Content */}
//         <div className="main-content">
//           <header className="header">
//             <h1 className="header-title">Benn Rubber Industries</h1>
//           </header>
//           <div className="content-wrapper">
//             <Routes>
//               <Route path="/" element={<AdminLogin />} />
//               <Route path="/add-product" element={<AddProduct />} />
//               <Route path="/add-inventory" element={<AddInventory />} />
//               <Route path="/add-sale" element={<AddSale />} />
//               <Route path="/add-customer" element={<AddCustomer />} />
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/view-customers" element={<ViewCustomers />} />
//               <Route path="/sales-summary" element={<SalesSummary />} />
//               <Route path="/sales/:id" element={<SaleDetails />} />
//               <Route path="/customer-management" element={<CustomerManagement />} />
//               <Route path="/inventory" element={<InventoryManagement />} />
//               <Route path="/invoice/:saleId" element={<Invoice />} />
//               <Route path="/analytical-dashboard" element={<AnalyticalDashboard />} />
//               <Route path="/raw-materials-inventory" element={<RawMaterialsInventory />} />
//               <Route path="/production" element={<Production />} />
//               <Route path="/add-raw-material" element={<AddRawMaterial />} />
//               <Route path="/production-inventory" element={<ProductionInventory />} />
//               <Route path="/production-out" element={<ProductionOut />} />
//               <Route path="/add-raw-material-pvc" element={<AddRawMaterialPvc />} />
//               <Route path="/raw-materials-pvc-inventory" element={<RawMaterialsPvcInventory />} />
//               <Route path="/pvc-production" element={<PvcProduction />} />
//               <Route path="/pvc-production-inventory" element={<PvcProductionInventory />} />
//               <Route path="/pvc-production-out" element={<PvcProductionOut />} />
//               <Route path="/monthly-expenses" element={<MonthlyExpenses />} />
//               <Route path="/view-monthly-expenses" element={<ViewMonthlyExpenses />} />
//               <Route path="/period-expenses-form" element={<PeriodExpensesForm />} />
//               <Route path="/view-period-expenses" element={<ViewPeriodExpenses />} />
//               <Route path="/profit-summary" element={<ProfitSummary />} />
//               <Route path='/edit-period-expenses/:id' element={<EditPeriodExpenses />} />
//             </Routes>
//           </div>
//         </div>
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;
































import React, { useState, useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import AddInventory from './pages/AddInventory';
import AddSale from './pages/AddSale';
import AddCustomer from './pages/AddCustomer';
import SalesSummary from './pages/SalesSummary';
import CustomerManagement from './pages/CustomerManagement';
import InventoryManagement from './pages/InventoryManagement';
import Invoice from './pages/Invoice';
import AnalyticalDashboard from './pages/AnalyticalDashboard';
import RawMaterialsInventory from './pages/RawMaterialsInventory';
import Production from './pages/Production';
import AddRawMaterial from './pages/AddRawMaterial';
import ProductionInventory from './pages/ProductionInventory';
import ProductionOut from './pages/ProductionOut';
import AddRawMaterialPvc from './pages/AddRawMaterialPvc';
import RawMaterialsPvcInventory from './pages/RawMaterialsPvcInventory';
import PvcProduction from './pages/PvcProduction';
import PvcProductionInventory from './pages/PvcProductionInventory';
import PvcProductionOut from './pages/PvcProductionOut';
import MonthlyExpenses from './pages/MonthlyExpenses';
import ViewMonthlyExpenses from './pages/ViewMonthlyExpenses';
import ProfitSummary from './pages/ProfitSummary';
import PeriodExpensesForm from './pages/PeriodExpensesForm';
import ViewPeriodExpenses from './pages/ViewPeriodExpenses';
import EditPeriodExpenses from './pages/EditPeriodExpenses';

// Icons
import {
  FaTachometerAlt, FaIndustry, FaPlus, FaWarehouse, FaCogs,
  FaBox, FaSignOutAlt, FaBoxOpen, FaPlusSquare, FaClipboardList,
  FaChartLine, FaChartPie, FaUsers, FaUserPlus, FaUsersCog, FaChartBar,
} from 'react-icons/fa';

import './styles/app.css';

// Logout Button
const LogoutButton = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setIsLoggedIn(false);
        navigate('/');
      } else {
        console.error('Logout failed:', res.status);
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      <FaSignOutAlt /> Logout
    </button>
  );
};

// Main App Content
function AppContent() {
  const { isLoggedIn } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleSubmenuToggle = (menu) => {
    setOpenSubmenu(prev => (prev === menu ? null : menu));
  };

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/*" element={<AdminLogin />} />
      </Routes>
    );
  }

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2 className="app-title">Benn Rubber</h2>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-item">
            <Link
              to="/dashboard"
              className="menu-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>

          {/* Raw Materials & Production */}
          <li className="menu-item has-submenu">
            <span
              className="menu-link"
              onClick={() => handleSubmenuToggle('raw')}
            >
              <FaIndustry /> Raw Materials & Production
            </span>
            <ul className={`submenu ${openSubmenu === 'raw' ? 'open' : ''}`}>
              <li>
                <Link to="/add-raw-material" onClick={() => setIsSidebarOpen(false)}>
                  <FaPlus /> Add Raw Material
                </Link>
              </li>
              <li>
                <Link to="/raw-materials-inventory" onClick={() => setIsSidebarOpen(false)}>
                  <FaWarehouse /> Raw Materials Inventory
                </Link>
              </li>
              <li>
                <Link to="/production" onClick={() => setIsSidebarOpen(false)}>
                  <FaCogs /> Production
                </Link>
              </li>
              <li>
                <Link to="/production-inventory" onClick={() => setIsSidebarOpen(false)}>
                  <FaBox /> Production Inventory
                </Link>
              </li>
              <li>
                <Link to="/production-out" onClick={() => setIsSidebarOpen(false)}>
                  <FaSignOutAlt /> Production Out
                </Link>
              </li>
            </ul>
          </li>

          {/* Raw Materials & Production (PVC) */}
          <li className="menu-item has-submenu">
            <span
              className="menu-link"
              onClick={() => handleSubmenuToggle('pvc')}
            >
              <FaIndustry /> Raw Materials & Production (PVC)
            </span>
            <ul className={`submenu ${openSubmenu === 'pvc' ? 'open' : ''}`}>
              <li>
                <Link to="/add-raw-material-pvc" onClick={() => setIsSidebarOpen(false)}>
                  <FaPlus /> Add Raw Material (PVC)
                </Link>
              </li>
              <li>
                <Link to="/raw-materials-pvc-inventory" onClick={() => setIsSidebarOpen(false)}>
                  <FaWarehouse /> Raw Materials Inventory (PVC)
                </Link>
              </li>
              <li>
                <Link to="/pvc-production" onClick={() => setIsSidebarOpen(false)}>
                  <FaCogs /> Production (PVC)
                </Link>
              </li>
              <li>
                <Link to="/pvc-production-inventory" onClick={() => setIsSidebarOpen(false)}>
                  <FaBox /> Production Inventory (PVC)
                </Link>
              </li>
              <li>
                <Link to="/pvc-production-out" onClick={() => setIsSidebarOpen(false)}>
                  <FaSignOutAlt /> Production Out (PVC)
                </Link>
              </li>
            </ul>
          </li>

          {/* Expenses */}
          <li className="menu-item has-submenu">
            <span
              className="menu-link"
              onClick={() => handleSubmenuToggle('expenses')}
            >
              <FaIndustry /> Expenses
            </span>
            <ul className={`submenu ${openSubmenu === 'expenses' ? 'open' : ''}`}>
              <li>
                <Link to="/monthly-expenses" onClick={() => setIsSidebarOpen(false)}>
                  <FaPlus /> Monthly Expenses
                </Link>
              </li>
              <li>
                <Link to="/view-monthly-expenses" onClick={() => setIsSidebarOpen(false)}>
                  <FaWarehouse /> View Monthly Expenses
                </Link>
              </li>
              <li>
                <Link to="/period-expenses-form" onClick={() => setIsSidebarOpen(false)}>
                  <FaCogs /> Period Expenses Form
                </Link>
              </li>
              <li>
                <Link to="/view-period-expenses" onClick={() => setIsSidebarOpen(false)}>
                  <FaBox /> View Period Expenses
                </Link>
              </li>
            </ul>
          </li>

          {/* Inventory */}
          <li className="menu-item has-submenu">
            <span
              className="menu-link"
              onClick={() => handleSubmenuToggle('inventory')}
            >
              <FaBoxOpen /> Inventory
            </span>
            <ul className={`submenu ${openSubmenu === 'inventory' ? 'open' : ''}`}>
              <li>
                <Link to="/add-product" onClick={() => setIsSidebarOpen(false)}>
                  <FaPlus /> Add Product
                </Link>
              </li>
              <li>
                <Link to="/add-inventory" onClick={() => setIsSidebarOpen(false)}>
                  <FaPlusSquare /> Add Inventory
                </Link>
              </li>
              <li>
                <Link to="/inventory" onClick={() => setIsSidebarOpen(false)}>
                  <FaClipboardList /> Inventory Management
                </Link>
              </li>
            </ul>
          </li>

          {/* Sales */}
          <li className="menu-item has-submenu">
            <span
              className="menu-link"
              onClick={() => handleSubmenuToggle('sales')}
            >
              <FaChartLine /> Sales
            </span>
            <ul className={`submenu ${openSubmenu === 'sales' ? 'open' : ''}`}>
              <li>
                <Link to="/sales-summary" onClick={() => setIsSidebarOpen(false)}>
                  <FaChartPie /> Sales Summary
                </Link>
              </li>
              <li>
                <Link to="/add-sale" onClick={() => setIsSidebarOpen(false)}>
                  <FaPlus /> Add Sale
                </Link>
              </li>
              <li>
                <Link to="/profit-summary" onClick={() => setIsSidebarOpen(false)}>
                  <FaChartLine /> Profit Summary
                </Link>
              </li>
            </ul>
          </li>

          {/* Customers */}
          <li className="menu-item has-submenu">
            <span
              className="menu-link"
              onClick={() => handleSubmenuToggle('customers')}
            >
              <FaUsers /> Customers
            </span>
            <ul className={`submenu ${openSubmenu === 'customers' ? 'open' : ''}`}>
              <li>
                <Link to="/add-customer" onClick={() => setIsSidebarOpen(false)}>
                  <FaUserPlus /> Add Customer
                </Link>
              </li>
              <li>
                <Link to="/customer-management" onClick={() => setIsSidebarOpen(false)}>
                  <FaUsersCog /> Customer Management
                </Link>
              </li>
            </ul>
          </li>

          <li className="menu-item">
            <Link
              to="/analytical-dashboard"
              className="menu-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FaChartBar /> Analytics
            </Link>
          </li>

          <li className="menu-item logout-item">
            <LogoutButton />
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1 className="header-title">Benn Rubber Industries</h1>
        </header>

        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<AdminLogin />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
            <Route path="/add-inventory" element={<ProtectedRoute><AddInventory /></ProtectedRoute>} />
            <Route path="/add-sale" element={<ProtectedRoute><AddSale /></ProtectedRoute>} />
            <Route path="/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
            <Route path="/sales-summary" element={<ProtectedRoute><SalesSummary /></ProtectedRoute>} />
            <Route path="/customer-management" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
            <Route path="/invoice/:saleId" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
            <Route path="/analytical-dashboard" element={<ProtectedRoute><AnalyticalDashboard /></ProtectedRoute>} />
            <Route path="/raw-materials-inventory" element={<ProtectedRoute><RawMaterialsInventory /></ProtectedRoute>} />
            <Route path="/production" element={<ProtectedRoute><Production /></ProtectedRoute>} />
            <Route path="/add-raw-material" element={<ProtectedRoute><AddRawMaterial /></ProtectedRoute>} />
            <Route path="/production-inventory" element={<ProtectedRoute><ProductionInventory /></ProtectedRoute>} />
            <Route path="/production-out" element={<ProtectedRoute><ProductionOut /></ProtectedRoute>} />
            <Route path="/add-raw-material-pvc" element={<ProtectedRoute><AddRawMaterialPvc /></ProtectedRoute>} />
            <Route path="/raw-materials-pvc-inventory" element={<ProtectedRoute><RawMaterialsPvcInventory /></ProtectedRoute>} />
            <Route path="/pvc-production" element={<ProtectedRoute><PvcProduction /></ProtectedRoute>} />
            <Route path="/pvc-production-inventory" element={<ProtectedRoute><PvcProductionInventory /></ProtectedRoute>} />
            <Route path="/pvc-production-out" element={<ProtectedRoute><PvcProductionOut /></ProtectedRoute>} />
            <Route path="/monthly-expenses" element={<ProtectedRoute><MonthlyExpenses /></ProtectedRoute>} />
            <Route path="/view-monthly-expenses" element={<ProtectedRoute><ViewMonthlyExpenses /></ProtectedRoute>} />
            <Route path="/period-expenses-form" element={<ProtectedRoute><PeriodExpensesForm /></ProtectedRoute>} />
            <Route path="/view-period-expenses" element={<ProtectedRoute><ViewPeriodExpenses /></ProtectedRoute>} />
            <Route path="/profit-summary" element={<ProtectedRoute><ProfitSummary /></ProtectedRoute>} />
            <Route path="/edit-period-expenses/:id" element={<ProtectedRoute><EditPeriodExpenses /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// Root
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}