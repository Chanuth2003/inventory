import { useState, useEffect } from 'react';
import '../styles/ViewMonthlyExpenses.css';

const ViewMonthlyExpenses = () => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [expenses, setExpenses] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!formData.year || !formData.month) {
        setError('Please enter a valid year and month');
        return;
      }
      setLoading(true);
      setError(null);
      setSuccess(null);
      setExpenses(null);
      setTotalCost(0);

      try {
        console.log('Fetching monthly expenses for year:', formData.year, 'month:', formData.month);
        const response = await fetch(`/api/monthly-expenses/${formData.year}/${formData.month}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('No data found for this month');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch monthly expenses`);
        }
        const expensesData = await response.json();
        console.log('Monthly expenses data:', expensesData);
        setExpenses(expensesData);

        const total = Object.entries(expensesData || {})
          .filter(([key]) => key !== 'year' && key !== 'month' && key !== 'id' && key !== 'created_at' && key !== 'other_description')
          .reduce((sum, [, value]) => {
            const numValue = parseFloat(value);
            return sum + (isNaN(numValue) ? 0 : numValue);
          }, 0);
        setTotalCost(total);
        setError(null);
      } catch (err) {
        console.error('Fetch error in ViewMonthlyExpenses:', err.message);
        setError(err.message);
        setExpenses(null);
        setTotalCost(0);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [formData.year, formData.month]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value === '' ? '' : parseInt(value);
    const currentYear = new Date().getFullYear();

    if (name === 'year' && parsedValue !== '' && (parsedValue < 2000 || parsedValue > currentYear + 1)) {
      return;
    }
    if (name === 'month' && parsedValue !== '' && (parsedValue < 1 || parsedValue > 12)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue === '' ? (name === 'year' ? currentYear : 1) : parsedValue,
    }));
  };

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e) => {
    e.preventDefault();
    e.target.blur(); // Optional: blur to prevent further scroll interaction
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenses((prev) => ({
      ...prev,
      [name]: value === '' ? '' : name === 'other_description' ? value : parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
          ...expenses,
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          casual_wages: parseFloat(expenses.casual_wages) || 0,
          salary: parseFloat(expenses.salary) || 0,
          epf: parseFloat(expenses.epf) || 0,
          etf: parseFloat(expenses.etf) || 0,
          telephone_charges: parseFloat(expenses.telephone_charges) || 0,
          electricity: parseFloat(expenses.electricity) || 0,
          water: parseFloat(expenses.water) || 0,
          travelling_expense: parseFloat(expenses.travelling_expense) || 0,
          rent: parseFloat(expenses.rent) || 0,
          transport: parseFloat(expenses.transport) || 0,
          other_expenses: parseFloat(expenses.other_expenses) || 0,
          other_description: expenses.other_description || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save monthly expenses');
      }

      const result = await response.json();
      setSuccess(result.message);
      setIsEditing(false);
      const total = Object.entries(expenses || {})
        .filter(([key]) => key !== 'year' && key !== 'month' && key !== 'id' && key !== 'created_at' && key !== 'other_description')
        .reduce((sum, [, value]) => {
          const numValue = parseFloat(value);
          return sum + (isNaN(numValue) ? 0 : numValue);
        }, 0);
      setTotalCost(total);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="view-monthly-expenses-wrapper">
        <div className="view-monthly-expenses-container">
          <div className="view-monthly-expenses-card">
            <h2 className="view-monthly-expenses-title">Loading...</h2>
            <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
              Fetching monthly expenses for {formData.year} - Month {formData.month}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-monthly-expenses-wrapper">
      <div className="view-monthly-expenses-container">
        <div className="view-monthly-expenses-card">
          <h2 className="view-monthly-expenses-title">Monthly Expenses</h2>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form className="view-monthly-expenses-form">
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
                disabled={isEditing}
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
                disabled={isEditing}
              />
            </div>
          </form>

          {expenses ? (
            <>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="monthly-expenses-form">
                  {[
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
                    'other_expenses',
                  ].map((key) => (
                    <div className="form-group" key={key}>
                      <label>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:</label>
                      <input
                        type="number"
                        name={key}
                        value={expenses[key] || ''}
                        onChange={handleExpenseChange}
                        onWheel={handleWheel}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Other Description:</label>
                    <input
                      type="text"
                      name="other_description"
                      value={expenses.other_description || ''}
                      onChange={handleExpenseChange}
                      placeholder="Description for other expenses"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="monthly-expenses-submit-btn">
                      Save Changes
                    </button>
                    <button type="button" className="monthly-expenses-cancel-btn" onClick={toggleEditMode}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="expenses-view">
                  {Object.entries(expenses)
                    .filter(([key]) => key !== 'year' && key !== 'month' && key !== 'id' && key !== 'created_at')
                    .map(([key, value]) => (
                      <div className="expense-item" key={key}>
                        <span className="expense-label">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:</span>
                        <span className="expense-value">
                          {key === 'other_description'
                            ? value || '-'
                            : `LKR ${parseFloat(value || 0).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  <button className="monthly-expenses-edit-btn" onClick={toggleEditMode}>
                    Edit Expenses
                  </button>
                </div>
              )}
              <div className="total-row">
                Total Cost: LKR {totalCost.toFixed(2)}
              </div>
            </>
          ) : (
            <div className="no-data">
              No expenses found for {formData.year} - Month {formData.month}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMonthlyExpenses;