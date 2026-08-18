import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BudgetManager from './BudgetManager';
import SpendingTracker from './SpendingTracker';
import RecipeManager from './RecipeManager';
import MarketDataView from './MarketDataView';
import ProductShowcase from './ProductShowcase';
import AiChat from './AiChat';

const API = import.meta.env.VITE_BACKEND_API_URL;

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'budgets', label: 'Budgets', icon: '💰' },
  { id: 'spending', label: 'Spending', icon: '🛒' },
  { id: 'recipes', label: 'Recipes', icon: '🍽️' },
  { id: 'market', label: 'Market', icon: '📈' },
  { id: 'products', label: 'Products', icon: '🏷️' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [budgets, setBudgets] = useState([]);
  const [recipes, setSavedRecipes] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [stats, setStats] = useState({ totalBudget: 0, totalSpent: 0, budgetCount: 0, recipeCount: 0 });

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/budgets`);
      if (res.data.success) setBudgets(res.data.data);
    } catch (err) { console.error('Failed to fetch budgets:', err); }
  }, []);

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/recipes`);
      if (res.data.success) setSavedRecipes(res.data.data);
    } catch (err) { console.error('Failed to fetch recipes:', err); }
  }, []);

  const fetchTotalSpent = useCallback(async () => {
    try {
      let total = 0;
      for (const budget of budgets) {
        try {
          const res = await axios.get(`${API}/spending/${budget._id}`);
          if (res.data.success) {
            total += res.data.data.reduce((sum, s) => sum + (s.amount || 0), 0);
          }
        } catch { /* ignore */ }
      }
      setTotalSpent(total);
    } catch { /* ignore */ }
  }, [budgets]);

  useEffect(() => { fetchBudgets(); fetchRecipes(); }, [fetchBudgets, fetchRecipes]);
  useEffect(() => { if (budgets.length) fetchTotalSpent(); }, [budgets, fetchTotalSpent]);

  useEffect(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + (b.totalBudget || 0), 0);
    setStats({ totalBudget, totalSpent, budgetCount: budgets.length, recipeCount: recipes.length });
  }, [budgets, recipes, totalSpent]);

  return (
    <div className="db-layout">
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <div className="db-brand-logo">B</div>
          <span className="db-brand-name">Baho</span>
        </div>

        <nav className="db-sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`db-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="db-nav-icon">{tab.icon}</span>
              <span className="db-nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-user-info">
            <div className="db-user-avatar">{user.name?.[0] || 'U'}</div>
            <div className="db-user-details">
              <span className="db-user-name">{user.name}</span>
              <span className="db-user-email">{user.email}</span>
            </div>
          </div>
          <button className="db-logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </aside>

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h2 className="db-page-title">
              {tabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="db-topbar-right">
            <span className="db-greeting">Welcome, {user.name}</span>
          </div>
        </header>

        <div className="db-content">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} budgets={budgets} recipes={recipes} />
          )}
          {activeTab === 'budgets' && (
            <BudgetManager budgets={budgets} onRefresh={fetchBudgets} />
          )}
          {activeTab === 'spending' && (
            <SpendingTracker budgets={budgets} />
          )}
          {activeTab === 'recipes' && (
            <RecipeManager user={user} />
          )}
          {activeTab === 'market' && <MarketDataView />}
          {activeTab === 'products' && <ProductShowcase />}
          {activeTab === 'ai' && <AiChat budgets={budgets} />}
        </div>
      </main>
    </div>
  );
}

function OverviewTab({ stats, budgets, recipes }) {
  const activeBudgets = budgets.filter((b) => b.status === 'active');
  const recentRecipes = recipes.slice(0, 3);

  return (
    <div className="db-overview">
      <div className="db-stats-grid">
        <div className="db-stat-card">
          <div className="db-stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>💰</div>
          <div className="db-stat-info">
            <span className="db-stat-value">RWF {stats.totalBudget.toLocaleString()}</span>
            <span className="db-stat-label">Total Budget</span>
          </div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>📊</div>
          <div className="db-stat-info">
            <span className="db-stat-value">{stats.budgetCount}</span>
            <span className="db-stat-label">Active Budgets</span>
          </div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>🍽️</div>
          <div className="db-stat-info">
            <span className="db-stat-value">{stats.recipeCount}</span>
            <span className="db-stat-label">Saved Recipes</span>
          </div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>🛒</div>
          <div className="db-stat-info">
            <span className="db-stat-value">RWF {stats.totalSpent.toLocaleString()}</span>
            <span className="db-stat-label">Total Spent</span>
          </div>
        </div>
      </div>

      <div className="db-overview-grid">
        <div className="db-card">
          <h3 className="db-card-title">Recent Budgets</h3>
          {activeBudgets.length === 0 ? (
            <p className="db-empty-text">No active budgets yet. Create one to get started.</p>
          ) : (
            <div className="db-list">
              {activeBudgets.slice(0, 5).map((b) => (
                <div key={b._id} className="db-list-item">
                  <div className="db-list-item-main">
                    <strong>{b.name}</strong>
                    <span className="db-badge">{b.category}</span>
                  </div>
                  <span className="db-list-item-sub">
                    RWF {b.totalBudget.toLocaleString()} · {b.period}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="db-card">
          <h3 className="db-card-title">Recent Recipes</h3>
          {recentRecipes.length === 0 ? (
            <p className="db-empty-text">No recipes analyzed yet.</p>
          ) : (
            <div className="db-list">
              {recentRecipes.map((r) => (
                <div key={r._id} className="db-list-item">
                  <div className="db-list-item-main">
                    <strong>{r.recipeName}</strong>
                  </div>
                  <span className="db-list-item-sub">
                    RWF {r.suggestedPriceRWF} · {r.marginPercentage}% margin
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
