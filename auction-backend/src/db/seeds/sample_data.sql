-- Sample Data for Live Auction System

-- Insert Categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('Electronics', 'electronics', 'Computers, phones, cameras, and more', '📱', 1),
('Fashion', 'fashion', 'Clothing, shoes, and accessories', '👗', 2),
('Collectibles', 'collectibles', 'Coins, stamps, trading cards, memorabilia', '🎴', 3),
('Art', 'art', 'Paintings, sculptures, and fine art', '🎨', 4),
('Jewelry', 'jewelry', 'Watches, rings, necklaces, and gemstones', '💎', 5),
('Vehicles', 'vehicles', 'Cars, motorcycles, and parts', '🚗', 6),
('Home & Garden', 'home-garden', 'Furniture, decor, and outdoor items', '🏠', 7),
('Sports', 'sports', 'Equipment, memorabilia, and apparel', '⚽', 8);

-- Insert Subcategories
INSERT INTO categories (parent_id, name, slug, description, display_order) VALUES
(1, 'Cameras', 'electronics-cameras', 'Digital cameras, film cameras, and accessories', 1),
(1, 'Computers', 'electronics-computers', 'Laptops, desktops, and components', 2),
(1, 'Phones', 'electronics-phones', 'Smartphones and accessories', 3),
(1, 'Audio', 'electronics-audio', 'Headphones, speakers, and equipment', 4),
(2, 'Mens Fashion', 'fashion-mens', 'Mens clothing and accessories', 1),
(2, 'Womens Fashion', 'fashion-womens', 'Womens clothing and accessories', 2),
(2, 'Shoes', 'fashion-shoes', 'Footwear for all', 3),
(2, 'Handbags', 'fashion-handbags', 'Bags and luggage', 4),
(5, 'Watches', 'jewelry-watches', 'Wristwatches and pocket watches', 1),
(5, 'Rings', 'jewelry-rings', 'Engagement, wedding, and fashion rings', 2);

-- Insert Demo Users (password: password123 - bcrypt hash)
INSERT INTO users (username, email, password_hash, full_name, location, email_verified, reputation_score) VALUES
('johndoe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.5qVvxyp0lGb6.', 'John Doe', 'New York, USA', TRUE, 4.90),
('camera_collector', 'camera@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.5qVvxyp0lGb6.', 'Camera Collector', 'Los Angeles, USA', TRUE, 4.95),
('luxury_watches', 'watches@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.5qVvxyp0lGb6.', 'Luxury Watches', 'Miami, USA', TRUE, 5.00),
('tech_deals', 'tech@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4a.5qVvxyp0lGb6.', 'Tech Deals', 'San Francisco, USA', TRUE, 4.80);

-- Insert Sample Auctions
INSERT INTO auctions (seller_id, title, description, category_id, condition_type, starting_price, reserve_price, current_bid, buy_now_price, bid_increment, bid_count, view_count, watch_count, start_time, end_time, status, free_shipping, location) VALUES
(2, 'Vintage Canon AE-1 Camera with Original Leather Case', 'Beautiful vintage Canon AE-1 in excellent condition. Includes original leather case and 50mm f/1.8 lens. Light meter fully functional, all speeds accurate.', 1, 'used_excellent', 500.00, 1000.00, 1250.00, 2500.00, 25.00, 45, 234, 42, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 'active', FALSE, 'New York, USA'),
(3, 'Rolex Submariner Watch 1985 Vintage', 'Authentic Rolex Submariner Date from 1985. Reference 16800. Full service history available. Box and papers included.', 5, 'used_excellent', 5000.00, 8000.00, 8500.00, 12000.00, 100.00, 32, 567, 89, NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY), 'active', TRUE, 'Miami, USA'),
(4, 'MacBook Pro M3 Max 16" Space Black', 'Brand new MacBook Pro with M3 Max chip. 36GB RAM, 1TB SSD. Sealed in box with Apple warranty.', 1, 'new', 2000.00, NULL, 2450.00, 3299.00, 50.00, 19, 123, 34, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 'active', TRUE, 'San Francisco, USA'),
(2, 'Vintage Leica M6 Film Camera', 'Classic Leica M6 rangefinder camera in silver. Recently CLA serviced. Superb condition with minor wear.', 1, 'used_excellent', 1500.00, 2000.00, 2200.00, 3000.00, 50.00, 28, 189, 56, NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY), 'active', FALSE, 'Los Angeles, USA');

-- Insert Auction Images
INSERT INTO auction_images (auction_id, image_url, thumbnail_url, display_order, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200', 0, TRUE),
(1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200', 1, FALSE),
(2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200', 0, TRUE),
(3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200', 0, TRUE),
(4, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200', 0, TRUE);

-- Insert Sample Bids
INSERT INTO bids (auction_id, bidder_id, bid_amount, is_winning_bid, bid_status, bid_time) VALUES
(1, 1, 1250.00, TRUE, 'active', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 4, 1225.00, FALSE, 'outbid', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1, 1, 1200.00, FALSE, 'outbid', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, 1, 8200.00, FALSE, 'outbid', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 4, 8500.00, TRUE, 'active', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(3, 1, 2450.00, TRUE, 'active', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- Insert Sample Watchlist
INSERT INTO watchlist (user_id, auction_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(4, 1), (4, 2);

-- Insert Sample Notifications
INSERT INTO notifications (user_id, notification_type, title, message, link, is_read) VALUES
(1, 'outbid', 'You''ve been outbid!', 'Someone outbid you on Rolex Submariner Watch 1985', '/auction/2', FALSE),
(1, 'bid_placed', 'Bid placed successfully', 'Your bid of $1,250 on Vintage Canon AE-1 Camera was placed', '/auction/1', TRUE),
(4, 'auction_won', 'Congratulations!', 'You won the auction for Vintage Omega Seamaster', '/auction/5', FALSE);
