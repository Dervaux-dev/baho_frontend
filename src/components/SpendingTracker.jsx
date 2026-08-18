import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_API_URL;

const emptyForm = {
  item: '',
  category: 'produce',
  amount: '',
  quantityValue: '',
  quantityUnit: 'kg',
  vendor: '',
  transactionDate: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function SpendingTracker({ budgets }) {
  const [selectedBudget, setSelectedBudget] = useState(budgets[0]?._id || '');
  const [spending, setSpending] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptText, setReceiptText] = useState('');
  const [validating, setValidating] = useState(false);
  const [receiptResult, setReceiptResult] = useState(null);
  const [detectingAnomalies, setDetectingAnomalies] = useState(false);
  const [anomalyResult, setAnomalyResult] = useState(null);

  const fetchSpending = useCallback(async () => {
    if (!selectedBudget) return;
    try {
      const res = await axios.get(`${API}/spending/${selectedBudget}`);
      if (res.data.success) setSpending(res.data.data);
    } catch (err) { console.error('Failed to fetch spending:', err); }
  }, [selectedBudget]);

  const fetchAnalytics = useCallback(async () => {
    if (!selectedBudget) return;
    try {
      const res = await axios.get(`${API}/spending/${selectedBudget}/analytics`);
      if (res.data.success) setAnalytics(res.data.data);
    } catch (err) { console.error('Failed to fetch analytics:', err); }
  }, [selectedBudget]);

  useEffect(() => { fetchSpending(); fetchAnalytics(); }, [fetchSpending, fetchAnalytics]);

  useEffect(() => { if (budgets.length && !selectedBudget) setSelectedBudget(budgets[0]._id); }, [budgets, selectedBudget]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/spending`, {
        budget: selectedBudget,
        item: form.item,
        category: form.category,
        amount: Number(form.amount),
        quantity: { value: Number(form.quantityValue), unit: form.quantityUnit },
        vendor: form.vendor,
        transactionDate: form.transactionDate,
        notes: form.notes,
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchSpending();
      fetchAnalytics();
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to log spending');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this spending record?')) return;
    try {
      await axios.delete(`${API}/spending/${id}`);
      fetchSpending();
      fetchAnalytics();
    } catch (err) { alert('Failed to delete record'); }
  };

  const handleValidateReceipt = async () => {
    if (!receiptText.trim() || !selectedBudget) return;
    setValidating(true);
    setReceiptResult(null);
    try {
      const res = await axios.post(`${API}/spending/validate-receipt`, {
        budgetId: selectedBudget,
        receiptData: { text: receiptText.trim(), total: 0 },
      });
      if (res.data.success) setReceiptResult(res.data.data);
    } catch (err) {
      setReceiptResult({ error: err.response?.data?.error || 'Receipt validation failed' });
    } finally {
      setValidating(false);
    }
  };

  const handleDetectAnomalies = async () => {
    if (!selectedBudget) return;
    setDetectingAnomalies(true);
    setAnomalyResult(null);
    try {
      const res = await axios.post(`${API}/spending/detect-anomalies/${selectedBudget}`);
      if (res.data.success) setAnomalyResult(res.data.data);
    } catch (err) {
      setAnomalyResult({ error: err.response?.data?.error || 'Anomaly detection failed' });
    } finally {
      setDetectingAnomalies(false);
    }
  };

  const totalSpent = spending.reduce((sum, s) => sum + (s.amount || 0), 0);
  const budget = budgets.find((b) => b._id === selectedBudget);

  return (
    <div className="db-spending">
      <div className="db-section-header">
        <div className="db-form-group" style={{ marginBottom: 0, minWidth: 240 }}>
          <select value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)}>
            <option value="">Select a budget</option>
            {budgets.map((b) => (
              <option key={b._id} value={b._id}>{b.name} (RWF {b.totalBudget?.toLocaleString()})</option>
            ))}
          </select>
        </div>
        <button className="db-btn db-btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedBudget}>
          {showForm ? 'Cancel' : '+ Log Spending'}
        </button>
      </div>

      {!selectedBudget ? (
        <div className="db-card db-empty-state">
          <p>Select a budget to track spending, or create one in the Budgets tab first.</p>
        </div>
      ) : (
        <>
          {showForm && (
            <div className="db-card db-form-card">
              <h3 className="db-card-title">Log Spending Transaction</h3>
              {error && <div className="db-alert db-alert-error">{error}</div>}
              <form onSubmit={handleSubmit} className="db-form">
                <div className="db-form-row">
                  <div className="db-form-group">
                    <label>Item *</label>
                    <input type="text" value={form.item} onChange={(e) => handleChange('item', e.target.value)} placeholder="e.g. Maize Flour" required />
                  </div>
                  <div className="db-form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                      <option value="produce">Produce</option>
                      <option value="dairy">Dairy</option>
                      <option value="meat">Meat</option>
                      <option value="pantry">Pantry</option>
                      <option value="frozen">Frozen</option>
                      <option value="beverages">Beverages</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="db-form-row">
                  <div className="db-form-group">
                    <label>Amount (RWF) *</label>
                    <input type="number" min="1" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="e.g. 3500" required />
                  </div>
                  <div className="db-form-group">
                    <label>Quantity *</label>
                    <div className="db-input-group">
                      <input type="number" min="0.1" step="0.1" value={form.quantityValue} onChange={(e) => handleChange('quantityValue', e.target.value)} placeholder="Qty" required style={{ flex: 1 }} />
                      <select value={form.quantityUnit} onChange={(e) => handleChange('quantityUnit', e.target.value)} style={{ flex: 1 }}>
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                        <option value="liter">liter</option>
                        <option value="piece">piece</option>
                        <option value="box">box</option>
                        <option value="bundle">bundle</option>
                      </select>
                    </div>
                  </div>
                  <div className="db-form-group">
                    <label>Vendor *</label>
                    <input type="text" value={form.vendor} onChange={(e) => handleChange('vendor', e.target.value)} placeholder="e.g. Kimironko Market" required />
                  </div>
                </div>
                <div className="db-form-row">
                  <div className="db-form-group">
                    <label>Date *</label>
                    <input type="date" value={form.transactionDate} onChange={(e) => handleChange('transactionDate', e.target.value)} required />
                  </div>
                  <div className="db-form-group" style={{ flex: 2 }}>
                    <label>Notes</label>
                    <input type="text" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Optional notes" />
                  </div>
                </div>
                <button type="submit" className="db-btn db-btn-success" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Transaction'}
                </button>
              </form>
            </div>
          )}

          <div className="db-spending-overview">
            <div className="db-mini-stat">
              <span className="db-mini-stat-label">Total Spent</span>
              <span className="db-mini-stat-value">RWF {totalSpent.toLocaleString()}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-mini-stat-label">Budget</span>
              <span className="db-mini-stat-value">RWF {budget?.totalBudget?.toLocaleString()}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-mini-stat-label">Remaining</span>
              <span className="db-mini-stat-value">RWF {((budget?.totalBudget || 0) - totalSpent).toLocaleString()}</span>
            </div>
            <div className="db-mini-stat">
              <span className="db-mini-stat-label">Transactions</span>
              <span className="db-mini-stat-value">{spending.length}</span>
            </div>
          </div>

          <div className="db-market-tools" style={{ marginBottom: 16 }}>
            <div className="db-card db-tool-card">
              <h4>Validate Receipt (AI)</h4>
              <div className="db-input-group">
                <textarea
                  value={receiptText}
                  onChange={(e) => setReceiptText(e.target.value)}
                  placeholder="Paste receipt text here..."
                  rows={3}
                  style={{ flex: 1, resize: 'vertical' }}
                />
              </div>
              <button className="db-btn db-btn-secondary" onClick={handleValidateReceipt} disabled={validating || !receiptText.trim()}>
                {validating ? 'Validating...' : 'Validate Receipt'}
              </button>
              {receiptResult && !receiptResult.error && (
                <div className="db-prediction-result" style={{ marginTop: 8 }}>
                  <div><strong>Valid:</strong> {receiptResult.isValid ? 'Yes' : 'No'}</div>
                  <div><strong>Total:</strong> RWF {receiptResult.totalAmount?.toLocaleString()}</div>
                  {receiptResult.validatedItems?.length > 0 && (
                    <div><strong>Items:</strong> {receiptResult.validatedItems.map(i => `${i.name} (RWF ${i.price})`).join(', ')}</div>
                  )}
                </div>
              )}
              {receiptResult?.error && <p className="db-text-danger" style={{ marginTop: 8 }}>{receiptResult.error}</p>}
            </div>

            <div className="db-card db-tool-card">
              <h4>Detect Anomalies (AI)</h4>
              <p className="db-empty-text" style={{ marginBottom: 8 }}>Scan spending patterns for unusual activity</p>
              <button className="db-btn db-btn-secondary" onClick={handleDetectAnomalies} disabled={detectingAnomalies}>
                {detectingAnomalies ? 'Scanning...' : 'Detect Anomalies'}
              </button>
              {anomalyResult && !anomalyResult.error && (
                <div className="db-prediction-result" style={{ marginTop: 8 }}>
                  {anomalyResult.anomalies?.length > 0 ? (
                    <div><strong>Anomalies:</strong> {anomalyResult.anomalies.map(a => a.message || a.type).join('; ')}</div>
                  ) : (
                    <div style={{ color: '#10b981' }}>No anomalies detected</div>
                  )}
                  {anomalyResult.alerts?.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <strong>Alerts:</strong>
                      <ul style={{ margin: '4px 0 0 16px' }}>
                        {anomalyResult.alerts.map((a, i) => (
                          <li key={i} style={{ color: a.level === 'critical' ? '#ef4444' : a.level === 'warning' ? '#f59e0b' : '#6b7280' }}>
                            [{a.level}] {a.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {anomalyResult?.error && <p className="db-text-danger" style={{ marginTop: 8 }}>{anomalyResult.error}</p>}
            </div>
          </div>

          <div className="db-card">
            <h3 className="db-card-title">Transaction History</h3>
            {spending.length === 0 ? (
              <p className="db-empty-text">No transactions recorded yet.</p>
            ) : (
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {spending.map((s) => (
                      <tr key={s._id}>
                        <td>{new Date(s.transactionDate).toLocaleDateString()}</td>
                        <td><strong>{s.item}</strong></td>
                        <td><span className="db-badge">{s.category}</span></td>
                        <td>{s.quantity?.value} {s.quantity?.unit}</td>
                        <td>{s.vendor}</td>
                        <td className="db-amount">RWF {s.amount?.toLocaleString()}</td>
                        <td>
                          <button className="db-btn-icon" onClick={() => handleDelete(s._id)} title="Delete">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {analytics && analytics.spendingByCategory && Object.keys(analytics.spendingByCategory).length > 0 && (
            <div className="db-card">
              <h3 className="db-card-title">Spending by Category</h3>
              <div className="db-category-bars">
                {Object.entries(analytics.spendingByCategory).map(([cat, data]) => {
                  const pct = totalSpent > 0 ? ((data.total || 0) / totalSpent * 100) : 0;
                  return (
                    <div key={cat} className="db-category-bar-item">
                      <div className="db-category-bar-header">
                        <span className="db-badge">{cat}</span>
                        <span>RWF {(data.total || 0).toLocaleString()} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="db-progress-bar">
                        <div className="db-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
