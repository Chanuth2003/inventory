// import React, { useState } from 'react';
// import axios from 'axios';
// import '../styles/PeriodExpensesForm.css';

// const PeriodExpensesForm = () => {
//   const [formData, setFormData] = useState({
//     startDate: '',
//     endDate: '',
//     prevRawMaterialRubber: '',
//     prevRawMaterialPvc: '',
//     currentRawMaterialRubber: '',
//     currentRawMaterialPvc: '',
//     postage: '',
//     accountantFees: '',
//     rubberDevelopmentFee: '',
//     licence: '',
//     envLicence: '',
//     pradeshiyaSabaFee: '',
//     polythene: '',
//     casualWages: '',
//     salary: '',
//     epf: '',
//     etf: '',
//     telephoneCharges: '',
//     electricity: '',
//     water: '',
//     travellingExpense: '',
//     rent: '',
//     transport: '',
//     otherExpenses: '',
//   });

//   const [total, setTotal] = useState(0);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const newFormData = { ...formData, [name]: value };
//     setFormData(newFormData);

//     // Calculate total
//     const totalExpenses = [
//       'prevRawMaterialRubber',
//       'prevRawMaterialPvc',
//       'currentRawMaterialRubber',
//       'currentRawMaterialPvc',
//       'postage',
//       'accountantFees',
//       'rubberDevelopmentFee',
//       'licence',
//       'envLicence',
//       'pradeshiyaSabaFee',
//       'polythene',
//       'casualWages',
//       'salary',
//       'epf',
//       'etf',
//       'telephoneCharges',
//       'electricity',
//       'water',
//       'travellingExpense',
//       'rent',
//       'transport',
//       'otherExpenses',
//     ].reduce((sum, key) => sum + (parseFloat(newFormData[key]) || 0), 0);
//     setTotal(totalExpenses.toFixed(2));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('/api/expenses', {
//         start_date: formData.startDate,
//         end_date: formData.endDate,
//         prev_raw_material_rubber: formData.prevRawMaterialRubber || null,
//         prev_raw_material_pvc: formData.prevRawMaterialPvc || null,
//         current_raw_material_rubber: formData.currentRawMaterialRubber || null,
//         current_raw_material_pvc: formData.currentRawMaterialPvc || null,
//         postage: formData.postage || null,
//         accountant_fees: formData.accountantFees || null,
//         rubber_development_fee: formData.rubberDevelopmentFee || null,
//         licence: formData.licence || null,
//         env_licence: formData.envLicence || null,
//         pradeshiya_saba_fee: formData.pradeshiyaSabaFee || null,
//         polythene: formData.polythene || null,
//         casual_wages: formData.casualWages || null,
//         salary: formData.salary || null,
//         epf: formData.epf || null,
//         etf: formData.etf || null,
//         telephone_charges: formData.telephoneCharges || null,
//         electricity: formData.electricity || null,
//         water: formData.water || null,
//         travelling_expense: formData.travellingExpense || null,
//         rent: formData.rent || null,
//         transport: formData.transport || null,
//         other_expenses: formData.otherExpenses || null,
//       });
//       alert('Expenses saved successfully!');
//       setFormData({
//         startDate: '',
//         endDate: '',
//         prevRawMaterialRubber: '',
//         prevRawMaterialPvc: '',
//         currentRawMaterialRubber: '',
//         currentRawMaterialPvc: '',
//         postage: '',
//         accountantFees: '',
//         rubberDevelopmentFee: '',
//         licence: '',
//         envLicence: '',
//         pradeshiyaSabaFee: '',
//         polythene: '',
//         casualWages: '',
//         salary: '',
//         epf: '',
//         etf: '',
//         telephoneCharges: '',
//         electricity: '',
//         water: '',
//         travellingExpense: '',
//         rent: '',
//         transport: '',
//         otherExpenses: '',
//       });
//       setTotal(0);
//     } catch (error) {
//       console.error('Error saving expenses:', error);
//       alert('Failed to save expenses.');
//     }
//   };

