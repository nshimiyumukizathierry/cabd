# CarBD Platform - EER Diagram Creation Guide

## 🎯 **DATABASE ARCHITECTURE OVERVIEW**

The CarBD platform uses a **6-entity relational database** designed for optimal performance and scalability.

### **📊 CORE ENTITIES**

#### **1. USERS (Supabase Auth)**
- **Primary Key**: `id` (UUID)
- **Attributes**:
  - `id` (UUID, PK) - Unique user identifier
  - `email` (VARCHAR, UNIQUE) - User email address
  - `encrypted_password` (TEXT) - Hashed password
  - `email_confirmed_at` (TIMESTAMP) - Email verification time
  - `created_at` (TIMESTAMP) - Account creation time
  - `updated_at` (TIMESTAMP) - Last update time

#### **2. PROFILES**
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` → USERS.id
- **Attributes**:
  - `id` (UUID, PK) - Profile identifier
  - `user_id` (UUID, FK) - Reference to auth user
  - `email` (VARCHAR) - User email (denormalized)
  - `role` (ENUM: 'user', 'admin') - User role
  - `full_name` (VARCHAR, NULLABLE) - User's full name
  - `avatar_url` (TEXT, NULLABLE) - Profile picture URL
  - `phone` (VARCHAR, NULLABLE) - Phone number
  - `created_at` (TIMESTAMP) - Profile creation time

#### **3. CARS**
- **Primary Key**: `id` (UUID)
- **Attributes**:
  - `id` (UUID, PK) - Car identifier
  - `make` (VARCHAR, NOT NULL) - Car manufacturer
  - `model` (VARCHAR, NOT NULL) - Car model
  - `year` (INTEGER, NOT NULL) - Manufacturing year
  - `price` (DECIMAL(10,2), NOT NULL) - Car price
  - `stock_quantity` (INTEGER, DEFAULT 1) - Available quantity
  - `image_url` (TEXT, NULLABLE) - Car image URL
  - `description` (TEXT, NULLABLE) - Car description
  - `created_at` (TIMESTAMP) - Record creation time
  - `updated_at` (TIMESTAMP) - Last update time

#### **4. FOUNDERS**
- **Primary Key**: `id` (UUID)
- **Attributes**:
  - `id` (UUID, PK) - Founder identifier
  - `name` (VARCHAR, NOT NULL) - Founder's name
  - `title` (VARCHAR, NOT NULL) - Job title/position
  - `bio` (TEXT, NULLABLE) - Biography
  - `image_url` (TEXT, NULLABLE) - Profile image URL
  - `linkedin_url` (TEXT, NULLABLE) - LinkedIn profile
  - `twitter_url` (TEXT, NULLABLE) - Twitter profile
  - `created_at` (TIMESTAMP) - Record creation time
  - `updated_at` (TIMESTAMP) - Last update time

#### **5. CART_ITEMS**
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `user_id` → USERS.id
  - `car_id` → CARS.id
- **Attributes**:
  - `id` (UUID, PK) - Cart item identifier
  - `user_id` (UUID, FK) - Reference to user
  - `car_id` (UUID, FK) - Reference to car
  - `quantity` (INTEGER, DEFAULT 1) - Item quantity
  - `created_at` (TIMESTAMP) - Added to cart time

#### **6. FAVORITES**
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `user_id` → USERS.id
  - `car_id` → CARS.id
- **Attributes**:
  - `id` (UUID, PK) - Favorite identifier
  - `user_id` (UUID, FK) - Reference to user
  - `car_id` (UUID, FK) - Reference to car
  - `created_at` (TIMESTAMP) - Favorited time

### **🔗 RELATIONSHIPS**

#### **1. USERS ↔ PROFILES (1:1)**
- **Cardinality**: One-to-One
- **Relationship**: Each user has exactly one profile
- **Foreign Key**: PROFILES.user_id → USERS.id
- **Cascade**: ON DELETE CASCADE

#### **2. USERS ↔ CART_ITEMS (1:M)**
- **Cardinality**: One-to-Many
- **Relationship**: Each user can have multiple cart items
- **Foreign Key**: CART_ITEMS.user_id → USERS.id
- **Cascade**: ON DELETE CASCADE

#### **3. USERS ↔ FAVORITES (1:M)**
- **Cardinality**: One-to-Many
- **Relationship**: Each user can have multiple favorites
- **Foreign Key**: FAVORITES.user_id → USERS.id
- **Cascade**: ON DELETE CASCADE

#### **4. CARS ↔ CART_ITEMS (1:M)**
- **Cardinality**: One-to-Many
- **Relationship**: Each car can be in multiple carts
- **Foreign Key**: CART_ITEMS.car_id → CARS.id
- **Cascade**: ON DELETE CASCADE

#### **5. CARS ↔ FAVORITES (1:M)**
- **Cardinality**: One-to-Many
- **Relationship**: Each car can be favorited by multiple users
- **Foreign Key**: FAVORITES.car_id → CARS.id
- **Cascade**: ON DELETE CASCADE

### **🛡️ SECURITY FEATURES**

#### **Row Level Security (RLS)**
- **Enabled on all tables** except USERS (managed by Supabase Auth)
- **Policies**:
  - `profiles_policy`: Users can only access their own profile
  - `cars_policy`: All authenticated users can read cars
  - `founders_policy`: Public read access
  - `cart_items_policy`: Users can only access their own cart
  - `favorites_policy`: Users can only access their own favorites

#### **Storage Integration**
- **Bucket**: `cars` (public read access)
- **Policies**: Authenticated users can upload/update
- **File Types**: Images (JPG, PNG, WebP)
- **Max Size**: 5MB per file

### **⚡ PERFORMANCE OPTIMIZATIONS**

#### **Indexes**
\`\`\`sql
-- Primary indexes (automatic)
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_car_id ON cart_items(car_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_car_id ON favorites(car_id);

-- Search indexes
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_price ON cars(price);
\`\`\`

#### **Triggers**
\`\`\`sql
-- Auto-update timestamps
CREATE TRIGGER update_cars_updated_at 
  BEFORE UPDATE ON cars 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE TRIGGER create_profile_on_signup 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
\`\`\`

### **📈 BUSINESS RULES**

1. **User Management**:
   - Every user must have a profile
   - Only admins can manage cars and founders
   - Users can only access their own cart and favorites

2. **Inventory Management**:
   - Cars must have positive stock quantity
   - Price must be greater than 0
   - Year must be between 1900 and current year + 1

3. **Cart Logic**:
   - Users can add same car multiple times (quantity)
   - Cart items are automatically removed when car is deleted
   - Maximum quantity per item: 10

4. **Favorites System**:
   - Users can favorite/unfavorite cars
   - Duplicate favorites are prevented by unique constraint
   - Favorites are removed when car is deleted

### **🔄 DATA FLOW**

1. **User Registration** → Creates USERS record → Triggers PROFILES creation
2. **Car Browsing** → Reads from CARS table → Displays with images from storage
3. **Add to Cart** → Creates CART_ITEMS record → Links user and car
4. **Add to Favorites** → Creates FAVORITES record → Links user and car
5. **Admin Actions** → CRUD operations on CARS and FOUNDERS tables

This architecture ensures **data integrity**, **performance**, and **security** while supporting all CarBD platform features.
\`\`\`

```text file="EER_DIAGRAM_ASCII.txt"
# CarBD Platform - ASCII EER Diagram
