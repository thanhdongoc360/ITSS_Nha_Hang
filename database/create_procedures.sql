-- ==================== Create Stored Procedures for GohanGo ====================
USE gohan_go;

-- Drop procedures if they exist
DROP PROCEDURE IF EXISTS add_to_favorites;
DROP PROCEDURE IF EXISTS remove_from_favorites;
DROP PROCEDURE IF EXISTS add_to_history;
DROP PROCEDURE IF EXISTS search_restaurants;
DROP PROCEDURE IF EXISTS get_recommendations;

-- Procedure để thêm vào favorites
DELIMITER //
CREATE PROCEDURE add_to_favorites(
  IN p_user_id INT,
  IN p_restaurant_id INT
)
BEGIN
  INSERT INTO favorites (user_id, restaurant_id)
  VALUES (p_user_id, p_restaurant_id)
  ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Procedure để xóa khỏi favorites
DELIMITER //
CREATE PROCEDURE remove_from_favorites(
  IN p_user_id INT,
  IN p_restaurant_id INT
)
BEGIN
  DELETE FROM favorites 
  WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id;
END //
DELIMITER ;

-- Procedure để thêm vào history
DELIMITER //
CREATE PROCEDURE add_to_history(
  IN p_user_id INT,
  IN p_restaurant_id INT,
  IN p_action VARCHAR(50)
)
BEGIN
  INSERT INTO history (user_id, restaurant_id, action)
  VALUES (p_user_id, p_restaurant_id, p_action);
END //
DELIMITER ;

-- Procedure để tìm kiếm nhà hàng
DELIMITER //
CREATE PROCEDURE search_restaurants(
  IN p_query VARCHAR(255),
  IN p_cuisine VARCHAR(100),
  IN p_max_distance INT,
  IN p_max_price INT
)
BEGIN
  SELECT *
  FROM restaurants
  WHERE 
    (p_query IS NULL OR name LIKE CONCAT('%', p_query, '%'))
    AND (p_cuisine IS NULL OR cuisine = p_cuisine)
    AND (p_max_distance IS NULL OR distance <= p_max_distance)
    AND (p_max_price IS NULL OR price <= p_max_price)
  ORDER BY rating DESC, reviews DESC;
END //
DELIMITER ;

-- Procedure để lấy recommendations dựa trên preferences
DELIMITER //
CREATE PROCEDURE get_recommendations(
  IN p_user_id INT
)
BEGIN
  DECLARE v_max_distance INT;
  DECLARE v_cuisine_types JSON;
  DECLARE v_price_range JSON;
  
  -- Lấy preferences của user
  SELECT max_distance, cuisine_types, price_range
  INTO v_max_distance, v_cuisine_types, v_price_range
  FROM user_preferences
  WHERE user_id = p_user_id;
  
  -- Nếu không có preferences, trả về top rated
  IF v_max_distance IS NULL THEN
    SELECT *
    FROM restaurants
    ORDER BY rating DESC, reviews DESC
    LIMIT 10;
  ELSE
    -- Trả về restaurants phù hợp với preferences
    SELECT *
    FROM restaurants
    WHERE 
      (v_max_distance IS NULL OR distance <= v_max_distance)
      AND (v_cuisine_types IS NULL OR JSON_CONTAINS(v_cuisine_types, JSON_QUOTE(cuisine)))
      AND rating >= 4.0
    ORDER BY rating DESC, reviews DESC
    LIMIT 10;
  END IF;
END //
DELIMITER ;

-- Verify procedures created
SHOW PROCEDURE STATUS WHERE Db = 'gohan_go';

SELECT 'Stored procedures created successfully!' AS Status;
