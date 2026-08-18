import { useState, useEffect } from 'react';

export default function Footer() {
  const [sellerStatus, setSellerStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSellerStatus();
    // Poll seller status every 30 seconds
    const interval = setInterval(checkSellerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSellerStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/seller-status`);
      const data = await response.json();
      setSellerStatus(data.data || { isOnline: false });
    } catch (err) {
      console.error('Failed to check seller status:', err);
      setSellerStatus({ isOnline: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Nutri-Biz</h4>
          <p className="footer-tagline">Smart Budget Planning & Nutrition Solutions</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#budget">Budget Tool</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>📧 info@nutribiz.rw</li>
            <li>📱 +250 798 123 456</li>
            <li>📍 Kigali, Rwanda</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Seller Status</h4>
          <div className="seller-status-card">
            <div className={`status-indicator ${sellerStatus?.isOnline ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {sellerStatus?.isOnline ? 'Online & Available' : 'Offline'}
              </span>
            </div>
            
            {sellerStatus?.onlineSince && (
              <p className="status-time">Since: {new Date(sellerStatus.onlineSince).toLocaleTimeString()}</p>
            )}
            
            {sellerStatus?.contact && (
              <a href={`mailto:${sellerStatus.contact}`} className="seller-contact-link">
                Contact Seller
              </a>
            )}
            
            <button className="refresh-status-btn" onClick={checkSellerStatus} disabled={loading}>
              {loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-divider"></div>
        <div className="footer-credits">
          <p>&copy; 2024 Nutri-Biz. All rights reserved. | <a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Service</a></p>
          <p className="footer-tagline-small">Powered by n8n Automation & AI</p>
        </div>
      </div>
    </footer>
  );
}
