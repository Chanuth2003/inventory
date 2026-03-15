

// import { useState, useEffect } from 'react';
// import '../styles/MonthlyExpenses.css';

// const MonthlyExpenses = () => {
//   const [formData, setFormData] = useState({
//     year: new Date().getFullYear(),
//     month: new Date().getMonth() + 1,
//     casual_wages: '',
//     salary: '',
//     epf: '',
//     etf: '',
//     telephone_charges: '',
//     electricity: '',
//     water: '',
//     travelling_expense: '',
//     rent: '',
//     transport: '',
//     other_expenses: '',
//     other_description: ''
//   });
//   const [dataExists, setDataExists] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   // Fetch existing data for the selected year/month
//   useEffect(() => {
//     const initialFormData = {
//       year: new Date().getFullYear(),
//       month: new Date().getMonth() + 1,
//       casual_wages: '',
//       salary: '',
//       epf: '',
//       etf: '',
//       telephone_charges: '',
//       electricity: '',
//       water: '',
//       travelling_expense: '',
//       rent: '',
//       transport: '',
//       other_expenses: '',
//       other_description: ''
//     };

//     const fetchExpenses = async () => {
//       if (!formData.year || !formData.month) {
//         setError('Please enter a valid year and month');
//         setDataExists(false);
//         return;
//       }

