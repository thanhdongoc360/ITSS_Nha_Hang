import React from 'react';
import { Link } from 'react-router-dom';
import { favoriteAPI } from '../services/api';

const RestaurantCard = ({ restaurant, isFavorite: initialFavorite, onFavoriteToggle }) => {
  const [isFavorite, setIsFavorite] = React.useState(initialFavorite || false);
  const [loading, setLoading] = React.useState(false);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    try {
      const response = await favoriteAPI.toggle(restaurant.id);
      setIsFavorite(response.data.isFavorite);
      if (onFavoriteToggle) {
        onFavoriteToggle(restaurant.id, response.data.isFavorite);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceBadge = (price) => {
    return '¥'.repeat(price);
  };

  return (
    <div className="col">
      <Link to={`/restaurant/${restaurant.id}`} className="text-decoration-none">
        <div className="card h-100 shadow-sm hover-shadow">
          <img 
            src={restaurant.image || 'https://via.placeholder.com/400x250?text=No+Image'} 
            className="card-img-top" 
            alt={restaurant.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="card-title mb-0">{restaurant.name}</h5>
              <button
                className={`btn btn-sm ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleFavoriteToggle}
                disabled={loading}
              >
                <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
            </div>
            
            <div className="mb-2">
              <span className="badge bg-primary me-2">{restaurant.cuisine}</span>
              <span className="badge bg-success">{getPriceBadge(restaurant.price)}</span>
            </div>

            <div className="d-flex align-items-center mb-2">
              <span className="text-warning me-1">★</span>
              <span className="me-2">{restaurant.rating}</span>
              <small className="text-muted">({restaurant.reviews} reviews)</small>
            </div>

            {restaurant.distance && (
              <div className="text-muted small">
                <i className="bi bi-geo-alt me-1"></i>
                {restaurant.distance}m away • {restaurant.walk_time} min walk
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RestaurantCard;
