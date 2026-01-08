# Authentication Setup Guide

This guide explains how to set up and use the email/password authentication system for the inventory management system.

## Backend Setup

### 1. Environment Variables

Make sure your `.env` file in `online-grocery-store-system-backend/backend/server/` includes:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
ALLOWED_ORIGINS=http://localhost:5175
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

### 2. Create First Admin User

Run the following command to create your first admin user:

```bash
cd online-grocery-store-system-backend/backend/server
npm run create-admin
```

Or with custom email/password:

```bash
npm run create-admin your-email@example.com your-password
```

Default credentials (if not specified):
- Email: `admin@inventory.com`
- Password: `admin123`

**⚠️ Important:** Change the password after first login!

### 3. Register New Users

You can register new users through the API:

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Or create them programmatically using the script.

## Frontend Setup

### 1. Environment Variables

Make sure your `.env` file in `online-grocery-store-frontend/` includes:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Login

Navigate to `/login` and use your registered email and password to access the inventory system.

## Protected Routes

The following routes require authentication:

### Backend Routes (Protected):
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/stats/inventory` - Get inventory stats
- `GET /api/products/total-stock` - Get total stock
- `GET /api/products/pdf/generate` - Generate PDF
- All `/api/suppliers/*` routes - Supplier management

### Public Routes (No Authentication):
- `GET /api/products` - Get all products (for storefront)
- `GET /api/products/:id` - Get product by ID (for storefront)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Frontend Routes (Protected):
- `/home` - Dashboard
- `/home/products` - Product management
- `/home/newProduct` - Add products
- `/home/suppliers` - Supplier management
- `/home/profile` - User profile

## API Usage

### Login

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "role": "inventory_manager"
    },
    "token": "jwt-token-here"
  }
}
```

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```javascript
Authorization: Bearer <your-jwt-token>
```

The frontend automatically handles this through the `api` utility in `src/utils/api.js`.

## Security Notes

1. **JWT Secret**: Always use a strong, random secret in production
2. **Password Hashing**: Passwords are automatically hashed using bcrypt
3. **Token Expiration**: Tokens expire after 7 days
4. **HTTPS**: Use HTTPS in production to protect tokens in transit
5. **Password Requirements**: Minimum 6 characters (can be customized in user model)

## Troubleshooting

### "No token provided" Error
- Make sure you're logged in
- Check that the token is stored in localStorage
- Verify the Authorization header is being sent

### "Invalid token" Error
- Token may have expired (7 days)
- Try logging in again
- Check that JWT_SECRET matches between token creation and verification

### "User not found" Error
- Make sure the user exists in the database
- Verify email is correct (case-insensitive)

## Next Steps

1. Create your first admin user using the script
2. Log in through the frontend
3. Start managing your inventory!

