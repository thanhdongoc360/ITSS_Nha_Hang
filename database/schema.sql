-- ==================== GohanGo MySQL Database Schema ====================
-- Ứng Dụng Tìm Kiếm Nhà Hàng
-- Author: GohanGo Team
-- Date: 2025-12-01

-- Tạo database
CREATE DATABASE IF NOT EXISTS gohan_go CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gohan_go;

-- ==================== USERS TABLE ====================
-- Lưu thông tin tài khoản người dùng
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Hashed password with bcrypt',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== USER PREFERENCES TABLE ====================
-- Lưu preferences của người dùng để gợi ý nhà hàng
CREATE TABLE user_preferences (
  user_id INT PRIMARY KEY,
  max_distance INT DEFAULT 1000 COMMENT 'Khoảng cách tối đa (meters)',
  max_walk_time INT DEFAULT 15 COMMENT 'Thời gian đi bộ tối đa (phút)',
  cuisine_types JSON DEFAULT NULL COMMENT 'Loại ẩm thực yêu thích: ["和食", "中華", ...]',
  price_range JSON DEFAULT NULL COMMENT 'Khoảng giá [min, max]: [1,3]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== RESTAURANTS TABLE ====================
-- Lưu thông tin nhà hàng
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(100) NOT NULL COMMENT 'Loại ẩm thực: 和食, 中華, イタリアン, ...',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INT DEFAULT 0 COMMENT 'Số lượng đánh giá',
  distance INT COMMENT 'Khoảng cách từ vị trí hiện tại (meters)',
  walk_time INT COMMENT 'Thời gian đi bộ (phút)',
  price INT DEFAULT 1 CHECK (price BETWEEN 1 AND 3) COMMENT '1=Rẻ, 2=Trung bình, 3=Đắt',
  image TEXT COMMENT 'URL ảnh nhà hàng',
  description TEXT COMMENT 'Mô tả chi tiết',
  address VARCHAR(500),
  phone VARCHAR(50),
  hours VARCHAR(255) COMMENT 'Giờ mở cửa',
  tags JSON DEFAULT NULL COMMENT 'Tags: ["delivery", "takeout", "wifi"]',
  latitude DECIMAL(10, 8) COMMENT 'Tọa độ GPS',
  longitude DECIMAL(11, 8) COMMENT 'Tọa độ GPS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_restaurants_cuisine (cuisine),
  INDEX idx_restaurants_rating (rating),
  INDEX idx_restaurants_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== FAVORITES TABLE ====================
-- Lưu danh sách nhà hàng yêu thích của người dùng
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, restaurant_id),
  INDEX idx_favorites_user (user_id),
  INDEX idx_favorites_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== HISTORY TABLE ====================
-- Lưu lịch sử hoạt động của người dùng
CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT 'view, search, visit, order',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_history_user (user_id),
  INDEX idx_history_restaurant (restaurant_id),
  INDEX idx_history_action (action),
  INDEX idx_history_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== INSERT SAMPLE DATA ====================

-- Thêm 6 nhà hàng mẫu
INSERT INTO restaurants (name, cuisine, rating, reviews, distance, walk_time, price, image, description, address, phone, hours, tags, latitude, longitude) VALUES
(
  '寿司の達人',
  '和食',
  4.8,
  245,
  350,
  5,
  3,
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
  '新鮮な魚介を使った本格江戸前寿司。熟練の職人が握る極上の寿司をお楽しみいただけます。カウンター席では職人の技を間近で見ることができます。',
  '東京都渋谷区道玄坂1-2-3',
  '03-1234-5678',
  '11:30-14:00, 17:00-22:00',
  '["wifi", "creditcard", "reservation"]',
  35.6595,
  139.7004
),
(
  'ラーメン横丁',
  'ラーメン',
  4.5,
  567,
  200,
  3,
  1,
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
  '濃厚豚骨スープが自慢の人気ラーメン店。深夜まで営業しているので、飲んだ後の締めにも最適です。チャーシューは自家製で絶品。',
  '東京都渋谷区宇田川町4-5-6',
  '03-2345-6789',
  '11:00-翌2:00',
  '["latenight", "takeout", "delivery"]',
  35.6617,
  139.6983
),
(
  '四川火鍋',
  '中華',
  4.6,
  189,
  500,
  7,
  2,
  'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800',
  '本場四川の火鍋を味わえる専門店。辛さは5段階から選べます。新鮮な野菜と肉類が食べ放題プランもございます。',
  '東京都渋谷区神南1-7-8',
  '03-3456-7890',
  '17:00-23:00',
  '["spicy", "allYouCanEat", "group"]',
  35.6627,
  139.7015
),
(
  'イタリアーノ',
  'イタリアン',
  4.7,
  312,
  450,
  6,
  2,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  '本格的なナポリピッツァと手打ちパスタが楽しめるイタリアンレストラン。石窯で焼き上げるピッツァは絶品です。ワインも豊富に取り揃えております。',
  '東京都渋谷区桜丘町9-10-11',
  '03-4567-8901',
  '11:30-15:00, 17:30-22:30',
  '["wine", "terrace", "romantic"]',
  35.6580,
  139.6989
),
(
  'ベトナム屋台',
  'ベトナム料理',
  4.4,
  423,
  300,
  4,
  1,
  'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
  '本場の味を再現したベトナム料理店。フォー、バインミー、生春巻きなど人気メニューが揃っています。ヘルシーで女性に大人気。',
  '東京都渋谷区円山町12-13-14',
  '03-5678-9012',
  '11:00-22:00',
  '["healthy", "vegetarian", "casual"]',
  35.6563,
  139.6947
),
(
  '韓国バーベキュー',
  '韓国料理',
  4.9,
  678,
  600,
  8,
  2,
  'https://www.kaukauhawaii.com/wp-content/uploads/sites/1/2019/12/gen-korean-bbq-hawaii-alamoana-all-you-can-eat.png',
  '最高級の韓牛を使用した本格韓国焼肉店。サイドメニューのキムチやナムルも全て自家製。個室も完備しているので、グループでのご利用にも最適です。',
  '東京都渋谷区道玄坂2-15-16',
  '03-6789-0123',
  '17:00-24:00',
  '["bbq", "privateRoom", "parking"]',
  35.6575,
  139.6970
);

