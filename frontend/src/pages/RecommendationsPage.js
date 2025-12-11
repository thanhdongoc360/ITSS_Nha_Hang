import React, { useState, useEffect } from 'react';
import { recommendationAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import { showError, showInfo } from '../utils/toast';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [basedOn, setBasedOn] = useState({});
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('checking'); // checking, enabled, disabled

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('checking');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setGpsStatus('enabled');
          loadRecommendations(location);
          showInfo('📍 Using your location for better recommendations');
        },
        (error) => {
          console.warn('GPS error:', error);
          setGpsStatus('disabled');
          loadRecommendations(null);
          showInfo('💡 Enable GPS for personalized distance-based recommendations');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setGpsStatus('disabled');
      loadRecommendations(null);
    }
  };

  const loadRecommendations = async (location = userLocation) => {
    setLoading(true);
    try {
      const params = {};
      if (location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }
      
      const response = await recommendationAPI.get(params);
      setRecommendations(response.data.recommendations || []);
      setBasedOn(response.data.basedOn || {});
    } catch (error) {
      showError('Failed to load recommendations');
      console.error('Load recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBasedOnMessage = () => {
    const sources = [];
    if (basedOn.hasFavorites) sources.push('your favorites');
    if (basedOn.hasHistory) sources.push('your history');
    if (basedOn.hasPreferences) sources.push('your preferences');

    if (sources.length === 0) {
      return 'Based on highly-rated restaurants';
    }

    return `Based on ${sources.join(', ')}`;
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="recommendations-header mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="display-6 mb-2">
              <i className="bi bi-stars me-2"></i>
              AI Recommendations
            </h1>
            <p className="text-muted mb-0">
              {getBasedOnMessage()}
            </p>
          </div>
          <button 
            onClick={getUserLocation}
            className="btn btn-outline-primary btn-sm"
            disabled={loading}
          >
            <i className={`bi ${gpsStatus === 'enabled' ? 'bi-arrow-clockwise' : 'bi-geo-alt'} me-1`}></i>
            {gpsStatus === 'enabled' ? 'Refresh' : 'Enable GPS'}
          </button>
        </div>
      </div>

      {/* GPS Status Card */}
      {gpsStatus === 'enabled' && userLocation && (
        <div className="alert alert-success mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-geo-alt-fill me-2"></i>
            <small>
              <strong>GPS Enabled</strong> - Showing restaurants based on your location
            </small>
          </div>
        </div>
      )}

      {gpsStatus === 'disabled' && (
        <div className="alert alert-warning mb-4">
          <div className="d-flex align-items-start">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <div>
              <small>
                <strong>GPS Disabled</strong> - Enable location access for distance-based recommendations
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      {(!basedOn.hasFavorites && !basedOn.hasHistory && !basedOn.hasPreferences) && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-start">
            <i className="bi bi-info-circle me-3 fs-4"></i>
            <div>
              <h6 className="mb-2">Get Better AI Recommendations!</h6>
              <p className="mb-0 small">
                Add favorites, visit restaurants, and set your preferences for smarter AI suggestions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Finding perfect restaurants for you...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="row">
          {recommendations.map((restaurant) => (
            <div key={restaurant.id} className="recommendation-item mb-4">
              <RestaurantCard
                restaurant={restaurant}
                isFavorite={restaurant.isFavorite}
              />
              
              {/* Recommendation Reasons */}
              {restaurant.recommendationReasons && restaurant.recommendationReasons.length > 0 && (
                <div className="recommendation-reasons mt-2 px-3">
                  <div className="d-flex flex-wrap gap-2">
                    {restaurant.recommendationReasons.map((reason, idx) => (
                      <span key={idx} className="badge bg-light text-dark border">
                        <i className="bi bi-check-circle text-success me-1"></i>
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-emoji-frown display-1 text-muted"></i>
          <h3 className="mt-3">No Recommendations Yet</h3>
          <p className="text-muted mb-4">
            Start exploring restaurants to get personalized recommendations!
          </p>
          <a href="/search" className="btn btn-primary">
            <i className="bi bi-search me-2"></i>
            Explore Restaurants
          </a>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
