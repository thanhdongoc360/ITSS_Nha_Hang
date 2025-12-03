import React from 'react';
import { Link } from 'react-router-dom';
import { favoriteAPI } from '../services/api';
import './RestaurantCard.css';

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

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }
    
    return stars;
  };

  const getPriceColor = (price) => {
    if (price === 1) return 'success';
    if (price === 2) return 'warning';
    return 'danger';
  };

  return (
    <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-4">
      <div className="restaurant-card h-100">
        <Link to={`/restaurant/${restaurant.id}`} className="text-decoration-none">
          <div className="card h-100 border-0 shadow-sm restaurant-card-inner">
            {/* Image Container */}
            <div className="position-relative restaurant-image-container">
              <img
                src={restaurant.image || 'https://via.placeholder.com/400x250?text=No+Image'}
                className="card-img-top restaurant-image"
                alt={restaurant.name}
                loading="lazy"
              />
              {/* Distance Badge */}
              {restaurant.distance && (
                <div className="position-absolute top-0 start-0 m-2">
                  <span className="badge bg-dark bg-opacity-75 px-3 py-2">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {restaurant.distance}m
                  </span>
                </div>
              )}
              {/* Favorite Button */}
              <button
                className={`btn btn-favorite position-absolute top-0 end-0 m-2 ${
                  isFavorite ? 'btn-danger' : 'btn-light'
                }`}
                onClick={handleFavoriteToggle}
                disabled={loading}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
            </div>

            {/* Card Body */}
            <div className="card-body d-flex flex-column">
              {/* Restaurant Name */}
              <h5 className="card-title restaurant-name mb-2">{restaurant.name}</h5>

              {/* Badges */}
              <div className="mb-2">
                <span className="badge bg-primary me-2">
                  <i className="bi bi-egg-fried me-1"></i>
                  {restaurant.cuisine}
                </span>
                <span className={`badge bg-${getPriceColor(restaurant.price)}`}>
                  {getPriceBadge(restaurant.price)}
                </span>
              </div>

              {/* Rating */}
              <div className="d-flex align-items-center mb-2">
                <div className="me-2 restaurant-stars">
                  {renderStars(restaurant.rating)}
                </div>
                <span className="fw-bold text-dark me-1">{restaurant.rating}</span>
                <small className="text-muted">({restaurant.reviews})</small>
              </div>

              {/* Walk Time */}
              {restaurant.walk_time && (
                <div className="text-muted small mb-2">
                  <i className="bi bi-person-walking me-1"></i>
                  徒歩{restaurant.walk_time}分
                </div>
              )}

              {/* Description Preview */}
              {restaurant.description && (
                <p className="card-text text-muted small restaurant-description">
                  {restaurant.description.substring(0, 80)}
                  {restaurant.description.length > 80 ? '...' : ''}
                </p>
              )}

              {/* View Details Button */}
              <div className="mt-auto">
                <div className="btn btn-outline-primary btn-sm w-100 view-details-btn">
                  詳細を見る
                  <i className="bi bi-arrow-right ms-2"></i>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;
