import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, favoriteAPI, historyAPI, reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({ rating: 5, comment: '' });
  const [submitingReview, setSubmitingReview] = useState(false);

  const loadRestaurant = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await restaurantAPI.getById(id);
      setRestaurant(response.data.restaurant);
      setIsFavorite(response.data.restaurant.isFavorite || false);
      
      // Add to history
      await historyAPI.add(id, 'view');
    } catch (err) {
      setError('Failed to load restaurant details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getRestaurantReviews(id);
      setReviews(response.data.reviews || []);
      setReviewStats(response.data.stats || null);
    } catch (error) {
      console.error('Load reviews error:', error);
      // Không set error, để trang vẫn hiển thị restaurant info
      setReviews([]);
      setReviewStats(null);
    }
  };

  const loadMyReview = async () => {
    if (!user) return;
    try {
      const response = await reviewAPI.getMyReview(id);
      if (response.data.review) {
        setMyReview(response.data.review);
        setReviewFormData({
          rating: response.data.review.rating,
          comment: response.data.review.comment || ''
        });
      }
    } catch (error) {
      console.error('Load my review error:', error);
      // Không set error
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      navigate('/login');
      return;
    }

    setSubmitingReview(true);
    try {
      await reviewAPI.createOrUpdate(id, reviewFormData.rating, reviewFormData.comment);
      toast.success(myReview ? 'Cập nhật đánh giá thành công!' : 'Đánh giá thành công!');
      setShowReviewForm(false);
      loadReviews();
      loadMyReview();
      loadRestaurant(); // Reload to update rating
    } catch (error) {
      toast.error('Không thể gửi đánh giá');
      console.error('Submit review error:', error);
    } finally {
      setSubmitingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewAPI.delete(reviewId);
      toast.success('Xóa đánh giá thành công!');
      setMyReview(null);
      setReviewFormData({ rating: 5, comment: '' });
      loadReviews();
      loadRestaurant();
    } catch (error) {
      toast.error('Không thể xóa đánh giá');
      console.error('Delete review error:', error);
    }
  };

  // Load data when component mounts or id changes
  useEffect(() => {
    loadRestaurant();
    loadReviews();
  }, [id]);

  // Load user's review when user changes
  useEffect(() => {
    if (user) {
      loadMyReview();
    }
  }, [id, user]);

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

  const getPriceBadge = (price) => 'ﾂ･'.repeat(price);

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
            <span className="text-warning fs-4 me-2">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span className="fs-5 fw-bold me-2">{restaurant.rating}</span>
            <span className="text-muted">({restaurant.reviews} reviews)</span>
          </div>

          {/* Distance & Time */}
          {restaurant.distance && (
            <div className="mb-3">
              <i className="bi bi-geo-alt text-primary me-2"></i>
              <strong>{restaurant.distance}m away</strong> 窶｢ {restaurant.walk_time} min walk
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
                {(restaurant.tags ? (typeof restaurant.tags === "string" ? restaurant.tags.split(",").map(t => t.trim()) : restaurant.tags) : []).map((tag, index) => (
                  <span key={index} className="badge bg-light text-dark me-2 mb-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Section */}
      {restaurant.latitude && restaurant.longitude && (
        <div className="mt-5">
          <h3>Location</h3>
          <div className="card">
            <div className="card-body p-0" style={{ height: '400px' }}>
              <MapContainer
                center={[parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)]}>
                  <Popup>
                    <strong>{restaurant.name}</strong><br />
                    {restaurant.address}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
          <div className="mt-2 text-muted small">
            <i className="bi bi-geo-alt me-1"></i>
            {restaurant.address}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Đánh giá & Nhận xét</h3>
          {user && (
            <button
              className="btn btn-primary"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              <i className="bi bi-pencil me-2"></i>
              {myReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </button>
          )}
        </div>

        {/* Review Stats */}
        {reviewStats && reviewStats.totalReviews > 0 && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center">
                  <h1 className="display-4">{reviewStats.averageRating.toFixed(1)}</h1>
                  <div className="text-warning fs-4">★★★★★</div>
                  <p className="text-muted">{reviewStats.totalReviews} đánh giá</p>
                </div>
                <div className="col-md-8">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="d-flex align-items-center mb-2">
                      <span className="me-2">{star} ★</span>
                      <div className="progress flex-grow-1 me-2" style={{ height: '10px' }}>
                        <div
                          className="progress-bar bg-warning"
                          style={{
                            width: `${(reviewStats.distribution[star] / reviewStats.totalReviews) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-muted">{reviewStats.distribution[star]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && user && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">{myReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}</h5>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="form-label">Đánh giá của bạn</label>
                  <div className="btn-group d-flex" role="group">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`btn ${reviewFormData.rating >= star ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                      >
                        {star} ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nhận xét</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Chia sẻ trải nghiệm của bạn về nhà hàng này..."
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  ></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitingReview}>
                    {submitingReview ? 'Đang gửi...' : (myReview ? 'Cập nhật' : 'Gửi đánh giá')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Hủy
                  </button>
                  {myReview && (
                    <button
                      type="button"
                      className="btn btn-outline-danger ms-auto"
                      onClick={() => handleDeleteReview(myReview.id)}
                    >
                      Xóa đánh giá
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-chat-quote fs-1"></i>
              <p className="mt-3">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0">{review.user_name}</h6>
                      <small className="text-muted">
                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      </small>
                    </div>
                    <div className="text-warning">
                      {Array.from({ length: Math.floor(review.rating) }, (_, i) => '★').join('')}
                      <span className="text-muted ms-1">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && <p className="mb-0">{review.comment}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;




