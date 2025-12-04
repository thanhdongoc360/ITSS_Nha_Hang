import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, favoriteAPI, historyAPI } from '../services/api';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyAdded, setHistoryAdded] = useState(false);

  useEffect(() => {
    setHistoryAdded(false); // Reset flag when restaurant changes
    loadRestaurant();
  }, [id]);

  const loadRestaurant = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await restaurantAPI.getById(id);
      setRestaurant(response.data.restaurant);
      setIsFavorite(response.data.restaurant.isFavorite || false);
      
      // Add to history only once per page load
      if (!historyAdded) {
        await historyAPI.add(id, 'view');
        setHistoryAdded(true);
      }
    } catch (err) {
      setError('Failed to load restaurant details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      const response = await favoriteAPI.toggle(id);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Restaurant not found'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Back Home
        </button>
      </div>
    );
  }

  const getPriceBadge = (price) => '¥'.repeat(price);

  return (
    <div className="container py-4">
      {/* Back Button */}
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2"></i>
        Back
      </button>

      <div className="row">
        {/* Restaurant Image */}
        <div className="col-lg-6 mb-4">
          <img
            src={restaurant.image || 'https://via.placeholder.com/600x400?text=No+Image'}
            alt={restaurant.name}
            className="img-fluid rounded shadow"
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
          />
        </div>

        {/* Restaurant Info */}
        <div className="col-lg-6">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h1 className="display-5">{restaurant.name}</h1>
            <button
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={handleFavoriteToggle}
            >
              <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>

          {/* Badges */}
          <div className="mb-3">
            <span className="badge bg-primary me-2 fs-6">{restaurant.cuisine}</span>
            <span className="badge bg-success fs-6">{getPriceBadge(restaurant.price)}</span>
          </div>

          {/* Rating */}
          <div className="d-flex align-items-center mb-3">
            <span className="text-warning fs-4 me-2">★</span>
            <span className="fs-5 fw-bold me-2">{restaurant.rating}</span>
            <span className="text-muted">({restaurant.reviews} reviews)</span>
          </div>

          {/* Distance & Time */}
          {restaurant.distance && (
            <div className="mb-3">
              <i className="bi bi-geo-alt text-primary me-2"></i>
              <strong>{restaurant.distance}m away</strong> • {restaurant.walk_time} min walk
            </div>
          )}

          {/* Description */}
          {restaurant.description && (
            <div className="mb-4">
              <h5>About</h5>
              <p className="text-muted">{restaurant.description}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Contact Information</h5>
              
              {restaurant.address && (
                <div className="mb-2">
                  <i className="bi bi-geo-alt me-2"></i>
                  <strong>Address:</strong> {restaurant.address}
                </div>
              )}

              {restaurant.phone && (
                <div className="mb-2">
                  <i className="bi bi-telephone me-2"></i>
                  <strong>Phone:</strong> {restaurant.phone}
                </div>
              )}

              {restaurant.hours && (
                <div className="mb-2">
                  <i className="bi bi-clock me-2"></i>
                  <strong>Hours:</strong> {restaurant.hours}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="mt-3">
              <h6>Features:</h6>
              <div>
                {JSON.parse(restaurant.tags).map((tag, index) => (
                  <span key={index} className="badge bg-light text-dark me-2 mb-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      {restaurant.latitude && restaurant.longitude && (
        <div className="mt-5">
          <h3>Location</h3>
          <div className="card">
            <div className="card-body text-center bg-light" style={{ height: '300px' }}>
              <i className="bi bi-map fs-1 text-muted"></i>
              <p className="text-muted mt-3">
                Map integration would go here<br/>
                Coordinates: {restaurant.latitude}, {restaurant.longitude}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
