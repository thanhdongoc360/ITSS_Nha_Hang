import React, { useState, useEffect } from 'react';
import { favoriteAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await favoriteAPI.getAll();
      setFavorites(response.data.favorites || []);
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (restaurantId, isFavorite) => {
    if (!isFavorite) {
      // Removed from favorites, update list
      setFavorites(favorites.filter(f => f.id !== restaurantId));
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

  return (
    <div className="container py-4">
      <h1 className="mb-4">
        <i className="bi bi-heart-fill text-danger me-2"></i>
        My Favorites
      </h1>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {favorites.length > 0 ? (
        <>
          <p className="text-muted mb-4">
            You have {favorites.length} favorite restaurant{favorites.length !== 1 ? 's' : ''}
          </p>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {favorites.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant}
                isFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-heart display-1 text-muted"></i>
          <h3 className="mt-3">No favorites yet</h3>
          <p className="text-muted">
            Start exploring restaurants and add them to your favorites!
          </p>
          <a href="/" className="btn btn-primary mt-3">
            Browse Restaurants
          </a>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
