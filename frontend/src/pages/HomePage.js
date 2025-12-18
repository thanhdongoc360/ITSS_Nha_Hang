import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
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
      setError('レストランの読み込みに失敗しました');
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
            <span className="visually-hidden">読み込み中...</span>
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
    <div className="home-page">
      {/* Logo Header */}
      <div className="home-logo-header">
        <h1 className="home-logo">GOHANGO</h1>
      </div>

      {/* Search Bar */}
      <div className="search-bar-home">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            className="form-control border-start-0" 
            placeholder="レストランを検索"
            onClick={() => navigate('/search')}
            readOnly
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        {/* Recommend Section */}
        {popular.length > 0 && (
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0 fw-bold">
                <i className="bi bi-star-fill text-warning me-2"></i>
                おすすめ
              </h2>
            </div>
            
            <div className="row row-cols-2 row-cols-md-3 g-2 g-sm-3 g-md-4">
              {popular.map((restaurant) => (
                <div key={restaurant.id} className="col">
                  <RestaurantCard 
                    restaurant={restaurant}
                    isFavorite={restaurant.isFavorite}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Restaurants */}
        {nearby.length > 0 && (
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0 fw-bold">
                <i className="bi bi-geo-alt text-primary me-2"></i>
                周辺
              </h2>
            </div>
            <div className="row row-cols-2 row-cols-md-3 g-2 g-sm-3 g-md-4">
              {nearby.map((restaurant) => (
                <div key={restaurant.id} className="col">
                  <RestaurantCard 
                    restaurant={restaurant}
                    isFavorite={restaurant.isFavorite}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Restaurants */}
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0 fw-bold">
              <i className="bi bi-grid text-success me-2"></i>
              すべて
            </h2>
          </div>
          <div className="row row-cols-2 row-cols-md-3 g-2 g-sm-3 g-md-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="col">
                <RestaurantCard 
                  restaurant={restaurant}
                  isFavorite={restaurant.isFavorite}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
