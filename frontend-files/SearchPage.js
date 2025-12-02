import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadCuisines();
  }, []);

  const loadCuisines = async () => {
    try {
      const response = await restaurantAPI.getCuisines();
      setCuisines(response.data.cuisines || []);
    } catch (error) {
      console.error('Failed to load cuisines:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const filters = {};
      if (query) filters.q = query;
      if (cuisine) filters.cuisine = cuisine;
      if (maxDistance) filters.maxDistance = maxDistance;
      if (maxPrice) filters.maxPrice = maxPrice;

      const response = await restaurantAPI.getAll(filters);
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Search error:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setCuisine('');
    setMaxDistance('');
    setMaxPrice('');
    setRestaurants([]);
    setSearched(false);
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">
        <i className="bi bi-search me-2"></i>
        Search Restaurants
      </h1>

      {/* Search Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              {/* Search Query */}
              <div className="col-md-6">
                <label htmlFor="query" className="form-label">Restaurant Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 寿司, ラーメン"
                />
              </div>

              {/* Cuisine Filter */}
              <div className="col-md-6">
                <label htmlFor="cuisine" className="form-label">Cuisine Type</label>
                <select
                  className="form-select"
                  id="cuisine"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                >
                  <option value="">All Cuisines</option>
                  {cuisines.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Distance Filter */}
              <div className="col-md-6">
                <label htmlFor="distance" className="form-label">Max Distance (meters)</label>
                <input
                  type="number"
                  className="form-control"
                  id="distance"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  placeholder="e.g., 1000"
                  min="0"
                />
              </div>

              {/* Price Filter */}
              <div className="col-md-6">
                <label htmlFor="price" className="form-label">Max Price</label>
                <select
                  className="form-select"
                  id="price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                >
                  <option value="">Any Price</option>
                  <option value="1">¥ (Budget)</option>
                  <option value="2">¥¥ (Moderate)</option>
                  <option value="3">¥¥¥ (Expensive)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="col-12">
                <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Search
                    </>
                  )}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">
              Search Results ({restaurants.length})
            </h2>
          </div>

          {restaurants.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant}
                  isFavorite={restaurant.isFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No restaurants found matching your criteria.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
