import { useState, useEffect, useRef } from 'react';

export default function LandingPage({ onLogin, onRegister }) {
  const [activeStep, setActiveStep] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const heroRef = useRef(null);

  const steps = [
    {
      num: '01',
      title: 'Create Profile',
      desc: 'Set up your household size, location, and budget preferences to get personalized recommendations.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.08)',
    },
    {
      num: '02',
      title: 'Plan Recipes',
      desc: 'Add ingredients with local RWF costs. Our AI calculates nutrition, pricing, and profit margins.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      num: '03',
      title: 'Analyze & Optimize',
      desc: 'Get AI-powered insights on margins, nutrition facts, and cost-saving recommendations in real-time.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      num: '04',
      title: 'Track & Save',
      desc: 'Monitor spending patterns, detect anomalies, and get price predictions from local market data.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.08)',
    },
  ];

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      title: 'AI-Powered Analysis',
      desc: 'Real-time nutrition and cost optimization through intelligent automation.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: 'Secure & Private',
      desc: 'Your data is encrypted and protected with enterprise-grade security.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      title: 'Local Market Data',
      desc: 'RWF pricing, vendor networks, and real-time market insights for Rwanda.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: 'Receipt Scanning',
      desc: 'AI validates receipts and detects unusual spending patterns automatically.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await onLogin(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);
    try {
      await onRegister(registerName, registerEmail, registerPassword);
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="lp">
      {/* ---- NAVBAR ---- */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <span className="lp-nav-logo">B</span>
            <span className="lp-nav-name">Baho</span>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-nav-login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button className="lp-nav-cta" onClick={() => setShowRegister(true)}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-bg">
          <div className="lp-hero-orb lp-hero-orb-1" />
          <div className="lp-hero-orb lp-hero-orb-2" />
          <div className="lp-hero-orb lp-hero-orb-3" />
          <div className="lp-hero-grid" />
        </div>

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            AI-Powered Budget Management
          </div>

          <h1 className="lp-hero-title">
            <span className="lp-hero-title-baho">Baho</span>
            <span className="lp-hero-title-sub">Manage Your Budget</span>
          </h1>

          <p className="lp-hero-desc">
            Smart budgeting meets nutrition. Plan meals, track costs, and optimize
            your family's dietary needs — powered by AI and built for Rwanda.
          </p>

          <div className="lp-hero-buttons">
            <button className="lp-btn lp-btn-primary" onClick={() => setShowRegister(true)}>
              <span>Start for Free</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button className="lp-btn lp-btn-ghost" onClick={() => {
              document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              See How It Works
            </button>
          </div>

          <div className="lp-hero-stats">
            <div className="lp-hero-stat">
              <span className="lp-hero-stat-num">100%</span>
              <span className="lp-hero-stat-label">Free to Use</span>
            </div>
            <div className="lp-hero-stat-divider" />
            <div className="lp-hero-stat">
              <span className="lp-hero-stat-num">AI</span>
              <span className="lp-hero-stat-label">Powered</span>
            </div>
            <div className="lp-hero-stat-divider" />
            <div className="lp-hero-stat">
              <span className="lp-hero-stat-num">24/7</span>
              <span className="lp-hero-stat-label">Available</span>
            </div>
          </div>
        </div>

        {/* Floating mock UI cards */}
        <div className="lp-hero-visual">
          <div className="lp-mock-card lp-mock-card-1">
            <div className="lp-mock-header">
              <div className="lp-mock-dot lp-mock-dot-r" />
              <div className="lp-mock-dot lp-mock-dot-y" />
              <div className="lp-mock-dot lp-mock-dot-g" />
            </div>
            <div className="lp-mock-body">
              <div className="lp-mock-line lp-mock-line-lg" />
              <div className="lp-mock-line lp-mock-line-md" />
              <div className="lp-mock-line lp-mock-line-sm" />
              <div className="lp-mock-bars">
                <div className="lp-mock-bar" style={{ height: '40%' }} />
                <div className="lp-mock-bar" style={{ height: '65%' }} />
                <div className="lp-mock-bar" style={{ height: '50%' }} />
                <div className="lp-mock-bar" style={{ height: '80%' }} />
                <div className="lp-mock-bar" style={{ height: '60%' }} />
              </div>
            </div>
          </div>

          <div className="lp-mock-card lp-mock-card-2">
            <div className="lp-mock-body">
              <div className="lp-mock-circle" />
              <div className="lp-mock-text-block">
                <div className="lp-mock-line lp-mock-line-md" />
                <div className="lp-mock-line lp-mock-line-sm" />
              </div>
            </div>
            <div className="lp-mock-body" style={{ marginTop: '8px' }}>
              <div className="lp-mock-circle" style={{ background: '#10b981' }} />
              <div className="lp-mock-text-block">
                <div className="lp-mock-line lp-mock-line-md" />
                <div className="lp-mock-line lp-mock-line-sm" />
              </div>
            </div>
          </div>

          <div className="lp-mock-card lp-mock-card-3">
            <div className="lp-mock-body" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="lp-mock-badge">RWF</div>
              <div>
                <div className="lp-mock-line lp-mock-line-lg" style={{ width: '80px' }} />
                <div className="lp-mock-line lp-mock-line-sm" style={{ width: '50px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS (Interactive Nav) ---- */}
      <section className="lp-how" id="lp-how" data-section="how">
        <div className="lp-section-inner">
          <div className="lp-section-tag">How It Works</div>
          <h2 className="lp-section-title">Navigate your budget in 4 steps</h2>
          <p className="lp-section-desc">
            From profile setup to AI-powered savings — here's how Baho transforms
            your family budget.
          </p>

          <div className="lp-how-layout">
            {/* Step indicators */}
            <div className="lp-how-steps">
              {steps.map((step, i) => (
                <button
                  key={i}
                  className={`lp-step ${activeStep === i ? 'lp-step-active' : ''}`}
                  onClick={() => setActiveStep(i)}
                  style={{ '--step-color': step.color }}
                >
                  <div className="lp-step-num">{step.num}</div>
                  <div className="lp-step-info">
                    <div className="lp-step-title">{step.title}</div>
                    <div className="lp-step-desc">{step.desc}</div>
                  </div>
                  <div className="lp-step-indicator" />
                </button>
              ))}
            </div>

            {/* Active step visual */}
            <div className="lp-how-visual">
              <div
                className="lp-how-visual-inner"
                style={{ '--step-color': steps[activeStep].color, '--step-bg': steps[activeStep].bg }}
              >
                <div className="lp-how-icon">{steps[activeStep].icon}</div>
                <div className="lp-how-step-label">Step {steps[activeStep].num}</div>
                <div className="lp-how-step-title">{steps[activeStep].title}</div>
                <div className="lp-how-step-desc">{steps[activeStep].desc}</div>

                {/* Mini animated demo */}
                <div className="lp-how-demo">
                  {activeStep === 0 && (
                    <div className="lp-demo-form">
                      <div className="lp-demo-field">
                        <div className="lp-demo-label">Household Size</div>
                        <div className="lp-demo-input">4 members</div>
                      </div>
                      <div className="lp-demo-field">
                        <div className="lp-demo-label">Location</div>
                        <div className="lp-demo-input">Kigali, Rwanda</div>
                      </div>
                      <div className="lp-demo-field">
                        <div className="lp-demo-label">Monthly Budget</div>
                        <div className="lp-demo-input">180,000 RWF</div>
                      </div>
                    </div>
                  )}
                  {activeStep === 1 && (
                    <div className="lp-demo-recipe">
                      <div className="lp-demo-recipe-name">Isombe Cassava</div>
                      <div className="lp-demo-ingredients">
                        <div className="lp-demo-ing">
                          <span>Cassava Leaves</span>
                          <span className="lp-demo-cost">2,500 RWF</span>
                        </div>
                        <div className="lp-demo-ing">
                          <span>Groundnuts</span>
                          <span className="lp-demo-cost">3,000 RWF</span>
                        </div>
                        <div className="lp-demo-ing">
                          <span>Palm Oil</span>
                          <span className="lp-demo-cost">1,500 RWF</span>
                        </div>
                      </div>
                      <div className="lp-demo-total">Total: 7,000 RWF</div>
                    </div>
                  )}
                  {activeStep === 2 && (
                    <div className="lp-demo-analysis">
                      <div className="lp-demo-metric">
                        <div className="lp-demo-metric-label">Profit Margin</div>
                        <div className="lp-demo-metric-value" style={{ color: '#10b981' }}>34.2%</div>
                      </div>
                      <div className="lp-demo-metric">
                        <div className="lp-demo-metric-label">Calories</div>
                        <div className="lp-demo-metric-value">485 kcal</div>
                      </div>
                      <div className="lp-demo-metric">
                        <div className="lp-demo-metric-label">Protein</div>
                        <div className="lp-demo-metric-value">18.3g</div>
                      </div>
                      <div className="lp-demo-advice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Consider substituting groundnuts with soybeans for 12% cost reduction
                      </div>
                    </div>
                  )}
                  {activeStep === 3 && (
                    <div className="lp-demo-tracking">
                      <div className="lp-demo-track-row">
                        <span className="lp-demo-track-cat">Groceries</span>
                        <div className="lp-demo-track-bar-bg">
                          <div className="lp-demo-track-bar" style={{ width: '72%', background: '#6366f1' }} />
                        </div>
                        <span className="lp-demo-track-pct">72%</span>
                      </div>
                      <div className="lp-demo-track-row">
                        <span className="lp-demo-track-cat">Transport</span>
                        <div className="lp-demo-track-bar-bg">
                          <div className="lp-demo-track-bar" style={{ width: '45%', background: '#f59e0b' }} />
                        </div>
                        <span className="lp-demo-track-pct">45%</span>
                      </div>
                      <div className="lp-demo-track-row">
                        <span className="lp-demo-track-cat">Utilities</span>
                        <div className="lp-demo-track-bar-bg">
                          <div className="lp-demo-track-bar" style={{ width: '88%', background: '#ef4444' }} />
                        </div>
                        <span className="lp-demo-track-pct">88%</span>
                      </div>
                      <div className="lp-demo-anomaly">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Utilities spending 12% above average
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step progress dots */}
          <div className="lp-how-progress">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`lp-progress-dot ${activeStep === i ? 'lp-progress-dot-active' : ''}`}
                onClick={() => setActiveStep(i)}
                style={{ '--step-color': steps[i].color }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section className="lp-features" data-section="features">
        <div className="lp-section-inner">
          <div className="lp-section-tag">Features</div>
          <h2 className="lp-section-title">Everything you need to manage your budget</h2>
          <p className="lp-section-desc">
            Built specifically for families and businesses in Rwanda, with local
            market intelligence and AI-driven insights.
          </p>

          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div className="lp-feature-card" key={i}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="lp-cta" data-section="cta">
        <div className="lp-section-inner">
          <h2 className="lp-cta-title">Ready to take control of your budget?</h2>
          <p className="lp-cta-desc">
            Join families and businesses across Rwanda who are already saving smarter with Baho.
          </p>
          <div className="lp-cta-buttons">
            <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => setShowRegister(true)}>
              Create Free Account
            </button>
            <button className="lp-btn lp-btn-ghost lp-btn-lg" onClick={() => setShowLogin(true)}>
              I already have an account
            </button>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-nav-logo">B</span>
            <span className="lp-nav-name">Baho</span>
            <p className="lp-footer-tagline">Smart Budget Management for Rwanda</p>
          </div>
          <div className="lp-footer-links">
            <a href="#lp-how">How It Works</a>
            <a href="#features">Features</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Log In</a>
          </div>
          <div className="lp-footer-contact">
            <p>info@baho.rw</p>
            <p>Kigali, Rwanda</p>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>&copy; 2026 Baho. All rights reserved.</p>
        </div>
      </footer>

      {/* ---- LOGIN MODAL ---- */}
      {showLogin && (
        <div className="lp-modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lp-modal-close" onClick={() => setShowLogin(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="lp-modal-header">
              <h2>Welcome back</h2>
              <p>Sign in to your Baho account</p>
            </div>
            <form className="lp-modal-form" onSubmit={handleLogin}>
              {loginError && <div className="lp-modal-error">{loginError}</div>}
              <div className="lp-modal-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="lp-modal-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button className="lp-btn lp-btn-primary lp-btn-full" type="submit" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="lp-modal-footer">
              Don't have an account?{' '}
              <button onClick={() => { setShowLogin(false); setShowRegister(true); }}>
                Create one
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- REGISTER MODAL ---- */}
      {showRegister && (
        <div className="lp-modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lp-modal-close" onClick={() => setShowRegister(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="lp-modal-header">
              <h2>Create your account</h2>
              <p>Start managing your budget with Baho</p>
            </div>
            <form className="lp-modal-form" onSubmit={handleRegister}>
              {registerError && <div className="lp-modal-error">{registerError}</div>}
              <div className="lp-modal-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="lp-modal-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="lp-modal-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              <button className="lp-btn lp-btn-primary lp-btn-full" type="submit" disabled={registerLoading}>
                {registerLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <div className="lp-modal-footer">
              Already have an account?{' '}
              <button onClick={() => { setShowRegister(false); setShowLogin(true); }}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
