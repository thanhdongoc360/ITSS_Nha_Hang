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

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.get();
      setProfile(response.user);
      setEditName(response.user.name);
      setEditEmail(response.user.email);
      
      if (response.preferences) {
        setPreferences({
          max_distance: response.preferences.max_distance || '',
          max_walk_time: response.preferences.max_walk_time || '',
          cuisine_types: JSON.parse(response.preferences.cuisine_types || '[]'),
          price_range: JSON.parse(response.preferences.price_range || '[1, 3]')
        });
      }
      
      setStats(response.stats);
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
      setMessage({ type: 'success', text: 'プロフィールを更新しました！' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'プロフィールの更新に失敗しました' });
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
      setMessage({ type: 'success', text: '設定を更新しました！' });
    } catch (error) {
      setMessage({ type: 'danger', text: '設定の更新に失敗しました' });
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validation
    if (passwordData.newPassword.length < 6) {
      setPasswordError('新しいパスワードは6文字以上である必要があります');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('新しいパスワードが一致しません');
      return;
    }

    setSaving(true);
    try {
      await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage({ type: 'success', text: 'パスワードを変更しました！' });
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'パスワードの変更に失敗しました');
    } finally {
      setSaving(false);
    }
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
        マイプロフィール
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
                <h5 className="card-title mb-0">プロフィール情報</h5>
                {!editMode && (
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    編集
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label className="form-label">名前</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">メールアドレス</label>
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
                      {saving ? '保存中...' : '変更を保存'}
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
                      キャンセル
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p><strong>名前:</strong> {profile?.name}</p>
                  <p><strong>メール:</strong> {profile?.email}</p>
                  <p className="text-muted mb-3">
                    <small>登録日: {new Date(profile?.created_at).toLocaleDateString('ja-JP')}</small>
                  </p>
                  
                  <hr />
                  
                  {/* Password Change Section */}
                  <div className="mt-3">
                    {!showPasswordForm ? (
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setShowPasswordForm(true)}
                      >
                        <i className="bi bi-key me-1"></i>
                        パスワードを変更
                      </button>
                    ) : (
                      <form onSubmit={handlePasswordChange}>
                        <h6 className="mb-3">パスワードを変更</h6>
                        
                        {passwordError && (
                          <div className="alert alert-danger alert-sm py-2">
                            <small>{passwordError}</small>
                          </div>
                        )}
                        
                        <div className="mb-3">
                          <label className="form-label">現在のパスワード</label>
                          <input
                            type="password"
                            className="form-control"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            required
                            autoComplete="current-password"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">新しいパスワード</label>
                          <input
                            type="password"
                            className="form-control"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                            minLength="6"
                            autoComplete="new-password"
                          />
                          <small className="text-muted">6文字以上</small>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">新しいパスワード（確認）</label>
                          <input
                            type="password"
                            className="form-control"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            required
                            autoComplete="new-password"
                          />
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                            {saving ? '変更中...' : '変更'}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                              setPasswordError('');
                            }}
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h5 className="card-title mb-3">統計</h5>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="p-3">
                      <i className="bi bi-heart-fill text-danger fs-2"></i>
                      <h3 className="mt-2">{stats.favoritesCount}</h3>
                      <p className="text-muted mb-0">お気に入り</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3">
                      <i className="bi bi-clock-history text-primary fs-2"></i>
                      <h3 className="mt-2">{stats.historyCount}</h3>
                      <p className="text-muted mb-0">履歴</p>
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
                設定
              </h5>

              <form onSubmit={handleUpdatePreferences}>
                <div className="mb-3">
                  <label className="form-label">最大距離 (メートル)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={preferences.max_distance}
                    onChange={(e) => setPreferences({ ...preferences, max_distance: e.target.value })}
                    placeholder="e.g., 1000"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">最大徒歩時間 (分)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={preferences.max_walk_time}
                    onChange={(e) => setPreferences({ ...preferences, max_walk_time: e.target.value })}
                    placeholder="e.g., 15"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">好きな料理</label>
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
                    価格帯: ¥{preferences.price_range[0]} - ¥{preferences.price_range[1]}
                  </label>
                  <div className="d-flex gap-3">
                    <div className="flex-grow-1">
                      <label className="form-label small">最小</label>
                      <select
                        className="form-select"
                        value={preferences.price_range[0]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          price_range: [parseInt(e.target.value), preferences.price_range[1]]
                        })}
                      >
                        <option value="1">¥ (安い)</option>
                        <option value="2">¥¥ (普通)</option>
                        <option value="3">¥¥¥ (高い)</option>
                      </select>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label small">最大</label>
                      <select
                        className="form-select"
                        value={preferences.price_range[1]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          price_range: [preferences.price_range[0], parseInt(e.target.value)]
                        })}
                      >
                        <option value="1">¥ (安い)</option>
                        <option value="2">¥¥ (普通)</option>
                        <option value="3">¥¥¥ (高い)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  {saving ? '保存中...' : '設定を保存'}
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
