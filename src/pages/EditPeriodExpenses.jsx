import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PeriodExpensesForm.css';

const EditPeriodExpenses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true);
      try {
        console.log('Fetching expenses for id:', id);
        const response = await api.get(`/expenses`, {
          params: { id },
        });
        const expenses = response.data;
        console.log('Fetched expenses:', expenses);

        if (!expenses || !expenses.id) {
          throw new Error('No valid expense data returned');
        }

        const newFormData = {
          startDate: expenses.start_date || '',
          endDate: expenses.end_date || '',
          prevRawMaterialRubber: expenses.prev_raw_material_rubber != null ? expenses.prev_raw_material_rubber.toString() : '',
          prevRawMaterialPvc: expenses.prev_raw_material_pvc != null ? expenses.prev_raw_material_pvc.toString() : '',
          currentRawMaterialRubber: expenses.current_raw_material_rubber != null ? expenses.current_raw_material_rubber.toString() : '',
          currentRawMaterialPvc: expenses.current_raw_material_pvc != null ? expenses.current_raw_material_pvc.toString() : '',
          postage: expenses.postage != null ? expenses.postage.toString() : '',
          accountantFees: expenses.accountant_fees != null ? expenses.accountant_fees.toString() : '',
          rubberDevelopmentFee: expenses.rubber_development_fee != null ? expenses.rubber_development_fee.toString() : '',
          licence: expenses.licence != null ? expenses.licence.toString() : '',
          envLicence: expenses.env_licence != null ? expenses.env_licence.toString() : '',
          pradeshiyaSabaFee: expenses.pradeshiya_saba_fee != null ? expenses.pradeshiya_saba_fee.toString() : '',
          polythene: expenses.polythene != null ? expenses.polythene.toString() : '',
          casualWages: expenses.casual_wages != null ? expenses.casual_wages.toString() : '',
          salary: expenses.salary != null ? expenses.salary.toString() : '',
          epf: expenses.epf != null ? expenses.epf.toString() : '',
          etf: expenses.etf != null ? expenses.etf.toString() : '',
          telephoneCharges: expenses.telephone_charges != null ? expenses.telephone_charges.toString() : '',
          electricity: expenses.electricity != null ? expenses.electricity.toString() : '',
          water: expenses.water != null ? expenses.water.toString() : '',
          travellingExpense: expenses.travelling_expense != null ? expenses.travelling_expense.toString() : '',
          rent: expenses.rent != null ? expenses.rent.toString() : '',
          transport: expenses.transport != null ? expenses.transport.toString() : '',
          otherExpenses: expenses.other_expenses != null ? expenses.other_expenses.toString() : '',
        };

        setFormData(newFormData);
        const totalExpenses = [
          expenses.prev_raw_material_rubber,
          expenses.prev_raw_material_pvc,
          expenses.current_raw_material_rubber,
          expenses.current_raw_material_pvc,
          expenses.postage,
          expenses.accountant_fees,
          expenses.rubber_development_fee,
          expenses.licence,
          expenses.env_licence,
          expenses.pradeshiya_saba_fee,
          expenses.polythene,
          expenses.casual_wages,
          expenses.salary,
          expenses.epf,
          expenses.etf,
          expenses.telephone_charges,
          expenses.electricity,
          expenses.water,
          expenses.travelling_expense,
          expenses.rent,
          expenses.transport,
          expenses.other_expenses,
        ].reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
        setTotal(totalExpenses.toFixed(2));
      } catch (error) {
        console.error('Error loading expenses:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          requestUrl: `http://localhost:5000/api/expenses?id=${id}`,
        });
        setErrorMessage(error.response?.data?.error || 'Failed to load expenses for editing.');
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [id]);

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

      console.log('Sending PUT /api/expenses/:id with payload:', payload);
      await api.put(`/expenses/${id}`, payload);
      setSuccessMessage('✅ Expenses updated successfully!'); // Set success message
      setTimeout(() => {
        setSuccessMessage(''); // Clear message after 2 seconds
        navigate('/view-period-expenses'); // Navigate after message display
      }, 2000);
    } catch (error) {
      console.error('Error updating expenses:', error);
      setErrorMessage(
        error.response?.data?.error || `❌ Failed to update expenses: ${error.message}`
      );
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="period-expenses-wrapper">
        <div className="period-expenses-container">
          <h2 className="form-title">Edit Period Expenses</h2>
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="period-expenses-wrapper">
      <div className="period-expenses-container">
        <h2 className="form-title">Edit Period Expenses</h2>
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
            Update Expenses
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPeriodExpenses;