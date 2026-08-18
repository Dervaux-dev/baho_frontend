import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_API_URL;

const emptyForm = {
  name: '',
  category: 'groceries',
  totalBudget: '',
  period: 'monthly',
  startDate: '',
  endDate: '',
  householdSize: 4,
  householdType: 'family',
  location: 'Kigali, Rwanda',
  city: 'Kigali',
  country: 'Rwanda',
};

export default function BudgetManager({ budgets, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState(null);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/budgets`, {
        ...form,
        totalBudget: Number(form.totalBudget),
        householdSize: Number(form.householdSize),
      });
      setForm(emptyForm);
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget and all its spending records?')) return;
    try {
      await axios.delete(`${API}/budgets/${id}`);
      if (selectedBudget?._id === id) { setSelectedBudget(null); setAnalytics(null); }
      onRefresh();
    } catch (err) { alert('Failed to delete budget'); }
  };

  const viewAnalytics = async (budget) => {
    setSelectedBudget(budget);
    setAnalytics(null);
    setOptimizeResult(null);
    try {
      const res = await axios.get(`${API}/budgets/${budget._id}`);
      if (res.data.success) setAnalytics(res.data.data.analytics);
    } catch (err) { console.error('Failed to load analytics:', err); }
  };

  const handleOptimize = async (budget) => {
    setOptimizing(true);
    setOptimizeResult(null);
    try {
      const res = await axios.post(`${API}/budgets/${budget._id}/optimize`);
      if (res.data.success) setOptimizeResult(res.data.data);
    } catch (err) {
      setOptimizeResult({ error: err.response?.data?.error || 'AI optimization failed. Make sure n8n automation is enabled for this budget.' });
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="db-budgets">
      <div className="db-section-header">
        <p className="db-section-desc">Create and manage your household budgets with AI-powered insights.</p>
        <button className="db-btn db-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Budget'}
        </button>
      </div>

      {showForm && (
        <div className="db-card db-form-card">
          <h3 className="db-card-title">Create New Budget</h3>
          {error && <div className="db-alert db-alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="db-form">
            <div className="db-form-row">
              <div className="db-form-group">
                <label>Budget Name *</label>
                <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Monthly Groceries" required />
              </div>
              <div className="db-form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                  <option value="groceries">Groceries</option>
                  <option value="meals">Meals</option>
                  <option value="ingredients">Ingredients</option>
                  <option value="household">Household</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="db-form-row">
              <div className="db-form-group">
                <label>Total Budget (RWF) *</label>
                <input type="number" min="1" value={form.totalBudget} onChange={(e) => handleChange('totalBudget', e.target.value)} placeholder="e.g. 150000" required />
              </div>
              <div className="db-form-group">
                <label>Period</label>
                <select value={form.period} onChange={(e) => handleChange('period', e.target.value)}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="db-form-row">
              <div className="db-form-group">
                <label>Start Date *</label>
                <input type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} required />
              </div>
              <div className="db-form-group">
                <label>End Date *</label>
                <input type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} required />
              </div>
            </div>
            <div className="db-form-row">
              <div className="db-form-group">
                <label>Household Size</label>
                <input type="number" min="1" value={form.householdSize} onChange={(e) => handleChange('householdSize', e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Household Type</label>
                <select value={form.householdType} onChange={(e) => handleChange('householdType', e.target.value)}>
                  <option value="single">Single</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="shared household">Shared Household</option>
                </select>
              </div>
              <div className="db-form-group">
                <label>City</label>
                <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="db-btn db-btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create Budget'}
            </button>
          </form>
        </div>
      )}

      <div className="db-budget-list">
        {budgets.length === 0 ? (
          <div className="db-card db-empty-state">
            <p>No budgets created yet. Click "New Budget" to get started.</p>
          </div>
        ) : (
          budgets.map((b) => (
            <div key={b._id} className={`db-card db-budget-card ${selectedBudget?._id === b._id ? 'selected' : ''}`}>
              <div className="db-budget-header">
                <div>
                  <h4 className="db-budget-name">{b.name}</h4>
                  <span className="db-badge">{b.category}</span>
                  <span className={`db-badge db-badge-${b.status}`}>{b.status}</span>
                </div>
                <div className="db-budget-actions">
                  <button className="db-btn db-btn-sm db-btn-secondary" onClick={() => viewAnalytics(b)}>Analytics</button>
                  <button className="db-btn db-btn-sm db-btn-primary" onClick={() => handleOptimize(b)} disabled={optimizing}>
                    {optimizing ? 'AI...' : 'AI Optimize'}
                  </button>
                  <button className="db-btn db-btn-sm db-btn-danger" onClick={() => handleDelete(b._id)}>Delete</button>
                </div>
              </div>
              <div className="db-budget-details">
                <div className="db-budget-detail">
                  <span className="db-detail-label">Budget</span>
                  <span className="db-detail-value">RWF {b.totalBudget?.toLocaleString()}</span>
                </div>
                <div className="db-budget-detail">
                  <span className="db-detail-label">Period</span>
                  <span className="db-detail-value">{b.period}</span>
                </div>
                <div className="db-budget-detail">
                  <span className="db-detail-label">Household</span>
                  <span className="db-detail-value">{b.householdSize} ({b.householdType})</span>
                </div>
                <div className="db-budget-detail">
                  <span className="db-detail-label">Dates</span>
                  <span className="db-detail-value">
                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBudget && analytics && (
        <div className="db-card db-analytics-panel">
          <h3 className="db-card-title">Analytics: {selectedBudget.name}</h3>
          <div className="db-analytics-grid">
            <div className="db-analytics-stat">
              <span className="db-analytics-label">Budget Used</span>
              <span className="db-analytics-value">
                {analytics.budgetStatus?.percentageUsed?.toFixed(1) || 0}%
              </span>
              <div className="db-progress-bar">
                <div
                  className="db-progress-fill"
                  style={{
                    width: `${Math.min(analytics.budgetStatus?.percentageUsed || 0, 100)}%`,
                    background: (analytics.budgetStatus?.percentageUsed || 0) > 90 ? '#ef4444' : (analytics.budgetStatus?.percentageUsed || 0) > 70 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
            </div>
            <div className="db-analytics-stat">
              <span className="db-analytics-label">Remaining</span>
              <span className="db-analytics-value">RWF {(analytics.budgetStatus?.remaining || selectedBudget.totalBudget).toLocaleString()}</span>
            </div>
            <div className="db-analytics-stat">
              <span className="db-analytics-label">Total Spent</span>
              <span className="db-analytics-value">RWF {(analytics.budgetStatus?.totalSpent || 0).toLocaleString()}</span>
            </div>
            <div className="db-analytics-stat">
              <span className="db-analytics-label">Transactions</span>
              <span className="db-analytics-value">{analytics.totalRecords || 0}</span>
            </div>
          </div>
          {analytics.recommendations && analytics.recommendations.length > 0 && (
            <div className="db-recommendations">
              <h4>AI Recommendations</h4>
              <ul>
                {analytics.recommendations.map((rec, i) => (
                  <li key={i}>{typeof rec === 'string' ? rec : rec.message || rec.text || JSON.stringify(rec)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {optimizeResult && !optimizeResult.error && (
        <div className="db-card db-analytics-panel">
          <h3 className="db-card-title">AI Optimization Results</h3>
          <div className="db-analytics-grid">
            <div className="db-analytics-stat">
              <span className="db-analytics-label">Potential Savings</span>
              <span className="db-analytics-value" style={{ color: '#10b981' }}>RWF {(optimizeResult.potentialSavings || 0).toLocaleString()}</span>
            </div>
          </div>
          {optimizeResult.recommendations && optimizeResult.recommendations.length > 0 && (
            <div className="db-recommendations">
              <h4>Optimization Recommendations</h4>
              <ul>
                {optimizeResult.recommendations.map((rec, i) => (
                  <li key={i}>
                    <strong>{rec.title || `Recommendation ${i + 1}`}</strong>: {rec.detail || rec.message || JSON.stringify(rec)}
                    {rec.estimatedSaving && <span style={{ color: '#10b981', marginLeft: 8 }}>(Save RWF {rec.estimatedSaving})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {optimizeResult?.error && (
        <div className="db-card">
          <div className="db-alert db-alert-error">{optimizeResult.error}</div>
        </div>
      )}
    </div>
  );
}
