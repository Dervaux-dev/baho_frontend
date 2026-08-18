import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_API_URL;

const emptyForm = {
  item: '',
  category: 'produce',
  averagePrice: '',
  minPrice: '',
  maxPrice: '',
  vendor: '',
  vendorPrice: '',
};

export default function MarketDataView() {
  const [marketData, setMarketData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [predictItem, setPredictItem] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [fetchItems, setFetchItems] = useState('');
  const [fetchCategory, setFetchCategory] = useState('produce');
  const [fetchingPrices, setFetchingPrices] = useState(false);

  const fetchMarketData = useCallback(async () => {
    try {
      const url = filterCategory ? `${API}/market?category=${filterCategory}` : `${API}/market`;
      const res = await axios.get(url);
      if (res.data.success) setMarketData(res.data.data);
    } catch (err) { console.error('Failed to fetch market data:', err); }
  }, [filterCategory]);

  useEffect(() => { fetchMarketData(); }, [fetchMarketData]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const prices = form.vendor && form.vendorPrice ? [{
        vendor: form.vendor,
        price: Number(form.vendorPrice),
        date: new Date(),
      }] : [];
      await axios.post(`${API}/market`, {
        item: form.item,
        category: form.category,
        averagePrice: Number(form.averagePrice),
        minPrice: Number(form.minPrice || form.averagePrice),
        maxPrice: Number(form.maxPrice || form.averagePrice),
        prices,
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchMarketData();
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to save market data');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!predictItem) return;
    setPredicting(true);
    setPrediction(null);
    try {
      const res = await axios.post(`${API}/market/predict/${encodeURIComponent(predictItem)}`);
      if (res.data.success) setPrediction(res.data.data);
    } catch (err) {
      setPrediction({ error: err.response?.data?.error || 'Prediction failed. Add market data for this item first.' });
    } finally {
      setPredicting(false);
    }
  };

  const handleFetchPrices = async () => {
    const items = fetchItems.split(',').map((i) => i.trim()).filter(Boolean);
    if (!items.length) return;
    setFetchingPrices(true);
    try {
      await axios.post(`${API}/market/fetch-prices`, { items, category: fetchCategory });
      fetchMarketData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to fetch prices');
    } finally {
      setFetchingPrices(false);
    }
  };

  return (
    <div className="db-market">
      <div className="db-section-header">
        <p className="db-section-desc">Track market prices, AI predictions, and price trends for food items.</p>
        <button className="db-btn db-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Market Data'}
        </button>
      </div>

      <div className="db-market-tools">
        <div className="db-card db-tool-card">
          <h4>AI Price Prediction</h4>
          <div className="db-input-group">
            <input type="text" value={predictItem} onChange={(e) => setPredictItem(e.target.value)} placeholder="Item name (e.g. maize flour)" style={{ flex: 1 }} />
            <button className="db-btn db-btn-secondary" onClick={handlePredict} disabled={predicting}>
              {predicting ? 'Predicting...' : 'Predict Price'}
            </button>
          </div>
          {prediction && !prediction.error && (
            <div className="db-prediction-result">
              <div><strong>Current:</strong> RWF {prediction.currentPrice?.toLocaleString()}</div>
              <div><strong>Predicted:</strong> RWF {prediction.predictedPrice?.toLocaleString()}</div>
              <div><strong>Confidence:</strong> {prediction.confidence}%</div>
            </div>
          )}
          {prediction?.error && <p className="db-text-danger">{prediction.error}</p>}
        </div>

        <div className="db-card db-tool-card">
          <h4>Fetch Market Prices (n8n)</h4>
          <div className="db-form-row">
            <input type="text" value={fetchItems} onChange={(e) => setFetchItems(e.target.value)} placeholder="Items (comma separated)" style={{ flex: 2 }} />
            <select value={fetchCategory} onChange={(e) => setFetchCategory(e.target.value)} style={{ flex: 1 }}>
              <option value="produce">Produce</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="pantry">Pantry</option>
              <option value="frozen">Frozen</option>
              <option value="beverages">Beverages</option>
              <option value="other">Other</option>
            </select>
            <button className="db-btn db-btn-secondary" onClick={handleFetchPrices} disabled={fetchingPrices}>
              {fetchingPrices ? 'Fetching...' : 'Fetch Prices'}
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="db-card db-form-card">
          <h3 className="db-card-title">Add Market Data</h3>
          {error && <div className="db-alert db-alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="db-form">
            <div className="db-form-row">
              <div className="db-form-group">
                <label>Item Name *</label>
                <input type="text" value={form.item} onChange={(e) => handleChange('item', e.target.value)} placeholder="e.g. maize flour" required />
              </div>
              <div className="db-form-group">
                <label>Category *</label>
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
                <label>Average Price (RWF) *</label>
                <input type="number" min="1" value={form.averagePrice} onChange={(e) => handleChange('averagePrice', e.target.value)} required />
              </div>
              <div className="db-form-group">
                <label>Min Price</label>
                <input type="number" min="0" value={form.minPrice} onChange={(e) => handleChange('minPrice', e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Max Price</label>
                <input type="number" min="0" value={form.maxPrice} onChange={(e) => handleChange('maxPrice', e.target.value)} />
              </div>
            </div>
            <div className="db-form-row">
              <div className="db-form-group">
                <label>Vendor Name</label>
                <input type="text" value={form.vendor} onChange={(e) => handleChange('vendor', e.target.value)} placeholder="e.g. Kimironko Market" />
              </div>
              <div className="db-form-group">
                <label>Vendor Price (RWF)</label>
                <input type="number" min="0" value={form.vendorPrice} onChange={(e) => handleChange('vendorPrice', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="db-btn db-btn-success" disabled={loading}>
              {loading ? 'Saving...' : 'Save Market Data'}
            </button>
          </form>
        </div>
      )}

      <div className="db-market-filter">
        <span>Filter by category:</span>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="produce">Produce</option>
          <option value="dairy">Dairy</option>
          <option value="meat">Meat</option>
          <option value="pantry">Pantry</option>
          <option value="frozen">Frozen</option>
          <option value="beverages">Beverages</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="db-market-grid">
        {marketData.length === 0 ? (
          <div className="db-card db-empty-state">
            <p>No market data available. Add data above or fetch prices via n8n.</p>
          </div>
        ) : (
          marketData.map((m) => (
            <div key={m._id} className="db-card db-market-card">
              <div className="db-market-card-header">
                <h4>{m.item}</h4>
                <span className="db-badge">{m.category}</span>
              </div>
              <div className="db-market-prices">
                <div className="db-market-price-item">
                  <span className="db-market-price-label">Average</span>
                  <span className="db-market-price-value">RWF {m.averagePrice?.toLocaleString()}</span>
                </div>
                <div className="db-market-price-item">
                  <span className="db-market-price-label">Min</span>
                  <span className="db-market-price-value">RWF {m.minPrice?.toLocaleString()}</span>
                </div>
                <div className="db-market-price-item">
                  <span className="db-market-price-label">Max</span>
                  <span className="db-market-price-value">RWF {m.maxPrice?.toLocaleString()}</span>
                </div>
              </div>
              {m.priceChange && (
                <div className={`db-trend db-trend-${m.priceChange.trend}`}>
                  {m.priceChange.trend === 'up' ? '↑' : m.priceChange.trend === 'down' ? '↓' : '→'} {m.priceChange.percentageChange || 0}%
                </div>
              )}
              {m.aiPrediction?.predictedPrice && (
                <div className="db-prediction-badge">
                  AI: RWF {m.aiPrediction.predictedPrice.toLocaleString()} ({m.aiPrediction.confidence}% confidence)
                </div>
              )}
              {m.prices?.length > 0 && (
                <div className="db-market-vendors">
                  {m.prices.slice(-3).map((p, i) => (
                    <span key={i} className="db-vendor-tag">{p.vendor}: RWF {p.price?.toLocaleString()}</span>
                  ))}
                </div>
              )}
              <span className="db-market-updated">
                Updated: {new Date(m.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