-- Thêm một số nhà hàng ở Hà Nội
INSERT INTO restaurants (name, cuisine, rating, reviews, distance, walk_time, price, image, description, address, phone, hours, tags, latitude, longitude) VALUES
(
  'Pho Thin Lo Duc',
  'Vietnamese',
  4.7,
  820,
  500,
  7,
  1,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  'Pho bo truyen thong voi nuoc dung dam da, noi tieng tai Ha Noi. Khong gian don gian nhung luon dong khach.',
  '13 Lo Duc, Hai Ba Trung, Ha Noi',
  '+84-24-3821-2709',
  '06:00-22:00',
  '["pho", "noReservation", "local"]',
  21.0178,
  105.8542
),
(
  'Bun Cha Huong Lien',
  'Vietnamese',
  4.6,
  1200,
  850,
  11,
  1,
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  'Quan bun cha noi tieng voi nuoc mam dam da va nem cua be. Từng duoc tong thong My Barack Obama tham an.',
  '24 Le Van Huu, Hai Ba Trung, Ha Noi',
  '+84-24-3943-4106',
  '09:00-21:00',
  '["buncha", "family", "casual"]',
  21.0142,
  105.8536
),
(
  "Pizza 4P's Trang Tien",
  'Italian',
  4.8,
  2100,
  900,
  12,
  2,
  'https://images.unsplash.com/photo-1548365328-9da9d86d0090?w=800',
  'Pizza thu cong luong men tu nhien va phomai tu san xuat. Khong gian hien dai, phu hop hen ho va gia dinh.',
  '43 Trang Tien, Hoan Kiem, Ha Noi',
  '+84-24-3622-0666',
  '10:00-22:00',
  '["pizza", "cheese", "reservation"]',
  21.0255,
  105.8535
),
(
  'Lau Nam Gia Khanh',
  'Hotpot',
  4.5,
  650,
  1500,
  18,
  2,
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  'Lau nam thanh ngot voi nhieu loai nam tuoi. Phu hop di nhom, co phong rieng.',
  '152 Pho Hue, Hai Ba Trung, Ha Noi',
  '+84-24-3976-3966',
  '10:00-22:30',
  '["hotpot", "mushroom", "group"]',
  21.0107,
  105.8510
);

-- ==================== CREATE VIEWS ====================

-- View để lấy danh sách nhà hàng phổ biến
CREATE VIEW popular_restaurants AS
SELECT 
  id,
  name,
  cuisine,
  rating,
  reviews,
  distance,
  walk_time,
  price,
  image
FROM restaurants
WHERE rating >= 4.5
ORDER BY reviews DESC, rating DESC;

-- View để lấy nhà hàng gần nhất
CREATE VIEW nearby_restaurants AS
SELECT 
  id,
  name,
  cuisine,
  rating,
  distance,
  walk_time,
  price,
  image
FROM restaurants
ORDER BY distance ASC
LIMIT 10;

-- ==================== CREATE STORED PROCEDURES ====================

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

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Index cho full-text search (optional)
-- ALTER TABLE restaurants ADD FULLTEXT INDEX idx_name_description (name, description);

-- Composite indexes cho queries phổ biến
CREATE INDEX idx_cuisine_rating ON restaurants(cuisine, rating);
CREATE INDEX idx_distance_rating ON restaurants(distance, rating);
CREATE INDEX idx_price_rating ON restaurants(price, rating);

-- ==================== SAMPLE QUERIES ====================

-- Tìm tất cả nhà hàng Nhật Bản
-- SELECT * FROM restaurants WHERE cuisine = '和食';

-- Tìm nhà hàng gần nhất
-- SELECT * FROM restaurants ORDER BY distance LIMIT 5;

-- Tìm nhà hàng rating cao
-- SELECT * FROM restaurants WHERE rating >= 4.5 ORDER BY rating DESC;

-- Tìm nhà hàng theo giá
-- SELECT * FROM restaurants WHERE price = 1 ORDER BY rating DESC;

-- Lấy favorites của user
-- SELECT r.* FROM restaurants r
-- JOIN favorites f ON r.id = f.restaurant_id
-- WHERE f.user_id = 1;

-- Lấy history của user
-- SELECT r.*, h.action, h.created_at FROM restaurants r
-- JOIN history h ON r.id = h.restaurant_id
-- WHERE h.user_id = 1
-- ORDER BY h.created_at DESC;

COMMIT;

-- ==================== DONE ====================
-- Database schema created successfully!
-- Next steps:
-- 1. Run this SQL file: mysql -u root -p < database/schema.sql
-- 2. Configure backend/config/database.js with your MySQL credentials
-- 3. Start building the backend API!