//   return (
//     <div className="period-expenses-form-container">
//       <h2 className="form-title">Period Expenses Form</h2>
//       <form onSubmit={handleSubmit} className="expenses-form">
//         <div className="form-grid">
//           <div className="form-group">
//             <label className="form-label">Start Date</label>
//             <input
//               type="date"
//               name="startDate"
//               value={formData.startDate}
//               onChange={handleChange}
//               className="form-input"
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label className="form-label">End Date</label>
//             <input
//               type="date"
//               name="endDate"
//               value={formData.endDate}
//               onChange={handleChange}
//               className="form-input"
//               required
//             />
//           </div>
//         </div>
//         <h3 className="form-section-title">Previous Raw Material Balance</h3>
//         <div className="form-grid">
//           <div className="form-group">
//             <label className="form-label">Rubber</label>
//             <input
//               type="number"
//               name="prevRawMaterialRubber"
//               value={formData.prevRawMaterialRubber}
//               onChange={handleChange}
//               className="form-input"
//               step="0.01"
//             />
//           </div>
//           <div className="form-group">
//             <label className="form-label">PVC</label>
//             <input
//               type="number"
//               name="prevRawMaterialPvc"
//               value={formData.prevRawMaterialPvc}
//               onChange={handleChange}
//               className="form-input"
//               step="0.01"
//             />
//           </div>
//         </div>
//         <h3 className="form-section-title">Current Year Raw Material Cost</h3>
//         <div className="form-grid">
//           <div className="form-group">
//             <label className="form-label">Rubber</label>
//             <input
//               type="number"
//               name="currentRawMaterialRubber"
//               value={formData.currentRawMaterialRubber}
//               onChange={handleChange}
//               className="form-input"
//               step="0.01"
//             />
//           </div>
//           <div className="form-group">
//             <label className="form-label">PVC</label>
//             <input
//               type="number"
//               name="currentRawMaterialPvc"
//               value={formData.currentRawMaterialPvc}
//               onChange={handleChange}
//               className="form-input"
//               step="0.01"
//             />
//           </div>
//         </div>
//         {[
//           { label: 'Postage', name: 'postage' },
//           { label: 'Accountant Fees', name: 'accountantFees' },
//           { label: 'Rubber Development Fee', name: 'rubberDevelopmentFee' },
//           { label: 'Licence', name: 'licence' },
//           { label: 'Environmental Licence', name: 'envLicence' },
//           { label: 'Pradeshiya Saba Fee', name: 'pradeshiyaSabaFee' },
//           { label: 'Polythene', name: 'polythene' },
//           { label: 'Casual Wages', name: 'casualWages' },
//           { label: 'Salary', name: 'salary' },
//           { label: 'E.P.F', name: 'epf' },
//           { label: 'E.T.F', name: 'etf' },
//           { label: 'Telephone Charges', name: 'telephoneCharges' },
//           { label: 'Electricity', name: 'electricity' },
//           { label: 'Water', name: 'water' },
//           { label: 'Travelling Expense', name: 'travellingExpense' },
//           { label: 'Rent', name: 'rent' },
//           { label: 'Transport', name: 'transport' },
//           { label: 'Other Expenses', name: 'otherExpenses' },
//         ].map((field) => (
//           <div className="form-group" key={field.name}>
//             <label className="form-label">{field.label}</label>
//             <input
//               type="number"
//               name={field.name}
//               value={formData[field.name]}
//               onChange={handleChange}
//               className="form-input"
//               step="0.01"
//             />
//           </div>
//         ))}
//         <div className="form-total">
//           Total Expenses: LKR {total}
//         </div>
//         <button type="submit" className="form-submit-button">
//           Save Expenses
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PeriodExpensesForm;





















import React, { useState } from 'react';
import axios from 'axios';
import '../styles/PeriodExpensesForm.css';