//       try {
//         console.log('Fetching monthly expenses for year:', formData.year, 'month:', formData.month);
//         const response = await fetch(`/api/monthly-expenses/${formData.year}/${formData.month}`);
//         if (!response.ok) {
//           if (response.status === 404) {
//             console.log('No data found for year:', formData.year, 'month:', formData.month);
//             setDataExists(false);
//             setFormData((prev) => ({ ...initialFormData, year: prev.year, month: prev.month }));
//             return;
//           }
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch monthly expenses`);
//         }
//         const data = await response.json();
//         console.log('Fetched monthly expenses:', data);

//         // Check if any expense field has a non-null, non-zero value
//         const expenseFields = [
//           'casual_wages',
//           'salary',
//           'epf',
//           'etf',
//           'telephone_charges',
//           'electricity',
//           'water',
//           'travelling_expense',
//           'rent',
//           'transport',
//           'other_expenses'
//         ];
//         const hasData = expenseFields.some((field) => {
//           const value = data[field];
//           return value !== null && value !== undefined && parseFloat(value) > 0;
//         });

//         if (hasData) {
//           setDataExists(true);
//           setFormData((prev) => ({
//             ...prev,
//             ...data,
//             casual_wages: data.casual_wages || '',
//             salary: data.salary || '',
//             epf: data.epf || '',
//             etf: data.etf || '',
//             telephone_charges: data.telephone_charges || '',
//             electricity: data.electricity || '',
//             water: data.water || '',
//             travelling_expense: data.travelling_expense || '',
//             rent: data.rent || '',
//             transport: data.transport || '',
//             other_expenses: data.other_expenses || '',
//             other_description: data.other_description || ''
//           }));
//         } else {
//           console.log('No meaningful data found (all expense fields are null or 0)');
//           setDataExists(false);
//           setFormData((prev) => ({ ...initialFormData, year: prev.year, month: prev.month }));
//         }
//       } catch (err) {
//         console.error('Error fetching monthly expenses:', err.message);
//         setError(err.message);
//         setDataExists(false);
//       }
//     };
//     fetchExpenses();
//   }, [formData.year, formData.month]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // Only allow changes to year and month if data exists
//     if (dataExists && name !== 'year' && name !== 'month') {
//       return;
//     }
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (dataExists) {
//       setError(`Expenses for ${formData.year} - Month ${formData.month} already exist. Please select a different month or view/edit in View Monthly Expenses.`);
//       return;
//     }

//     // Validate required fields
//     if (!formData.year || !formData.month) {
//       setError('Year and month are required');
//       return;
//     }
//     if (formData.month < 1 || formData.month > 12) {
//       setError('Month must be between 1 and 12');
//       return;
//     }

//     try {
//       const response = await fetch('/api/monthly-expenses', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           year: parseInt(formData.year),
//           month: parseInt(formData.month),
//           casual_wages: parseFloat(formData.casual_wages) || 0,
//           salary: parseFloat(formData.salary) || 0,
//           epf: parseFloat(formData.epf) || 0,
//           etf: parseFloat(formData.etf) || 0,
//           telephone_charges: parseFloat(formData.telephone_charges) || 0,
//           electricity: parseFloat(formData.electricity) || 0,
//           water: parseFloat(formData.water) || 0,
//           travelling_expense: parseFloat(formData.travelling_expense) || 0,
//           rent: parseFloat(formData.rent) || 0,
//           transport: parseFloat(formData.transport) || 0,
//           other_expenses: parseFloat(formData.other_expenses) || 0,
//           other_description: formData.other_description || ''
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to save monthly expenses');
//       }

//       const result = await response.json();
//       setSuccess(result.message);
//       // Reset non-required fields but keep year and month
//       setFormData((prev) => ({
//         year: prev.year,
//         month: prev.month,
//         casual_wages: '',
//         salary: '',
//         epf: '',
//         etf: '',
//         telephone_charges: '',
//         electricity: '',
//         water: '',
//         travelling_expense: '',
//         rent: '',
//         transport: '',
//         other_expenses: '',
//         other_description: ''
//       }));
//       setDataExists(false);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="monthly-expenses-wrapper">
//       <div className="monthly-expenses-container">
//         <div className="monthly-expenses-card">
//           <h2 className="monthly-expenses-title">Monthly Expenses</h2>
//           {error && (
//             <div
//               className="error-message"
//               style={{ color: '#e74c3c', marginBottom: '15px', padding: '10px', background: '#ffebee', borderRadius: '5px' }}
//             >
//               {error}
//             </div>
//           )}
//           {success && (
//             <div
//               className="success-message"
//               style={{ color: '#2ecc71', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '5px' }}
//             >
//               {success}
//             </div>
//           )}
//           <form onSubmit={handleSubmit} className="monthly-expenses-form">
//             <div className="form-group">
//               <label>Year:</label>
//               <input
//                 type="number"
//                 name="year"
//                 value={formData.year}
//                 onChange={handleChange}
//                 required
//                 min="2000"
//                 max={new Date().getFullYear() + 1}
//               />
//             </div>
//             <div className="form-group">
//               <label>Month (1-12):</label>
//               <input
//                 type="number"
//                 name="month"
//                 value={formData.month}
//                 onChange={handleChange}
//                 min="1"
//                 max="12"
//                 required
//               />
//             </div>
//             {dataExists ? (
//               <div className="no-data" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
//                 <p>Expenses for {formData.year} - Month {formData.month} already exist. Please select a different month or view/edit in View Monthly Expenses.</p>
//                 <table className="expenses-table">
//                   <thead>
//                     <tr>
//                       <th>Category</th>
//                       <th>Value</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {Object.entries(formData)
//                       .filter(([key]) => key !== 'year' && key !== 'month' && key !== 'id' && key !== 'created_at' && key !== 'other_description')
//                       .map(([key, value]) => (
//                         <tr key={key}>
//                           <td>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</td>
//                           <td>
//                             {typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))
//                               ? `LKR ${parseFloat(value || 0).toFixed(2)}`
//                               : value || '-'}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <>
//                 <div className="form-group">
//                   <label>Casual Wages:</label>
//                   <input
//                     type="number"
//                     name="casual_wages"
//                     value={formData.casual_wages}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Salary:</label>
//                   <input
//                     type="number"
//                     name="salary"
//                     value={formData.salary}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>EPF:</label>
//                   <input
//                     type="number"
//                     name="epf"
//                     value={formData.epf}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>ETF:</label>
//                   <input
//                     type="number"
//                     name="etf"
//                     value={formData.etf}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Telephone Charges:</label>
//                   <input
//                     type="number"
//                     name="telephone_charges"
//                     value={formData.telephone_charges}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Electricity:</label>
//                   <input
//                     type="number"
//                     name="electricity"
//                     value={formData.electricity}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Water:</label>
//                   <input
//                     type="number"
//                     name="water"
//                     value={formData.water}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Travelling Expense:</label>
//                   <input
//                     type="number"
//                     name="travelling_expense"
//                     value={formData.travelling_expense}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Rent:</label>
//                   <input
//                     type="number"
//                     name="rent"
//                     value={formData.rent}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Transport:</label>
//                   <input
//                     type="number"
//                     name="transport"
//                     value={formData.transport}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label>Other Expenses:</label>
//                   <input
//                     type="number"
//                     name="other_expenses"
//                     value={formData.other_expenses}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                   />
//                 </div>
//                 {/* <div className="form-group">
//                   <label>Other Description:</label>
//                   <input
//                     type="text"
//                     name="other_description"
//                     value={formData.other_description}
//                     onChange={handleChange}
//                     placeholder="Description for other expenses"
//                   />
//                 </div> */}
//                 <button
//                   type="submit"
//                   className="monthly-expenses-submit-btn"
//                   disabled={dataExists}
//                   style={{ opacity: dataExists ? 0.5 : 1, cursor: dataExists ? 'not-allowed' : 'pointer' }}
//                 >
//                   Save Monthly Expenses
//                 </button>
//               </>
//             )}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MonthlyExpenses;














































import { useState, useEffect } from 'react';
import '../styles/MonthlyExpenses.css';

const MonthlyExpenses = () => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    casual_wages: '',
    salary: '',
    epf: '',
    etf: '',
    telephone_charges: '',
    electricity: '',
    water: '',
    travelling_expense: '',
    rent: '',
    transport: '',
    other_expenses: '',
    other_description: ''
  });
  const [dataExists, setDataExists] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur(); // Optional: blur to prevent further scroll interaction
  };

  // Fetch existing data for the selected year/month
  useEffect(() => {
    const initialFormData = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      casual_wages: '',
      salary: '',
      epf: '',
      etf: '',
      telephone_charges: '',
      electricity: '',
      water: '',
      travelling_expense: '',
      rent: '',
      transport: '',
      other_expenses: '',
      other_description: ''
    };

    const fetchExpenses = async () => {
      if (!formData.year || !formData.month) {
        setError('Please enter a valid year and month');
        setDataExists(false);
        return;
      }

      try {
        console.log('Fetching monthly expenses for year:', formData.year, 'month:', formData.month);
        const response = await fetch(`/api/monthly-expenses/${formData.year}/${formData.month}`);
        if (!response.ok) {
          if (response.status === 404) {
            console.log('No data found for year:', formData.year, 'month:', formData.month);
            setDataExists(false);
            setFormData((prev) => ({ ...initialFormData, year: prev.year, month: prev.month }));
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch monthly expenses`);
        }
        const data = await response.json();
        console.log('Fetched monthly expenses:', data);

        // Check if any expense field has a non-null, non-zero value
        const expenseFields = [
          'casual_wages',
          'salary',
          'epf',
          'etf',
          'telephone_charges',
          'electricity',
          'water',
          'travelling_expense',
          'rent',
          'transport',
          'other_expenses'
        ];
        const hasData = expenseFields.some((field) => {
          const value = data[field];
          return value !== null && value !== undefined && parseFloat(value) > 0;
        });

        if (hasData) {
          setDataExists(true);
          setFormData((prev) => ({
            ...prev,
            ...data,
            casual_wages: data.casual_wages || '',
            salary: data.salary || '',
            epf: data.epf || '',
            etf: data.etf || '',
            telephone_charges: data.telephone_charges || '',
            electricity: data.electricity || '',
            water: data.water || '',
            travelling_expense: data.travelling_expense || '',
            rent: data.rent || '',
            transport: data.transport || '',
            other_expenses: data.other_expenses || '',
            other_description: data.other_description || ''
          }));
        } else {
          console.log('No meaningful data found (all expense fields are null or 0)');
          setDataExists(false);
          setFormData((prev) => ({ ...initialFormData, year: prev.year, month: prev.month }));
        }
      } catch (err) {
        console.error('Error fetching monthly expenses:', err.message);
        setError(err.message);
        setDataExists(false);
      }
    };
    fetchExpenses();
  }, [formData.year, formData.month]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow changes to year and month if data exists
    if (dataExists && name !== 'year' && name !== 'month') {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (dataExists) {
      setError(`Expenses for ${formData.year} - Month ${formData.month} already exist. Please select a different month or view/edit in View Monthly Expenses.`);
      return;
    }

    // Validate required fields
    if (!formData.year || !formData.month) {
      setError('Year and month are required');
      return;
    }
    if (formData.month < 1 || formData.month > 12) {
      setError('Month must be between 1 and 12');
      return;
    }

    try {
      const response = await fetch('/api/monthly-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          casual_wages: parseFloat(formData.casual_wages) || 0,
          salary: parseFloat(formData.salary) || 0,
          epf: parseFloat(formData.epf) || 0,
          etf: parseFloat(formData.etf) || 0,
          telephone_charges: parseFloat(formData.telephone_charges) || 0,
          electricity: parseFloat(formData.electricity) || 0,
          water: parseFloat(formData.water) || 0,
          travelling_expense: parseFloat(formData.travelling_expense) || 0,
          rent: parseFloat(formData.rent) || 0,
          transport: parseFloat(formData.transport) || 0,
          other_expenses: parseFloat(formData.other_expenses) || 0,
          other_description: formData.other_description || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save monthly expenses');
      }

      const result = await response.json();
      setSuccess(result.message);
      setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
      // Reset non-required fields but keep year and month
      setFormData((prev) => ({
        year: prev.year,
        month: prev.month,
        casual_wages: '',
        salary: '',
        epf: '',
        etf: '',
        telephone_charges: '',
        electricity: '',
        water: '',
        travelling_expense: '',
        rent: '',
        transport: '',
        other_expenses: '',
        other_description: ''
      }));
      setDataExists(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="monthly-expenses-wrapper">
      <div className="monthly-expenses-container">
        <div className="monthly-expenses-card">
          <h2 className="monthly-expenses-title">Monthly Expenses</h2>
          {error && (
            <div className="error-message">{error}</div>
          )}
          {success && (
            <div className="success-message">{success}</div>
          )}
          <form onSubmit={handleSubmit} className="monthly-expenses-form">
            <div className="form-group">
              <label>Year:</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                onWheel={handleWheel}
                required
                min="2000"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div className="form-group">
              <label>Month (1-12):</label>
              <input
                type="number"
                name="month"
                value={formData.month}
                onChange={handleChange}
                onWheel={handleWheel}
                min="1"
                max="12"
                required
              />
            </div>
            {dataExists ? (
              <div className="no-data">
                <p>Expenses for {formData.year} - Month {formData.month} already exist. Please select a different month or view/edit in View Monthly Expenses.</p>
                <div className="table-container">
                  <table className="expenses-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(formData)
                        .filter(([key]) => key !== 'year' && key !== 'month' && key !== 'id' && key !== 'created_at')
                        .map(([key, value]) => (
                          <tr key={key}>
                            <td>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</td>
                            <td>
                              {typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))
                                ? `LKR ${parseFloat(value || 0).toFixed(2)}`
                                : value || '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Casual Wages:</label>
                  <input
                    type="number"
                    name="casual_wages"
                    value={formData.casual_wages}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Salary:</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>EPF:</label>
                  <input
                    type="number"
                    name="epf"
                    value={formData.epf}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>ETF:</label>
                  <input
                    type="number"
                    name="etf"
                    value={formData.etf}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Telephone Charges:</label>
                  <input
                    type="number"
                    name="telephone_charges"
                    value={formData.telephone_charges}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Electricity:</label>
                  <input
                    type="number"
                    name="electricity"
                    value={formData.electricity}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Water:</label>
                  <input
                    type="number"
                    name="water"
                    value={formData.water}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Travelling Expense:</label>
                  <input
                    type="number"
                    name="travelling_expense"
                    value={formData.travelling_expense}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Rent:</label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Transport:</label>
                  <input
                    type="number"
                    name="transport"
                    value={formData.transport}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Other Expenses:</label>
                  <input
                    type="number"
                    name="other_expenses"
                    value={formData.other_expenses}
                    onChange={handleChange}
                    onWheel={handleWheel}
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Other Description:</label>
                  <input
                    type="text"
                    name="other_description"
                    value={formData.other_description}
                    onChange={handleChange}
                    placeholder="Description for other expenses"
                  />
                </div>
                <button
                  type="submit"
                  className="monthly-expenses-submit-btn"
                  disabled={dataExists}
                >
                  Save Monthly Expenses
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenses;