-- ==================== ADD REVIEWS TABLE ====================
-- Thêm bảng reviews để user có thể đánh giá và bình luận về nhà hàng

USE gohan_go;

-- Tạo bảng reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_restaurant_review (user_id, restaurant_id),
  INDEX idx_reviews_user (user_id),
  INDEX idx_reviews_restaurant (restaurant_id),
  INDEX idx_reviews_rating (rating),
  INDEX idx_reviews_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm trigger để tự động cập nhật rating trung bình của nhà hàng
DELIMITER //

CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  UPDATE restaurants
  SET rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE restaurant_id = NEW.restaurant_id
  ),
  reviews = (
    SELECT COUNT(*)
    FROM reviews
    WHERE restaurant_id = NEW.restaurant_id
  )
  WHERE id = NEW.restaurant_id;
END //

CREATE TRIGGER after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE restaurants
  SET rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE restaurant_id = NEW.restaurant_id
  )
  WHERE id = NEW.restaurant_id;
END //

CREATE TRIGGER after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
  UPDATE restaurants
  SET rating = COALESCE((
    SELECT AVG(rating)
    FROM reviews
    WHERE restaurant_id = OLD.restaurant_id
  ), 0),
  reviews = (
    SELECT COUNT(*)
    FROM reviews
    WHERE restaurant_id = OLD.restaurant_id
  )
  WHERE id = OLD.restaurant_id;
END //

DELIMITER ;

COMMIT;
