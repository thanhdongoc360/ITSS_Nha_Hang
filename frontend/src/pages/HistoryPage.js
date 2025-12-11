import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historyAPI } from '../services/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (filter === 'all') {
        response = await historyAPI.getAll();
      } else {
        response = await historyAPI.getByAction(filter);
      }
      setHistory(response.history || []);
    } catch (err) {
      setError('履歴の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('すべての履歴を消去してもよろしいですか？')) {
      try {
        await historyAPI.deleteAll();
        setHistory([]);
      } catch (error) {
        alert('履歴の消去に失敗しました');
      }
    }
  };

  const getActionBadge = (action) => {
    const badges = {
      view: 'bg-primary',
      search: 'bg-info',
      visit: 'bg-success',
      order: 'bg-warning'
    };
    return badges[action] || 'bg-secondary';
  };

  const getActionIcon = (action) => {
    const icons = {
      view: 'bi-eye',
      search: 'bi-search',
      visit: 'bi-geo-alt',
      order: 'bi-cart'
    };
    return icons[action] || 'bi-circle';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-clock-history me-2"></i>
          履歴
        </h1>
        {history.length > 0 && (
          <button 
            className="btn btn-outline-danger"
            onClick={handleClearHistory}
          >
            <i className="bi bi-trash me-2"></i>
            すべて消去
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Filter Buttons */}
      <div className="btn-group mb-4" role="group">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilter('all')}
        >
          すべて
        </button>
        <button
          className={`btn ${filter === 'view' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilter('view')}
        >
          <i className="bi bi-eye me-1"></i>
          閲覧済み
        </button>
        <button
          className={`btn ${filter === 'search' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilter('search')}
        >
          <i className="bi bi-search me-1"></i>
          検索済み
        </button>
        <button
          className={`btn ${filter === 'visit' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilter('visit')}
        >
          <i className="bi bi-geo-alt me-1"></i>
          訪問済み
        </button>
      </div>

      {history.length > 0 ? (
        <div className="list-group">
          {history.map((item) => (
            <Link
              key={item.id}
              to={`/restaurant/${item.restaurant_id}`}
              className="list-group-item list-group-item-action"
            >
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded me-3"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <h5 className="mb-1">{item.name}</h5>
                    <p className="mb-1 text-muted">
                      <span className="badge bg-primary me-2">{item.cuisine}</span>
                      <span className="text-warning me-1">★</span>
                      {item.rating}
                      <span className="ms-2">{'¥'.repeat(item.price)}</span>
                    </p>
                    <small className="text-muted">
                      <i className={`bi ${getActionIcon(item.action)} me-1`}></i>
                      {formatDate(item.created_at)}
                    </small>
                  </div>
                </div>
                <span className={`badge ${getActionBadge(item.action)}`}>
                  {item.action}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-clock-history display-1 text-muted"></i>
          <h3 className="mt-3">履歴はまだありません</h3>
          <p className="text-muted">
            あなたの活動がここに表示されます
          </p>
          <a href="/" className="btn btn-primary mt-3">
            探索を開始
          </a>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
