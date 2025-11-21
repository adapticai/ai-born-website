# Authentication Analytics - Quick Start Guide

**Last Updated:** 2025-10-19

Quick reference for using authentication analytics in the AI-Born website.

---

## 📦 Import

```typescript
import {
  trackSignIn,
  trackSignUp,
  trackSignOut,
  trackAuthError,
  trackAuthButtonClick
} from '@/lib/auth-analytics';
```

---

## 🎯 Common Use Cases

### Track Sign-In Button Click

```typescript
const handleSignInClick = () => {
  // Track button click
  trackAuthButtonClick('sign_in', 'google', '/auth/signin');

  // Proceed with sign-in
  signIn('google');
};
```

### Track Successful Sign-In

```typescript
// In NextAuth event callback
trackSignIn('google', true, undefined, false);
```

### Track Failed Sign-In

```typescript
try {
  await signIn('email');
} catch (error) {
  trackSignIn('email', false, error);
  // or with error details
  trackAuthError(error, '/auth/signin', 'sign_in_failed', 'email');
}
```

### Track Sign-Up

```typescript
// After successful account creation
trackSignUp('github', true);
```

### Track Sign-Out

```typescript
const handleSignOut = async () => {
  const userId = session?.user?.id;
  const sessionStart = session?.loginTime;

  // Calculate session duration
  const duration = sessionStart
    ? Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000)
    : undefined;

  trackSignOut(userId, duration);
  await signOut();
};
```

---

## 📊 Event Types

### sign_in
```javascript
{
  event: 'sign_in',
  provider: 'google',
  success: true,
  is_new_user: false,
  timestamp: '2025-10-19T14:30:00.000Z'
}
```

### sign_up
```javascript
{
  event: 'sign_up',
  provider: 'email',
  success: true
}
```

### sign_out
```javascript
{
  event: 'sign_out',
  user_id: 'a1b2c3d4e5f6',  // hashed
  session_duration: 3600
}
```

### auth_error
```javascript
{
  event: 'auth_error',
  error_type: 'invalid_credentials',
  page: '/auth/signin',
  error_message: 'Invalid credentials',  // sanitized
  provider: 'email'
}
```

### auth_button_click
```javascript
{
  event: 'auth_button_click',
  action: 'sign_in',
  provider: 'google',
  page: '/signup'
}
```

---

## 🔐 Privacy Features

### Automatic User ID Hashing
```typescript
// Input: 'user-123456'
// Output: '7c4a8d09ca3762af' (first 16 chars of SHA-256)
```

### Error Message Sanitization
```typescript
// Input:  'Failed for user@example.com'
// Output: 'Failed for [email]'
```

Automatically removes:
- ✅ Email addresses
- ✅ SSNs
- ✅ Credit card numbers
- ✅ API tokens

---

## 🧪 Testing in Console

```javascript
// Open browser console
window.dataLayer

// Should see events like:
[
  {
    event: 'sign_in',
    provider: 'google',
    success: true,
    book: 'ai-born',
    timestamp: '2025-10-19T14:30:00.000Z'
  }
]
```

---

## 📈 GTM Setup

### Create Triggers

**Sign-In Success**
```
Type: Custom Event
Event Name: sign_in
Condition: success equals true
```

**Sign-Up Conversion**
```
Type: Custom Event
Event Name: sign_up
```

**Auth Errors**
```
Type: Custom Event
Event Name: auth_error
```

### Create Variables

**Provider**
```javascript
{{provider}}
```

**Is New User**
```javascript
{{is_new_user}}
```

**Error Type**
```javascript
{{error_type}}
```

---

## ⚠️ Common Mistakes

### ❌ Don't Track PII
```typescript
// WRONG - Don't do this
trackEvent({
  email: user.email  // ❌ PII
});

// RIGHT
trackSignIn('google', true);  // ✅ No PII
```

### ❌ Don't Track Before User Action
```typescript
// WRONG - Don't track on render
useEffect(() => {
  trackAuthButtonClick('sign_in', 'google', '/');  // ❌
}, []);

// RIGHT - Track on actual click
onClick={() => {
  trackAuthButtonClick('sign_in', 'google', '/');  // ✅
  signIn('google');
}}
```

### ❌ Don't Forget Error Handling
```typescript
// WRONG - No error tracking
await signIn('google');

// RIGHT
try {
  await signIn('google');
} catch (error) {
  trackAuthError(error, pathname);  // ✅
}
```

---

## 🔍 Debugging

### Check Events in Console
```javascript
// See all events
console.log(window.dataLayer);

// Filter auth events
window.dataLayer.filter(e =>
  ['sign_in', 'sign_up', 'sign_out', 'auth_error'].includes(e.event)
);
```

### Enable Debug Logging
Events automatically log in development:
```
[Auth Analytics] Sign In: { provider: 'google', success: true, isNewUser: false }
```

---

## 📚 Full Documentation

See [AUTH_ANALYTICS_IMPLEMENTATION.md](./AUTH_ANALYTICS_IMPLEMENTATION.md) for complete details.

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Events not appearing | Check GTM Preview Mode is on |
| User ID showing plaintext | Verify `hashUserId()` is called |
| Error message has email | Check `sanitizeErrorMessage()` |
| Wrong provider tracked | Pass correct provider string |
| Events firing twice | Check for duplicate event listeners |

---

## ✅ Checklist

Before deploying:
- [ ] All sign-in buttons have `trackAuthButtonClick()`
- [ ] Auth errors call `trackAuthError()`
- [ ] Sign-up flow tracks `trackSignUp()`
- [ ] Sign-out tracks `trackSignOut()`
- [ ] GTM triggers are configured
- [ ] Test in GTM Preview Mode
- [ ] No PII being tracked
- [ ] Error messages are sanitized

---

**Need Help?** See full implementation docs or contact the dev team.
