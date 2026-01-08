# Password Reset Troubleshooting Guide

If you're getting "Failed to request password reset" error, follow these steps:

## 1. Check if Backend Server is Running

Make sure your backend server is running:

```bash
cd online-grocery-store-system-backend/backend/server
npm run dev
```

The server should be running on `http://localhost:3000`

## 2. Check Backend Health

Test if the backend is accessible:

```bash
# In your browser or using curl
http://localhost:3000/api/health
```

You should see: `{"status":"ok"}`

## 3. Check Environment Variables

Make sure your `.env` file in `online-grocery-store-system-backend/backend/server/` has:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:5175
```

## 4. Check Frontend Environment

Make sure your frontend `.env` file in `online-grocery-store-frontend/` has:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 5. Check CORS Settings

The backend should allow requests from your frontend origin. Check `ALLOWED_ORIGINS` in backend `.env`.

## 6. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for any error messages
- **Network tab**: Check if the request to `/api/auth/forgot-password` is being made and what the response is

## 7. Common Error Messages

### "Cannot connect to server"
- Backend server is not running
- Wrong API URL in frontend `.env`
- Firewall blocking the connection

### "Network Error"
- Backend server is not running
- CORS issue - check `ALLOWED_ORIGINS`

### "Email is required"
- Make sure you entered an email address

### "User not found" (in response)
- This is normal - the system doesn't reveal if an email exists for security
- The response will still say success even if user doesn't exist

## 8. Test the Endpoint Directly

You can test the password reset endpoint directly using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Password reset token generated",
  "data": {
    "resetToken": "jwt-token-here",
    "email": "your-email@example.com"
  }
}
```

## 9. Verify User Exists

Make sure you have created a user first:

```bash
cd online-grocery-store-system-backend/backend/server
npm run create-admin
```

Or register a user through the API or frontend.

## 10. Check MongoDB Connection

Make sure MongoDB is connected. Check backend console for connection messages.

## Still Having Issues?

1. Check backend console logs for errors
2. Check browser console for detailed error messages
3. Verify all environment variables are set correctly
4. Make sure both frontend and backend are running
5. Try restarting both servers

