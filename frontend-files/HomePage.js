import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [popular, setPopular] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [allRes, popRes, nearRes] = await Promise.all([
        restaurantAPI.getAll({ limit: 12 }),
        restaurantAPI.getPopular(6),
        restaurantAPI.getNearby(6)
      ]);

      setRestaurants(allRes.data.restaurants || []);
      setPopular(popRes.data.restaurants || []);
      setNearby(nearRes.data.restaurants || []);
    } catch (err) {
      setError('Failed to load restaurants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Find Your Next Meal 🍜</h1>
        <p className="lead text-muted">Discover the best restaurants around you</p>
      </div>

      {/* Popular Restaurants */}
      {popular.length > 0 && (
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">
              <i className="bi bi-fire text-danger me-2"></i>
              Popular Restaurants
            </h2>
          </div>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {popular.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant}
                isFavorite={restaurant.isFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Nearby Restaurants */}
      {nearby.length > 0 && (
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">
              <i className="bi bi-geo-alt text-primary me-2"></i>
              Nearby Restaurants
            </h2>
          </div>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {nearby.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant}
                isFavorite={restaurant.isFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Restaurants */}
      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">
            <i className="bi bi-grid text-success me-2"></i>
            All Restaurants
          </h2>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant}
              isFavorite={restaurant.isFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
