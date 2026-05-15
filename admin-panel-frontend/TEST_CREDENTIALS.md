# Test Credentials

## 🧪 Development Testing

For testing and development purposes, you can use the following credentials to bypass authentication:

### Test Admin Account

```
Email: test@admin.com
Password: test123
```

### Features

- **Full Admin Access**: The test user has all permissions (`*`)
- **No Backend Required**: Authentication is bypassed completely
- **Instant Login**: No API calls are made for test credentials
- **Test Tenant**: Includes a test tenant for multi-tenant features

### User Details

```json
{
  "id": "test-user-001",
  "email": "test@admin.com",
  "name": "Test Admin",
  "role": "admin",
  "permissions": ["*"],
  "tenants": [
    {
      "id": "test-tenant-001",
      "name": "Test Tenant",
      "slug": "test-tenant"
    }
  ]
}
```

## ⚠️ Important Security Notes

1. **Development Only**: These credentials are hardcoded in `src/lib/auth/auth-service.ts`
2. **Remove in Production**: This bypass should be disabled or removed before deploying to production
3. **Console Warning**: When using test credentials, a warning message appears in the browser console
4. **No Real Authentication**: The test tokens are fake and won't work with a real backend

## How It Works

The auth service checks if the provided credentials match the test credentials before making any API calls:

```typescript
if (email === 'test@admin.com' && password === 'test123') {
  // Bypass authentication and return test user
  return {
    token: 'test-jwt-token-...',
    refreshToken: 'test-refresh-token-...',
    user: TEST_USER,
    requiresOtp: false,
  };
}
```

## Disabling Test Credentials

To disable test credentials for production:

1. Remove or comment out the test credential check in `src/lib/auth/auth-service.ts`
2. Or add an environment variable check:

```typescript
if (import.meta.env.DEV && email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
  // Only allow in development mode
}
```

## Usage

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Enter the test credentials
4. You'll be logged in immediately without backend authentication
5. Check the browser console for the test mode warning

---

**Last Updated**: May 2026
