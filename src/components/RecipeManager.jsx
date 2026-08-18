import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_API_URL;

export default function RecipeManager({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([
    { name: 'Maize Flour', quantity: '2kg', costRWF: 2000 },
    { name: 'Cooking Oil', quantity: '1L', costRWF: 3000 },
  ]);
  const [householdSize, setHouseholdSize] = useState(4);
  const [householdType, setHouseholdType] = useState('family');
  const [location, setLocation] = useState('Kigali, Rwanda');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/recipes`);
      if (res.data.success) setRecipes(res.data.data);
    } catch (err) { console.error('Failed to fetch recipes:', err); }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = field === 'costRWF' ? Number(value) : value;
    setIngredients(updated);
  };

  const addIngredientRow = () => setIngredients([...ingredients, { name: '', quantity: '', costRWF: 0 }]);
  const removeIngredientRow = (i) => { if (ingredients.length > 1) setIngredients(ingredients.filter((_, idx) => idx !== i)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const n8nRes = await axios.post('/n8n/webhook/recipe-analyzer', {
        recipeName,
        ingredients,
        budgetProfile: {
          householdSize: Number(householdSize),
          householdType,
          location,
          city: location.split(',')[0] || 'Kigali',
          country: 'Rwanda',
          currency: 'RWF',
          locationCountry: 'Rwanda',
        },
      });
      const data = n8nRes.data;
      if (data.success === false) {
        setError(data.error || 'Automation processing failed.');
      } else {
        setResult(data);
        await axios.post(`${API}/recipes`, { ...data, ingredients });
        fetchRecipes();
      }
    } catch (err) {
      setError(err.message || 'Error connecting to n8n webhook.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-recipes">
      <div className="db-section-header">
        <p className="db-section-desc">Analyze recipes for nutrition, cost, and profit margin via n8n AI.</p>
        <button className="db-btn db-btn-primary" onClick={() => setShowAnalyzer(!showAnalyzer)}>
          {showAnalyzer ? 'Hide Analyzer' : 'Analyze Recipe'}
        </button>
      </div>

      {showAnalyzer && (
        <div className="db-card db-form-card">
          <h3 className="db-card-title">Recipe Cost Analyzer</h3>
          {error && <div className="db-alert db-alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="db-form">
            <div className="db-form-row">
              <div className="db-form-group">
                <label>Recipe Name *</label>
                <input type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g. Isombe Cassava Leaves" required />
              </div>
              <div className="db-form-group">
                <label>Household Size</label>
                <input type="number" min="1" value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <h4 className="db-form-subtitle">Ingredients & Costs (RWF)</h4>
            {ingredients.map((item, index) => (
              <div key={index} className="db-ingredient-row">
                <input type="text" placeholder="Ingredient" value={item.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} required style={{ flex: 2 }} />
                <input type="text" placeholder="Qty" value={item.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} required style={{ flex: 1 }} />
                <input type="number" placeholder="RWF" value={item.costRWF} onChange={(e) => handleIngredientChange(index, 'costRWF', e.target.value)} required style={{ flex: 1.5 }} />
                {ingredients.length > 1 && (
                  <button type="button" className="db-btn-icon db-btn-danger-icon" onClick={() => removeIngredientRow(index)} title="Remove">×</button>
                )}
              </div>
            ))}

            <div className="db-form-actions">
              <button type="button" className="db-btn db-btn-secondary" onClick={addIngredientRow}>+ Add Ingredient</button>
              <button type="submit" className="db-btn db-btn-success" disabled={loading}>
                {loading ? 'Analyzing via n8n...' : 'Analyze Recipe'}
              </button>
            </div>
          </form>
        </div>
      )}

      {result && (
        <div className="db-card db-result-card">
          <h3 className="db-card-title">Analysis Result: {result.recipeName}</h3>
          <div className="db-result-grid">
            <div className="db-result-stat">
              <span className="db-result-label">Total Cost</span>
              <span className="db-result-value">RWF {result.totalCostRWF?.toLocaleString()}</span>
            </div>
            <div className="db-result-stat">
              <span className="db-result-label">Suggested Price</span>
              <span className="db-result-value db-text-success">RWF {result.suggestedPriceRWF?.toLocaleString()}</span>
            </div>
            <div className="db-result-stat">
              <span className="db-result-label">Profit Margin</span>
              <span className="db-result-value db-text-info">{result.marginPercentage}%</span>
            </div>
          </div>
          {result.nutrition && (
            <div className="db-nutrition-grid">
              <div className="db-nutrition-item">
                <span className="db-nutrition-value">{result.nutrition.calories}</span>
                <span className="db-nutrition-label">kcal</span>
              </div>
              <div className="db-nutrition-item">
                <span className="db-nutrition-value">{result.nutrition.proteinGrams}g</span>
                <span className="db-nutrition-label">Protein</span>
              </div>
              <div className="db-nutrition-item">
                <span className="db-nutrition-value">{result.nutrition.carbsGrams}g</span>
                <span className="db-nutrition-label">Carbs</span>
              </div>
              <div className="db-nutrition-item">
                <span className="db-nutrition-value">{result.nutrition.fatGrams}g</span>
                <span className="db-nutrition-label">Fat</span>
              </div>
            </div>
          )}
          {result.businessAdvice && (
            <div className="db-advice-box">
              <strong>Business Advice:</strong> {result.businessAdvice}
            </div>
          )}
        </div>
      )}

      <div className="db-card">
        <h3 className="db-card-title">Saved Recipes ({recipes.length})</h3>
        {recipes.length === 0 ? (
          <p className="db-empty-text">No recipes saved yet. Analyze a recipe above to save it.</p>
        ) : (
          <div className="db-recipes-grid">
            {recipes.map((r) => (
              <div key={r._id} className="db-recipe-card">
                <h4 className="db-recipe-name">{r.recipeName}</h4>
                <div className="db-recipe-meta">
                  <span className="db-badge">{r.totalCostRWF ? `Cost: RWF ${r.totalCostRWF.toLocaleString()}` : 'No cost data'}</span>
                  <span className="db-badge db-badge-success">{r.suggestedPriceRWF ? `Price: RWF ${r.suggestedPriceRWF.toLocaleString()}` : ''}</span>
                  {r.marginPercentage != null && <span className="db-badge db-badge-info">{r.marginPercentage}% margin</span>}
                </div>
                {r.nutrition && (
                  <p className="db-recipe-nutrition">
                    {r.nutrition.calories} kcal · P: {r.nutrition.proteinGrams}g · C: {r.nutrition.carbsGrams}g · F: {r.nutrition.fatGrams}g
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
