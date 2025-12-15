import React, { useState, useEffect, useCallback } from 'react';
import { restaurantAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import { showError } from '../utils/toast';
import './SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [maxDistance, setMaxDistance] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [cuisines, setCuisines] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortRestaurants();
  }, [restaurants, selectedCuisines, selectedPrices, maxDistance, minRating, sortBy, sortOrder, query]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [restaurantsRes, cuisinesRes] = await Promise.all([
        restaurantAPI.getAll(),
        restaurantAPI.getCuisines()
      ]);
      setRestaurants(restaurantsRes.data.restaurants || []);
      setCuisines(cuisinesRes.data.cuisines || []);
    } catch (error) {
      showError('Failed to load restaurants');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRestaurants = useCallback(() => {
    let filtered = [...restaurants];

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(lowerQuery) ||
        r.cuisine.toLowerCase().includes(lowerQuery) ||
        (r.description && r.description.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by cuisine
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(r => selectedCuisines.includes(r.cuisine));
    }

    // Filter by price
    if (selectedPrices.length > 0) {
      filtered = filtered.filter(r => selectedPrices.includes(r.price));
    }

    // Filter by distance
    filtered = filtered.filter(r => !r.distance || r.distance <= maxDistance);

    // Filter by rating
    filtered = filtered.filter(r => r.rating >= minRating);

    // Sort
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'rating':
          valueA = a.rating;
          valueB = b.rating;
          break;
        case 'distance':
          valueA = a.distance || 999999;
          valueB = b.distance || 999999;
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'reviews':
          valueA = a.reviews;
          valueB = b.reviews;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });

    setFilteredRestaurants(filtered);
  }, [restaurants, selectedCuisines, selectedPrices, maxDistance, minRating, sortBy, sortOrder, query]);

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const togglePrice = (price) => {
    setSelectedPrices(prev =>
      prev.includes(price)
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  const handleReset = () => {
    setQuery('');
    setSelectedCuisines([]);
    setSelectedPrices([]);
    setMaxDistance(2000);
    setMinRating(0);
    setSortBy('rating');
    setSortOrder('desc');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCuisines.length > 0) count += selectedCuisines.length;
    if (selectedPrices.length > 0) count += selectedPrices.length;
    if (maxDistance < 2000) count++;
    if (minRating > 0) count++;
    return count;
  };

  const getPriceLabel = (price) => {
    return '¥'.repeat(price);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-12 col-lg-3 mb-4">
          {/* Mobile Toggle Button */}
          <div className="d-lg-none mb-3">
            <button
              className="btn btn-primary w-100"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className={`bi bi-funnel me-2`}></i>
              フィルター {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'} ms-auto`}></i>
            </button>
          </div>

          {/* Filter Sidebar */}
          <div className={`filters-sidebar ${showFilters ? 'show' : 'd-none d-lg-block'}`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                フィルター
              </h5>
              {getActiveFiltersCount() > 0 && (
                <span className="badge bg-primary rounded-pill">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <label className="form-label fw-semibold">検索</label>
              <input
                type="text"
                className="form-control"
                placeholder="レストラン名..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Cuisine Filter */}
            <div className="mb-4">
              <label className="form-label fw-semibold">料理タイプ</label>
              <div className="cuisine-filters">
                {cuisines.map(cuisine => (
                  <div key={cuisine} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`cuisine-${cuisine}`}
                      checked={selectedCuisines.includes(cuisine)}
                      onChange={() => toggleCuisine(cuisine)}
                    />
                    <label className="form-check-label" htmlFor={`cuisine-${cuisine}`}>
                      {cuisine}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <label className="form-label fw-semibold">価格帯</label>
              <div className="price-filters">
                {[1, 2, 3].map(price => (
                  <div key={price} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`price-${price}`}
                      checked={selectedPrices.includes(price)}
                      onChange={() => togglePrice(price)}
                    />
                    <label className="form-check-label" htmlFor={`price-${price}`}>
                      {getPriceLabel(price)} {price === 1 ? '(安い)' : price === 2 ? '(普通)' : '(高い)'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                最大距離: {maxDistance}m
              </label>
              <input
                type="range"
                className="form-range"
                min="100"
                max="2000"
                step="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>100m</span>
                <span>2000m</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                最低評価: {minRating > 0 ? `${minRating}★` : 'すべて'}
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>すべて</span>
                <span>5★</span>
              </div>
            </div>

            {/* Reset Button */}
            {getActiveFiltersCount() > 0 && (
              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleReset}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                すべてのフィルターをクリア
              </button>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="col-lg-9">
          {/* Header with Sort */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">
                <i className="bi bi-search me-2"></i>
                レストラン検索
              </h1>
              <p className="text-muted mb-0">
                {loading ? '読み込み中...' : `${filteredRestaurants.length}件のレストランが見つかりました`}
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              className="btn btn-outline-primary d-lg-none"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="bi bi-funnel me-2"></i>
              フィルター {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </button>
          </div>

          {/* Active Filters Badges */}
          {getActiveFiltersCount() > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-2">
              {selectedCuisines.map(cuisine => (
                <span key={cuisine} className="badge bg-primary">
                  {cuisine}
                  <button
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.6rem' }}
                    onClick={() => toggleCuisine(cuisine)}
                  ></button>
                </span>
              ))}
              {selectedPrices.map(price => (
                <span key={price} className="badge bg-success">
                  {getPriceLabel(price)}
                  <button
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.6rem' }}
                    onClick={() => togglePrice(price)}
                  ></button>
                </span>
              ))}
            </div>
          )}

          {/* Sort Options */}
          <div className="card mb-4">
            <div className="card-body py-2">
              <div className="row align-items-center g-2">
                <div className="col-auto">
                  <span className="text-muted small">並び替え:</span>
                </div>
                <div className="col-auto">
                  <select
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="rating">評価</option>
                    <option value="distance">距離</option>
                    <option value="price">価格</option>
                    <option value="reviews">レビュー数</option>
                  </select>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">レストランを読み込み中...</p>
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="row g-2 g-sm-3 g-md-4">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="col-6 col-md-4 col-lg-6 col-xl-4">
                  <RestaurantCard
                    restaurant={restaurant}
                    isFavorite={restaurant.isFavorite}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h3 className="mt-3">レストランが見つかりません</h3>
              <p className="text-muted">
                フィルターまたは検索語を調整してください
              </p>
              <button className="btn btn-primary" onClick={handleReset}>
                すべてのフィルターをクリア
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