const PeriodExpensesForm = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    prevRawMaterialRubber: '',
    prevRawMaterialPvc: '',
    currentRawMaterialRubber: '',
    currentRawMaterialPvc: '',
    postage: '',
    accountantFees: '',
    rubberDevelopmentFee: '',
    licence: '',
    envLicence: '',
    pradeshiyaSabaFee: '',
    polythene: '',
    casualWages: '',
    salary: '',
    epf: '',
    etf: '',
    telephoneCharges: '',
    electricity: '',
    water: '',
    travellingExpense: '',
    rent: '',
    transport: '',
    otherExpenses: '',
  });
  const [total, setTotal] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const totalExpenses = [
      'prevRawMaterialRubber',
      'prevRawMaterialPvc',
      'currentRawMaterialRubber',
      'currentRawMaterialPvc',
      'postage',
      'accountantFees',
      'rubberDevelopmentFee',
      'licence',
      'envLicence',
      'pradeshiyaSabaFee',
      'polythene',
      'casualWages',
      'salary',
      'epf',
      'etf',
      'telephoneCharges',
      'electricity',
      'water',
      'travellingExpense',
      'rent',
      'transport',
      'otherExpenses',
    ].reduce((sum, key) => sum + (parseFloat(newFormData[key]) || 0), 0);
    setTotal(totalExpenses.toFixed(2));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.startDate || !formData.endDate) {
      setErrorMessage('Please select both start and end dates.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setErrorMessage('Start date must be before end date.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const expenseFields = [
      'prevRawMaterialRubber',
      'prevRawMaterialPvc',
      'currentRawMaterialRubber',
      'currentRawMaterialPvc',
      'postage',
      'accountantFees',
      'rubberDevelopmentFee',
      'licence',
      'envLicence',
      'pradeshiyaSabaFee',
      'polythene',
      'casualWages',
      'salary',
      'epf',
      'etf',
      'telephoneCharges',
      'electricity',
      'water',
      'travellingExpense',
      'rent',
      'transport',
      'otherExpenses',
    ];
    const hasExpenses = expenseFields.some((key) => {
      const value = parseFloat(formData[key]);
      return !isNaN(value) && value > 0;
    });
    if (!hasExpenses) {
      setErrorMessage('At least one valid expense (greater than 0) is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const payload = {
        start_date: formData.startDate,
        end_date: formData.endDate,
        prev_raw_material_rubber: parseFloat(formData.prevRawMaterialRubber) || null,
        prev_raw_material_pvc: parseFloat(formData.prevRawMaterialPvc) || null,
        current_raw_material_rubber: parseFloat(formData.currentRawMaterialRubber) || null,
        current_raw_material_pvc: parseFloat(formData.currentRawMaterialPvc) || null,
        postage: parseFloat(formData.postage) || null,
        accountant_fees: parseFloat(formData.accountantFees) || null,
        rubber_development_fee: parseFloat(formData.rubberDevelopmentFee) || null,
        licence: parseFloat(formData.licence) || null,
        env_licence: parseFloat(formData.envLicence) || null,
        pradeshiya_saba_fee: parseFloat(formData.pradeshiyaSabaFee) || null,
        polythene: parseFloat(formData.polythene) || null,
        casual_wages: parseFloat(formData.casualWages) || null,
        salary: parseFloat(formData.salary) || null,
        epf: parseFloat(formData.epf) || null,
        etf: parseFloat(formData.etf) || null,
        telephone_charges: parseFloat(formData.telephoneCharges) || null,
        electricity: parseFloat(formData.electricity) || null,
        water: parseFloat(formData.water) || null,
        travelling_expense: parseFloat(formData.travellingExpense) || null,
        rent: parseFloat(formData.rent) || null,
        transport: parseFloat(formData.transport) || null,
        other_expenses: parseFloat(formData.otherExpenses) || null,
      };

      const response = await axios.post('http://localhost:5000/api/period-expenses', payload);
      setSuccessMessage('✅ Expenses saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setFormData({
        startDate: '',
        endDate: '',
        prevRawMaterialRubber: '',
        prevRawMaterialPvc: '',
        currentRawMaterialRubber: '',
        currentRawMaterialPvc: '',
        postage: '',
        accountantFees: '',
        rubberDevelopmentFee: '',
        licence: '',
        envLicence: '',
        pradeshiyaSabaFee: '',
        polythene: '',
        casualWages: '',
        salary: '',
        epf: '',
        etf: '',
        telephoneCharges: '',
        electricity: '',
        water: '',
        travellingExpense: '',
        rent: '',
        transport: '',
        otherExpenses: '',
      });
      setTotal(0);
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error saving expenses:', error);
      setErrorMessage(
        error.response?.data?.error || `❌ Failed to save expenses: ${error.message}`
      );
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="period-expenses-wrapper">
      <div className="period-expenses-container">
        <h2 className="form-title">Period Expenses Form</h2>
        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit} className="expenses-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
          <h3 className="form-section-title">Previous Raw Material Balance</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Rubber</label>
              <input
                type="number"
                name="prevRawMaterialRubber"
                value={formData.prevRawMaterialRubber}
                onChange={handleChange}
                onWheel={handleWheel}
                className="form-input"
                step="0.01"
                min="0"
                placeholder="Enter amount"
              />
            </div>
            <div className="form-group">
              <label className="form-label">PVC</label>
              <input
                type="number"
                name="prevRawMaterialPvc"
                value={formData.prevRawMaterialPvc}
                onChange={handleChange}
                onWheel={handleWheel}
                className="form-input"
                step="0.01"
                min="0"
                placeholder="Enter amount"
              />
            </div>
          </div>
          <h3 className="form-section-title">Current Year Raw Material Cost</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Rubber</label>
              <input
                type="number"
                name="currentRawMaterialRubber"
                value={formData.currentRawMaterialRubber}
                onChange={handleChange}
                onWheel={handleWheel}
                className="form-input"
                step="0.01"
                min="0"
                placeholder="Enter amount"
              />
            </div>
            <div className="form-group">
              <label className="form-label">PVC</label>
              <input
                type="number"
                name="currentRawMaterialPvc"
                value={formData.currentRawMaterialPvc}
                onChange={handleChange}
                onWheel={handleWheel}
                className="form-input"
                step="0.01"
                min="0"
                placeholder="Enter amount"
              />
            </div>
          </div>
          <h3 className="form-section-title">Other Expenses</h3>
          <div className="form-grid">
            {[
              { label: 'Postage', name: 'postage' },
              { label: 'Accountant Fees', name: 'accountantFees' },
              { label: 'Rubber Development Fee', name: 'rubberDevelopmentFee' },
              { label: 'Licence', name: 'licence' },
              { label: 'Environmental Licence', name: 'envLicence' },
              { label: 'Pradeshiya Saba Fee', name: 'pradeshiyaSabaFee' },
              { label: 'Polythene', name: 'polythene' },
              { label: 'Casual Wages', name: 'casualWages' },
              { label: 'Salary', name: 'salary' },
              { label: 'E.P.F', name: 'epf' },
              { label: 'E.T.F', name: 'etf' },
              { label: 'Telephone Charges', name: 'telephoneCharges' },
              { label: 'Electricity', name: 'electricity' },
              { label: 'Water', name: 'water' },
              { label: 'Travelling Expense', name: 'travellingExpense' },
              { label: 'Rent', name: 'rent' },
              { label: 'Transport', name: 'transport' },
              { label: 'Other Expenses', name: 'otherExpenses' },
            ].map((field) => (
              <div className="form-group" key={field.name}>
                <label className="form-label">{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onWheel={handleWheel}
                  className="form-input"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                />
              </div>
            ))}
          </div>
          <div className="form-total">
            Total Expenses: LKR {total}
          </div>
          <button type="submit" className="form-submit-button">
            Save Expenses
          </button>
        </form>
      </div>
    </div>
  );
};

export default PeriodExpensesForm;