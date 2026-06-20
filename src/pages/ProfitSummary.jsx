// import React, { useState } from 'react';
// import axios from 'axios';
// import '../styles/ViewPeriodExpenses.css'; // Reuse existing styles

// const ProfitSummary = () => {
//   const [dates, setDates] = useState({ startDate: '', endDate: '' });
//   const [summary, setSummary] = useState(null);
//   const [error, setError] = useState(null);

//   const handleDateChange = (e) => {
//     setDates({ ...dates, [e.target.name]: e.target.value });
//     setError(null);
//   };

//   const fetchProfitSummary = async () => {
//     try {
//       const response = await axios.get('/api/profit-summary', {
//         params: { startDate: dates.startDate, endDate: dates.endDate },
//       });
//       console.log('API Response:', response.data);
//       setSummary(response.data);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching profit summary:', err);
//       setSummary(null);
//       setError(err.response?.data?.error || 'Failed to fetch profit summary');
//     }
//   };

//   return (
//     <div className="view-expenses-container">
//       <h2 className="view-title">Profit Summary</h2>
//       <div className="view-date-grid">
//         <div className="form-group">
//           <label className="form-label">Start Date</label>
//           <input
//             type="date"
//             name="startDate"
//             value={dates.startDate}
//             onChange={handleDateChange}
//             className="form-input"
//           />
//         </div>
//         <div className="form-group">
//           <label className="form-label">End Date</label>
//           <input
//             type="date"
//             name="endDate"
//             value={dates.endDate}
//             onChange={handleDateChange}
//             className="form-input"
//           />
//         </div>
//       </div>
//       <button onClick={fetchProfitSummary} className="fetch-button">
//         Fetch Profit Summary
//       </button>
//       {error && <div className="error-message">{error}</div>}
//       {summary && (
//         <div className="expenses-display">
//           <h3 className="form-section-title">
//             Profit Summary for {summary.startDate} to {summary.endDate}
//           </h3>
//           <div className="expenses-grid">
//             <div className="expense-item">Total Sales: LKR {summary.totalSales}</div>
//             <div className="expense-item">Total Expenses: LKR {summary.totalExpenses}</div>
//             <div className="expense-item">
//               Profit: <span style={{ color: summary.profit >= 0 ? 'green' : 'red' }}>
//                 LKR {summary.profit}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfitSummary;












































import React, { useState } from 'react';
import api from '../utils/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import '../styles/ProfitSummary.css';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ProfitSummary = () => {
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
    setError(null);
  };

  const fetchProfitSummary = async () => {
    if (!dates.startDate || !dates.endDate) {
      setError('Please select both start and end dates');
      return;
    }
    if (new Date(dates.startDate) > new Date(dates.endDate)) {
      setError('Start date must be before end date');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/profit-summary', {
        params: { startDate: dates.startDate, endDate: dates.endDate },
      });
      console.log('API Response:', response.data);
      setSummary(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profit summary:', err);
      setSummary(null);
      setError(err.response?.data?.error || 'Failed to fetch profit summary');
    } finally {
      setLoading(false);
    }
  };

  // Bar chart data
  const barData = summary
    ? {
        labels: ['Total Sales', 'Total Expenses', 'Profit'],
        datasets: [
          {
            label: 'Amount (LKR)',
            data: [
              parseFloat(summary.totalSales) || 0,
              parseFloat(summary.totalExpenses) || 0,
              parseFloat(summary.profit) || 0,
            ].map(value => (isNaN(value) ? 0 : value)), // Fallback to 0 if NaN
            backgroundColor: ['#4CAF50', '#F44336', summary.profit >= 0 ? '#2563EB' : '#F59E0B'],
            borderColor: ['#388E3C', '#D32F2F', summary.profit >= 0 ? '#1E40AF' : '#D97706'],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Pie chart data
  const pieData = summary
    ? {
        labels: ['Total Sales', 'Total Expenses'],
        datasets: [
          {
            data: [
              parseFloat(summary.totalSales) || 0,
              parseFloat(summary.totalExpenses) || 0,
            ].map(value => (isNaN(value) ? 0 : value)), // Fallback to 0 if NaN
            backgroundColor: ['#4CAF50', '#F44336'],
            borderColor: ['#388E3C', '#D32F2F'],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 14 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => `LKR ${context.parsed.y ? context.parsed.y.toFixed(2) : context.parsed.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="profit-summary-container">
      <h2 className="profit-title">Profit Summary</h2>

      {/* Date Inputs */}
      <div className="date-grid">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={dates.startDate}
            onChange={handleDateChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            type="date"
            name="endDate"
            value={dates.endDate}
            onChange={handleDateChange}
            className="form-input"
          />
        </div>
      </div>

      {/* Fetch Button */}
      <button
        onClick={fetchProfitSummary}
        disabled={loading}
        className="fetch-button"
      >
        {loading ? 'Loading...' : 'Fetch Profit Summary'}
      </button>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Summary and Charts */}
      {summary && (
        <div className="summary-display">
          <h3 className="form-section-title">
            Profit Summary for {summary.startDate} to {summary.endDate}
          </h3>

          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card sales">
              <h4>Total Sales</h4>
              <p>LKR {summary.totalSales}</p>
            </div>
            <div className="summary-card expenses">
              <h4>Total Expenses</h4>
              <p>LKR {summary.totalExpenses}</p>
            </div>
            <div className="summary-card profit">
              <h4>Profit</h4>
              <p className={summary.profit >= 0 ? 'positive' : 'negative'}>
                LKR {summary.profit}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="chart-grid">
            <div className="chart-container">
              <h4>Summary Bar Chart</h4>
              {barData && <Bar data={barData} options={chartOptions} />}
            </div>
            <div className="chart-container">
              <h4>Sales vs Expenses</h4>
              {pieData && <Pie data={pieData} options={chartOptions} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitSummary;