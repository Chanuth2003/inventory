
// import React, { useState } from 'react';
// import axios from 'axios';
// import '../styles/ViewPeriodExpenses.css';

// const ViewPeriodExpenses = () => {
//   const [dates, setDates] = useState({ startDate: '', endDate: '' });
//   const [expenses, setExpenses] = useState(null);
//   const [editing, setEditing] = useState(false);
//   const [editForm, setEditForm] = useState({});
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);

//   const handleDateChange = (e) => {
//     setDates({ ...dates, [e.target.name]: e.target.value });
//     setError(null);
//   };

//   const fetchExpenses = async () => {
//     if (!dates.startDate || !dates.endDate) {
//       setError('Please select both start and end dates.');
//       setTimeout(() => setError(null), 3000);
//       return;
//     }
//     if (new Date(dates.startDate) > new Date(dates.endDate)) {
//       setError('Start date must be before end date.');
//       setTimeout(() => setError(null), 3000);
//       return;
//     }
//     try {
//       const response = await axios.get('http://localhost:5000/api/expenses', {
//         params: { startDate: dates.startDate, endDate: dates.endDate },
//       });
//       console.log('API Response:', response.data);
//       setExpenses(response.data);
//       setEditForm({
//         start_date: response.data.start_date,
//         end_date: response.data.end_date,
//         prev_raw_material_rubber: response.data.prev_raw_material_rubber || '',
//         prev_raw_material_pvc: response.data.prev_raw_material_pvc || '',
//         current_raw_material_rubber: response.data.current_raw_material_rubber || '',
//         current_raw_material_pvc: response.data.current_raw_material_pvc || '',
//         postage: response.data.postage || '',
//         accountant_fees: response.data.accountant_fees || '',
//         rubber_development_fee: response.data.rubber_development_fee || '',
//         licence: response.data.licence || '',
//         env_licence: response.data.env_licence || '',
//         pradeshiya_saba_fee: response.data.pradeshiya_saba_fee || '',
//         polythene: response.data.polythene || '',
//         casual_wages: response.data.casual_wages || '',
//         salary: response.data.salary || '',
//         epf: response.data.epf || '',
//         etf: response.data.etf || '',
//         telephone_charges: response.data.telephone_charges || '',
//         electricity: response.data.electricity || '',
//         water: response.data.water || '',
//         travelling_expense: response.data.travelling_expense || '',
//         rent: response.data.rent || '',
//         transport: response.data.transport || '',
//         other_expenses: response.data.other_expenses || '',
//       });
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching expenses:', error);
//       setExpenses(null);
//       setError(error.response?.data?.error || 'Failed to fetch expenses.');
//       setTimeout(() => setError(null), 3000);
//     }
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm({ ...editForm, [name]: value });
//   };

//   // Prevent scroll wheel from changing number input values
//   const handleWheel = (e) => {
//     e.preventDefault();
//     e.target.blur();
//   };

//   const handleEditSubmit = async () => {
//     if (!editForm.start_date || !editForm.end_date) {
//       setError('Please provide both start and end dates.');
//       setTimeout(() => setError(null), 3000);
//       return;
//     }
//     if (new Date(editForm.start_date) > new Date(editForm.end_date)) {
//       setError('Start date must be before end date.');
//       setTimeout(() => setError(null), 3000);
//       return;
//     }
//     const expenseFields = [
//       'prev_raw_material_rubber',
//       'prev_raw_material_pvc',
//       'current_raw_material_rubber',
//       'current_raw_material_pvc',
//       'postage',
//       'accountant_fees',
//       'rubber_development_fee',
//       'licence',
//       'env_licence',
//       'pradeshiya_saba_fee',
//       'polythene',
//       'casual_wages',
//       'salary',
//       'epf',
//       'etf',
//       'telephone_charges',
//       'electricity',
//       'water',
//       'travelling_expense',
//       'rent',
//       'transport',
//       'other_expenses',
//     ];
//     const hasExpenses = expenseFields.some((key) => {
//       const value = parseFloat(editForm[key]);
//       return !isNaN(value) && value > 0;
//     });
//     if (!hasExpenses) {
//       setError('At least one valid expense (greater than 0) is required.');
//       setTimeout(() => setError(null), 3000);
//       return;
//     }
//     try {
//       const payload = {
//         start_date: editForm.start_date ? new Date(editForm.start_date).toISOString().split('T')[0] : null,
//         end_date: editForm.end_date ? new Date(editForm.end_date).toISOString().split('T')[0] : null,
//         prev_raw_material_rubber: parseFloat(editForm.prev_raw_material_rubber) || null,
//         prev_raw_material_pvc: parseFloat(editForm.prev_raw_material_pvc) || null,
//         current_raw_material_rubber: parseFloat(editForm.current_raw_material_rubber) || null,
//         current_raw_material_pvc: parseFloat(editForm.current_raw_material_pvc) || null,
//         postage: parseFloat(editForm.postage) || null,
//         accountant_fees: parseFloat(editForm.accountant_fees) || null,
//         rubber_development_fee: parseFloat(editForm.rubber_development_fee) || null,
//         licence: parseFloat(editForm.licence) || null,
//         env_licence: parseFloat(editForm.env_licence) || null,
//         pradeshiya_saba_fee: parseFloat(editForm.pradeshiya_saba_fee) || null,
//         polythene: parseFloat(editForm.polythene) || null,
//         casual_wages: parseFloat(editForm.casual_wages) || null,
//         salary: parseFloat(editForm.salary) || null,
//         epf: parseFloat(editForm.epf) || null,
//         etf: parseFloat(editForm.etf) || null,
//         telephone_charges: parseFloat(editForm.telephone_charges) || null,
//         electricity: parseFloat(editForm.electricity) || null,
//         water: parseFloat(editForm.water) || null,
//         travelling_expense: parseFloat(editForm.travelling_expense) || null,
//         rent: parseFloat(editForm.rent) || null,
//         transport: parseFloat(editForm.transport) || null,
//         other_expenses: parseFloat(editForm.other_expenses) || null,
//       };
//       console.log('Sending PUT /api/expenses/:id:', payload);
//       await axios.put(`http://localhost:5000/api/expenses/${expenses.id}`, payload);
//       setExpenses({ ...editForm, start_date: payload.start_date, end_date: payload.end_date });
//       setEditing(false);
//       setError(null);
//       setSuccessMessage('✅ Expenses updated successfully!');
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error('Error updating expenses:', error);
//       setError(error.response?.data?.error || `Failed to update expenses: ${error.message}`);
//       setTimeout(() => setError(null), 3000);
//     }
//   };

//   return (
//     <div className="view-expenses-wrapper">
//       <div className="view-expenses-container">
//         <h2 className="view-title">View Period Expenses</h2>
//         {successMessage && <div className="success-message">{successMessage}</div>}
//         {error && <div className="error-message">{error}</div>}
//         <div className="view-date-grid">
//           <div className="form-group">
//             <label className="form-label">Start Date</label>
//             <input
//               type="date"
//               name="startDate"
//               value={dates.startDate}
//               onChange={handleDateChange}
//               className="form-input"
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label className="form-label">End Date</label>
//             <input
//               type="date"
//               name="endDate"
//               value={dates.endDate}
//               onChange={handleDateChange}
//               className="form-input"
//               required
//             />
//           </div>
//         </div>
//         <button onClick={fetchExpenses} className="fetch-button">
//           Fetch Expenses
//         </button>
//         {expenses && (
//           <div className="expenses-display">
//             {editing ? (
//               <div className="edit-form">
//                 <h3 className="form-section-title">Edit Expenses</h3>
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label className="form-label">Start Date</label>
//                     <input
//                       type="date"
//                       name="start_date"
//                       value={editForm.start_date || ''}
//                       onChange={handleEditChange}
//                       className="form-input"
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">End Date</label>
//                     <input
//                       type="date"
//                       name="end_date"
//                       value={editForm.end_date || ''}
//                       onChange={handleEditChange}
//                       className="form-input"
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Previous Raw Material - Rubber</label>
//                     <input
//                       type="number"
//                       name="prev_raw_material_rubber"
//                       value={editForm.prev_raw_material_rubber || ''}
//                       onChange={handleEditChange}
//                       onWheel={handleWheel}
//                       className="form-input"
//                       step="0.01"
//                       min="0"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Previous Raw Material - PVC</label>
//                     <input
//                       type="number"
//                       name="prev_raw_material_pvc"
//                       value={editForm.prev_raw_material_pvc || ''}
//                       onChange={handleEditChange}
//                       onWheel={handleWheel}
//                       className="form-input"
//                       step="0.01"
//                       min="0"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Current Raw Material - Rubber</label>
//                     <input
//                       type="number"
//                       name="current_raw_material_rubber"
//                       value={editForm.current_raw_material_rubber || ''}
//                       onChange={handleEditChange}
//                       onWheel={handleWheel}
//                       className="form-input"
//                       step="0.01"
//                       min="0"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Current Raw Material - PVC</label>
//                     <input
//                       type="number"
//                       name="current_raw_material_pvc"
//                       value={editForm.current_raw_material_pvc || ''}
//                       onChange={handleEditChange}
//                       onWheel={handleWheel}
//                       className="form-input"
//                       step="0.01"
//                       min="0"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                   {[
//                     { label: 'Postage', name: 'postage' },
//                     { label: 'Accountant Fees', name: 'accountant_fees' },
//                     { label: 'Rubber Development Fee', name: 'rubber_development_fee' },
//                     { label: 'Licence', name: 'licence' },
//                     { label: 'Environmental Licence', name: 'env_licence' },
//                     { label: 'Pradeshiya Saba Fee', name: 'pradeshiya_saba_fee' },
//                     { label: 'Polythene', name: 'polythene' },
//                     { label: 'Casual Wages', name: 'casual_wages' },
//                     { label: 'Salary', name: 'salary' },
//                     { label: 'E.P.F', name: 'epf' },
//                     { label: 'E.T.F', name: 'etf' },
//                     { label: 'Telephone Charges', name: 'telephone_charges' },
//                     { label: 'Electricity', name: 'electricity' },
//                     { label: 'Water', name: 'water' },
//                     { label: 'Travelling Expense', name: 'travelling_expense' },
//                     { label: 'Rent', name: 'rent' },
//                     { label: 'Transport', name: 'transport' },
//                     { label: 'Other Expenses', name: 'other_expenses' },
//                   ].map((field) => (
//                     <div className="form-group" key={field.name}>
//                       <label className="form-label">{field.label}</label>
//                       <input
//                         type="number"
//                         name={field.name}
//                         value={editForm[field.name] || ''}
//                         onChange={handleEditChange}
//                         onWheel={handleWheel}
//                         className="form-input"
//                         step="0.01"
//                         min="0"
//                         placeholder="Enter amount"
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="edit-buttons">
//                   <button onClick={handleEditSubmit} className="save-button">
//                     Save Changes
//                   </button>
//                   <button onClick={() => setEditing(false)} className="cancel-button">
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <h3 className="form-section-title">Expenses for {expenses.start_date} to {expenses.end_date}</h3>
//                 <div className="expenses-grid">
//                   <div className="expense-item">Previous Raw Material - Rubber: LKR {expenses.prev_raw_material_rubber || 0}</div>
//                   <div className="expense-item">Previous Raw Material - PVC: LKR {expenses.prev_raw_material_pvc || 0}</div>
//                   <div className="expense-item">Current Raw Material - Rubber: LKR {expenses.current_raw_material_rubber || 0}</div>
//                   <div className="expense-item">Current Raw Material - PVC: LKR {expenses.current_raw_material_pvc || 0}</div>
//                   <div className="expense-item">Postage: LKR {expenses.postage || 0}</div>
//                   <div className="expense-item">Accountant Fees: LKR {expenses.accountant_fees || 0}</div>
//                   <div className="expense-item">Rubber Development Fee: LKR {expenses.rubber_development_fee || 0}</div>
//                   <div className="expense-item">Licence: LKR {expenses.licence || 0}</div>
//                   <div className="expense-item">Environmental Licence: LKR {expenses.env_licence || 0}</div>
//                   <div className="expense-item">Pradeshiya Saba Fee: LKR {expenses.pradeshiya_saba_fee || 0}</div>
//                   <div className="expense-item">Polythene: LKR {expenses.polythene || 0}</div>
//                   <div className="expense-item">Casual Wages: LKR {expenses.casual_wages || 0}</div>
//                   <div className="expense-item">Salary: LKR {expenses.salary || 0}</div>
//                   <div className="expense-item">E.P.F: LKR {expenses.epf || 0}</div>
//                   <div className="expense-item">E.T.F: LKR {expenses.etf || 0}</div>
//                   <div className="expense-item">Telephone Charges: LKR {expenses.telephone_charges || 0}</div>
//                   <div className="expense-item">Electricity: LKR {expenses.electricity || 0}</div>
//                   <div className="expense-item">Water: LKR {expenses.water || 0}</div>
//                   <div className="expense-item">Travelling Expense: LKR {expenses.travelling_expense || 0}</div>
//                   <div className="expense-item">Rent: LKR {expenses.rent || 0}</div>
//                   <div className="expense-item">Transport: LKR {expenses.transport || 0}</div>
//                   <div className="expense-item">Other Expenses: LKR {expenses.other_expenses || 0}</div>
//                 </div>
//                 <div className="form-total">
//                   Total Expenses: LKR {expenses.total_expenses || 0}
//                 </div>
//                 <button onClick={() => setEditing(true)} className="edit-button">
//                   Edit Expenses
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewPeriodExpenses;























import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../styles/ViewPeriodExpenses.css';

const ViewPeriodExpenses = () => {
  const [dateRanges, setDateRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDateRanges = async () => {
      try {
        const response = await api.get('/expense-dates');
        console.log('Available Date Ranges:', response.data);
        setDateRanges(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching date ranges:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError(error.response?.data?.error || 'Failed to fetch available date ranges.');
        setTimeout(() => setError(null), 3000);
      }
    };
    fetchDateRanges();
  }, []);

  const fetchExpenses = async (id, startDate, endDate) => {
    console.log('Sending GET /api/expenses with:', { id, startDate, endDate });
    try {
      const response = await api.get('/expenses', {
        params: { id },
      });
      const fetchedExpenses = response.data;
      console.log('Received API Response:', fetchedExpenses);
      setExpenses(fetchedExpenses);
      setSelectedRange({ id, startDate, endDate });
      setSuccessMessage('✅ Expenses fetched successfully!');
      setError(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error fetching expenses:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestUrl: `http://localhost:5000/api/expenses?id=${id}`,
      });
      setExpenses(null);
      setError(error.response?.data?.error || `Failed to fetch expenses: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setSuccessMessage('✅ Expenses deleted successfully!');
      setExpenses(null);
      setSelectedRange(null);
      setDateRanges(dateRanges.filter((range) => range.id !== id));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting expenses:', error);
      setError(error.response?.data?.error || `Failed to delete expenses: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (expenses) => {
    console.log('Navigating to edit with expenses:', expenses);
    if (!expenses || !expenses.id) {
      console.error('Invalid expenses data for edit:', expenses);
      setError('No valid expense data to edit.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    navigate(`/edit-period-expenses/${expenses.id}`, { state: { expenses } });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="view-expenses-wrapper">
      <div className="view-expenses-container">
        <h2 className="view-title">View Period Expenses</h2>
        {successMessage && <div className="success-message">{successMessage}</div>}
        {error && <div className="error-message">{error}</div>}
        <div className="date-ranges-section">
          <h3 className="form-section-title">Available Expense Periods</h3>
          {dateRanges.length > 0 ? (
            <ul className="date-ranges-list">
              {dateRanges.map((range) => (
                <li
                  key={range.id}
                  className={`date-range-item ${selectedRange?.id === range.id ? 'selected' : ''}`}
                  onClick={() => fetchExpenses(range.id, range.start_date, range.end_date)}
                >
                  {formatDate(range.start_date)} to {formatDate(range.end_date)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No expense periods found in the database.</p>
          )}
        </div>
        {expenses && (
          <div className="expenses-display">
            <h3 className="form-section-title">
              Expenses for {formatDate(expenses.start_date)} to {formatDate(expenses.end_date)}
            </h3>
            <div className="expenses-grid">
              <div className="expense-item">Previous Raw Material - Rubber: LKR {expenses.prev_raw_material_rubber || 0}</div>
              <div className="expense-item">Previous Raw Material - PVC: LKR {expenses.prev_raw_material_pvc || 0}</div>
              <div className="expense-item">Current Raw Material - Rubber: LKR {expenses.current_raw_material_rubber || 0}</div>
              <div className="expense-item">Current Raw Material - PVC: LKR {expenses.current_raw_material_pvc || 0}</div>
              <div className="expense-item">Postage: LKR {expenses.postage || 0}</div>
              <div className="expense-item">Accountant Fees: LKR {expenses.accountant_fees || 0}</div>
              <div className="expense-item">Rubber Development Fee: LKR {expenses.rubber_development_fee || 0}</div>
              <div className="expense-item">Licence: LKR {expenses.licence || 0}</div>
              <div className="expense-item">Environmental Licence: LKR {expenses.env_licence || 0}</div>
              <div className="expense-item">Pradeshiya Saba Fee: LKR {expenses.pradeshiya_saba_fee || 0}</div>
              <div className="expense-item">Polythene: LKR {expenses.polythene || 0}</div>
              <div className="expense-item">Casual Wages: LKR {expenses.casual_wages || 0}</div>
              <div className="expense-item">Salary: LKR {expenses.salary || 0}</div>
              <div className="expense-item">E.P.F: LKR {expenses.epf || 0}</div>
              <div className="expense-item">E.T.F: LKR {expenses.etf || 0}</div>
              <div className="expense-item">Telephone Charges: LKR {expenses.telephone_charges || 0}</div>
              <div className="expense-item">Electricity: LKR {expenses.electricity || 0}</div>
              <div className="expense-item">Water: LKR {expenses.water || 0}</div>
              <div className="expense-item">Travelling Expense: LKR {expenses.travelling_expense || 0}</div>
              <div className="expense-item">Rent: LKR {expenses.rent || 0}</div>
              <div className="expense-item">Transport: LKR {expenses.transport || 0}</div>
              <div className="expense-item">Other Expenses: LKR {expenses.other_expenses || 0}</div>
            </div>
            <div className="form-total">
              Total Expenses: LKR {expenses.total_expenses || 0}
            </div>
            <div className="action-buttons">
              <button
                className="edit-button"
                onClick={() => handleEdit(expenses)}
              >
                Edit Expenses
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(expenses.id)}
              >
                Delete Expenses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPeriodExpenses;

