import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/products`);
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-showcase">
      <div className="products-header">
        <h2>Nutrition Products</h2>
        <p className="products-subtitle">Find quality nutrition products from verified sellers</p>
      </div>

      {loading && <div className="products-loading">Loading products...</div>}
      {error && <div className="products-error">{error}</div>}

      <div className="products-grid">
        {products.length === 0 && !loading ? (
          <div className="products-empty">No products available yet.</div>
        ) : (
          products.map((product) => (
            <div key={product._id || product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.imageUrl || 'https://via.placeholder.com/200?text=' + encodeURIComponent(product.name)} 
                  alt={product.name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=Product'}
                />
              </div>
              
              <div className="product-content">
                <h3 className="product-name">{product.name}</h3>
                
                {product.category && (
                  <span className="product-category">{product.category}</span>
                )}
                
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}

                <div className="product-nutrition">
                  {product.nutrition && (
                    <div className="nutrition-info">
                      <span className="nutrition-badge">
                        <strong>Calories:</strong> {product.nutrition.calories || 'N/A'}
                      </span>
                      <span className="nutrition-badge">
                        <strong>Protein:</strong> {product.nutrition.protein || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="product-pricing">
                  <div className="price-section">
                    <span className="price-label">Price</span>
                    <span className="price-value">
                      {product.currency || 'RWF'} {product.price || product.costRWF}
                    </span>
                  </div>
                  
                  {product.originalPrice && product.price < product.originalPrice && (
                    <div className="discount-section">
                      <span className="original-price">RWF {product.originalPrice}</span>
                      <span className="discount-badge">Save</span>
                    </div>
                  )}
                </div>

                <div className="product-seller">
                  {product.seller && (
                    <>
                      <span className="seller-name">{product.seller.name || 'Seller'}</span>
                      {product.seller.isOnline !== undefined && (
                        <span className={`seller-status ${product.seller.isOnline ? 'online' : 'offline'}`}>
                          {product.seller.isOnline ? '● Online' : '● Offline'}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <button 
                  className="product-view-btn"
                  onClick={() => setSelectedProduct(product)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button>
            
            <div className="modal-body">
              <div className="modal-image">
                <img 
                  src={selectedProduct.imageUrl || 'https://via.placeholder.com/300?text=' + encodeURIComponent(selectedProduct.name)}
                  alt={selectedProduct.name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Product'}
                />
              </div>

              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                
                {selectedProduct.category && <p className="modal-category">{selectedProduct.category}</p>}
                
                {selectedProduct.description && (
                  <div className="modal-section">
                    <h4>Description</h4>
                    <p>{selectedProduct.description}</p>
                  </div>
                )}

                {selectedProduct.nutrition && (
                  <div className="modal-section">
                    <h4>Nutrition Facts (per serving)</h4>
                    <ul className="nutrition-list">
                      <li><strong>Calories:</strong> {selectedProduct.nutrition.calories || 'N/A'} kcal</li>
                      <li><strong>Protein:</strong> {selectedProduct.nutrition.protein || 'N/A'}g</li>
                      <li><strong>Carbs:</strong> {selectedProduct.nutrition.carbs || 'N/A'}g</li>
                      <li><strong>Fat:</strong> {selectedProduct.nutrition.fat || 'N/A'}g</li>
                      <li><strong>Fiber:</strong> {selectedProduct.nutrition.fiber || 'N/A'}g</li>
                    </ul>
                  </div>
                )}

                <div className="modal-section">
                  <h4>Pricing</h4>
                  <div className="modal-price">
                    <span className="modal-price-value">{selectedProduct.currency || 'RWF'} {selectedProduct.price || selectedProduct.costRWF}</span>
                    {selectedProduct.originalPrice && (
                      <span className="modal-original-price">RWF {selectedProduct.originalPrice}</span>
                    )}
                  </div>
                </div>

                {selectedProduct.seller && (
                  <div className="modal-section">
                    <h4>Seller Information</h4>
                    <div className="modal-seller">
                      <p><strong>Name:</strong> {selectedProduct.seller.name || 'Unknown'}</p>
                      {selectedProduct.seller.contact && (
                        <p><strong>Contact:</strong> {selectedProduct.seller.contact}</p>
                      )}
                      {selectedProduct.seller.location && (
                        <p><strong>Location:</strong> {selectedProduct.seller.location}</p>
                      )}
                      <p className="seller-availability">
                        <strong>Status:</strong> <span className={`status-badge ${selectedProduct.seller.isOnline ? 'online' : 'offline'}`}>
                          {selectedProduct.seller.isOnline ? 'Online - Available Now' : 'Offline - Check back later'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
