# 🖥️ Dah Tech — Guaranteed Used PC Parts Marketplace

A full-stack e-commerce platform for buying guaranteed used PC components in Saudi Arabia.
Built on a **zero-inventory model** — products are sourced from partner shops, never held in stock.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC STOREFRONT                        │
│              React.js + Tailwind CSS (Port 3000)                │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JSON)
┌────────────────────────────▼────────────────────────────────────┐
│                    SPRING BOOT API (Port 8080)                  │
│  Auth(JWT) | Products | Orders | Shops | QR Code System        │
└────────────────────────────┬────────────────────────────────────┘
                             │ JPA/Hibernate
┌────────────────────────────▼────────────────────────────────────┐
│                     PostgreSQL Database                         │
│     admins | shops | products | orders                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 The QR Code Quick-Delete System

This is the **most critical feature**. Here's exactly how it works:

```
1. Admin adds product → Auto-generates UUID (qr_code_hash)
   
2. QR Code encodes URL:
   https://dahtech.com/api/products/quick-delete/{qr_code_hash}
   
3. Admin downloads QR PNG → Gives to partner shop → Attached to physical item
   
4. Walk-in customer buys the item → Cashier scans QR with phone camera
   
5. Phone browser opens the URL → API sets status = SOLD_LOCALLY
   
6. Mobile-friendly confirmation page shown:  ✅ "Sold Locally! — RTX 3070 removed from website"
   
7. Item instantly disappears from public storefront
```

**Why it's secure:**
- The `qr_code_hash` is a random UUID (128-bit), NOT the sequential DB primary key
- Even if someone discovers the endpoint, they can't enumerate product hashes
- No JWT required for this specific endpoint (cashier doesn't have a login)

---

## 🚀 Setup Guide

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

---

### 1. Database Setup

```bash
# Create database and user
psql -U postgres
CREATE DATABASE dahtech_db;
CREATE USER dahtech_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE dahtech_db TO dahtech_user;
\q

# Run schema (optional — JPA auto-creates on startup)
psql -U dahtech_user -d dahtech_db -f backend/src/main/resources/schema.sql
```

---

### 2. Backend (Spring Boot)

```bash
cd backend

# Configure environment variables (recommended for production)
export DB_USERNAME=dahtech_user
export DB_PASSWORD=your_strong_password
export JWT_SECRET=your_256bit_secret_key_here
export APP_BASE_URL=https://yourdomain.com

# Or edit application.properties directly for development

# Run
mvn spring-boot:run

# API is now live at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

**Default Admin Credentials (CHANGE IMMEDIATELY IN PRODUCTION):**
```
Username: admin
Password: DahTech@2024!
```

---

### 3. Frontend (React)

```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8080" > .env

npm start
# Storefront: http://localhost:3000
# Admin Dashboard: http://localhost:3000/admin
```

---

## 📡 API Reference

### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/products/public` | List available products with filters |
| `POST` | `/api/orders/public` | Place an order |
| `GET`  | `/api/shops/public` | List active partner shops |
| `GET`  | `/api/products/quick-delete/{hash}` | **QR scan → mark sold locally** |

### Admin Endpoints (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Get JWT token |
| `GET`  | `/api/products` | All products with QR codes |
| `POST` | `/api/products` | Create product (auto-generates QR) |
| `GET`  | `/api/products/{id}/qr` | Download QR code as PNG |
| `GET`  | `/api/products/stats` | Dashboard stats |
| `GET`  | `/api/orders` | All orders |
| `PATCH`| `/api/orders/{id}/status` | Update order status |
| `GET`  | `/api/shops` | All shops |
| `POST` | `/api/shops` | Create partner shop |

---

## 📁 Project Structure

```
dahtech/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/dahtech/
│       │   ├── DahtechApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java       # JWT + CORS + route permissions
│       │   │   └── DataInitializer.java      # Seeds admin & sample shops
│       │   ├── entity/
│       │   │   ├── Admin.java
│       │   │   ├── Shop.java
│       │   │   ├── Product.java              # qr_code_hash + status enum
│       │   │   └── Order.java
│       │   ├── repository/
│       │   │   ├── AdminRepository.java
│       │   │   ├── ProductRepository.java    # Custom JPQL queries
│       │   │   ├── ShopRepository.java
│       │   │   └── OrderRepository.java
│       │   ├── security/
│       │   │   ├── JwtUtil.java              # Token generation & validation
│       │   │   ├── JwtAuthFilter.java        # Intercepts every request
│       │   │   └── AdminUserDetailsService.java
│       │   ├── service/
│       │   │   ├── QrCodeService.java        # ⭐ Core QR generation (ZXing)
│       │   │   ├── ProductService.java       # markAsSoldLocally() method
│       │   │   └── OrderService.java
│       │   ├── controller/
│       │   │   ├── AuthController.java       # POST /api/auth/login
│       │   │   ├── ProductController.java    # Includes quick-delete endpoint
│       │   │   ├── OrderController.java
│       │   │   └── ShopController.java
│       │   └── dto/
│       │       ├── LoginRequest/Response.java
│       │       ├── ProductDto.java
│       │       └── OrderDto.java
│       └── resources/
│           ├── application.properties
│           └── schema.sql
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                          # Router + providers
        ├── context/
        │   ├── AuthContext.jsx             # JWT storage & login
        │   └── CartContext.jsx             # Shopping cart state
        ├── services/
        │   └── api.js                      # Axios instance + all API calls
        └── pages/
            ├── Storefront.jsx              # Public storefront with cart
            ├── AdminLogin.jsx              # JWT login form
            └── AdminDashboard.jsx          # Full admin UI with QR modals
```

---

## 🔒 Security Notes

1. **Change the default admin password** before going live
2. **Set `JWT_SECRET`** as a real environment variable (256+ bit random string)
3. **Configure `APP_BASE_URL`** to your production domain for correct QR code URLs
4. **CORS**: Update `app.cors.allowed-origins` to your production frontend URL only
5. The QR quick-delete endpoint is intentionally public — security comes from UUID entropy
6. All passwords are stored as BCrypt hashes (strength 12)

---

## 🌐 Production Deployment Checklist

- [ ] Change default admin password
- [ ] Set all environment variables (see `application.properties`)
- [ ] Configure a production PostgreSQL instance
- [ ] Build frontend: `npm run build` and serve with nginx
- [ ] Build backend: `mvn package -DskipTests` → run the JAR
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` (not `update`) in production
- [ ] Configure SSL/HTTPS on your domain
- [ ] Test QR code scanning on a real mobile device
