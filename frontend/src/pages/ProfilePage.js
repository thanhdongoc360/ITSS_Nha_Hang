import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState({
    max_distance: '',
    max_walk_time: '',
    cuisine_types: [],
    price_range: [1, 3]
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.get();
      setProfile(response.data.user);
      setEditName(response.data.user.name);
      setEditEmail(response.data.user.email);
      
      if (response.data.preferences) {
        setPreferences({
          max_distance: response.data.preferences.max_distance || '',
          max_walk_time: response.data.preferences.max_walk_time || '',
          cuisine_types: JSON.parse(response.data.preferences.cuisine_types || '[]'),
          price_range: JSON.parse(response.data.preferences.price_range || '[1, 3]')
        });
      }
      
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await profileAPI.update({
        name: editName,
        email: editEmail
      });

      updateUser({ ...user, name: editName, email: editEmail });
      setProfile({ ...profile, name: editName, email: editEmail });
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await profileAPI.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleCuisineToggle = (cuisine) => {
    const newCuisines = preferences.cuisine_types.includes(cuisine)
      ? preferences.cuisine_types.filter(c => c !== cuisine)
      : [...preferences.cuisine_types, cuisine];
    setPreferences({ ...preferences, cuisine_types: newCuisines });
  };

  const availableCuisines = ['和食', '中華', 'イタリアン', 'ラーメン', 'ベトナム料理', '韓国料理'];

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
        <i className="bi bi-person-circle me-2"></i>
        My Profile
      </h1>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row">
        {/* Profile Information */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Profile Information</h5>
                {!editMode && (
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditMode(false);
                        setEditName(profile.name);
                        setEditEmail(profile.email);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p><strong>Name:</strong> {profile?.name}</p>
                  <p><strong>Email:</strong> {profile?.email}</p>
                  <p className="text-muted mb-0">
                    <small>Member since {new Date(profile?.created_at).toLocaleDateString()}</small>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Statistics</h5>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="p-3">
                      <i className="bi bi-heart-fill text-danger fs-2"></i>
                      <h3 className="mt-2">{stats.favoritesCount}</h3>
                      <p className="text-muted mb-0">Favorites</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3">
                      <i className="bi bi-clock-history text-primary fs-2"></i>
                      <h3 className="mt-2">{stats.historyCount}</h3>
                      <p className="text-muted mb-0">History</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-sliders me-2"></i>
                Preferences
              </h5>

              <form onSubmit={handleUpdatePreferences}>
                <div className="mb-3">
                  <label className="form-label">Max Distance (meters)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={preferences.max_distance}
                    onChange={(e) => setPreferences({ ...preferences, max_distance: e.target.value })}
                    placeholder="e.g., 1000"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Max Walk Time (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={preferences.max_walk_time}
                    onChange={(e) => setPreferences({ ...preferences, max_walk_time: e.target.value })}
                    placeholder="e.g., 15"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Favorite Cuisines</label>
                  <div className="d-flex flex-wrap gap-2">
                    {availableCuisines.map((cuisine) => (
                      <button
                        key={cuisine}
                        type="button"
                        className={`btn btn-sm ${
                          preferences.cuisine_types.includes(cuisine)
                            ? 'btn-primary'
                            : 'btn-outline-primary'
                        }`}
                        onClick={() => handleCuisineToggle(cuisine)}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Price Range: ¥{preferences.price_range[0]} - ¥{preferences.price_range[1]}
                  </label>
                  <div className="d-flex gap-3">
                    <div className="flex-grow-1">
                      <label className="form-label small">Min</label>
                      <select
                        className="form-select"
                        value={preferences.price_range[0]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          price_range: [parseInt(e.target.value), preferences.price_range[1]]
                        })}
                      >
                        <option value="1">¥ (Budget)</option>
                        <option value="2">¥¥ (Moderate)</option>
                        <option value="3">¥¥¥ (Expensive)</option>
                      </select>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label small">Max</label>
                      <select
                        className="form-select"
                        value={preferences.price_range[1]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          price_range: [preferences.price_range[0], parseInt(e.target.value)]
                        })}
                      >
                        <option value="1">¥ (Budget)</option>
                        <option value="2">¥¥ (Moderate)</option>
                        <option value="3">¥¥¥ (Expensive)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
