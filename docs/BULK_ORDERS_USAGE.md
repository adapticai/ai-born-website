# Bulk Orders with Auth - Usage Guide

## Quick Start

The bulk orders page now automatically detects if a user is authenticated and pre-fills their contact information.

## How It Works

### Page Load
1. When `/bulk-orders` is accessed, the page checks for an authenticated user
2. If user is signed in, their `name`, `email`, and `id` are retrieved
3. This data is passed to the form component

### Form Behavior

#### For Anonymous Users
```
- Name field: Empty (must be filled)
- Email field: Empty (must be filled)
- userId: Not sent with submission
```

#### For Authenticated Users
```
- Name field: Pre-filled from user.name (can be edited)
- Email field: Pre-filled from user.email (can be edited)
- userId: Automatically included in submission
```

## Implementation Details

### Server Component (Page)
```typescript
// src/app/bulk-orders/page.tsx
export default async function BulkOrdersPage() {
  // Fetch current user (null if not authenticated)
  const user = await getCurrentUser();

  return (
    <BookBulkOrdersWithAuth user={user} />
  );
}
```

### Client Component (Form)
```typescript
// src/components/forms/BulkOrderForm.tsx
interface BulkOrderFormProps {
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
}

export function BulkOrderForm({ user }: BulkOrderFormProps) {
  const form = useForm({
    defaultValues: {
      name: user?.name || '',     // Auto-fill from auth
      email: user?.email || '',   // Auto-fill from auth
      // ... other defaults
    },
  });

  const onSubmit = async (data) => {
    await submitBulkOrder({
      ...data,
      userId: user?.id,  // Link to account
    });
  };
}
```

## API Payload

### Unauthenticated Submission
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "quantity": 50,
  "format": "hardcover",
  "distributionStrategy": "multi-store",
  "timeline": "2-4-weeks",
  "region": "US",
  "message": "Looking to order for our sales team...",
  "customization": false
}
```

### Authenticated Submission
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "quantity": 50,
  "format": "hardcover",
  "distributionStrategy": "multi-store",
  "timeline": "2-4-weeks",
  "region": "US",
  "message": "Looking to order for our sales team...",
  "customization": false,
  "userId": "usr_abc123"  // ← Added for authenticated users
}
```

## Database Storage

The API endpoint stores the `userId` along with the bulk order inquiry:

```typescript
// Stored data structure
{
  ...sanitizedData,
  userId: data.userId,  // Optional - only present for authenticated users
  quantityBand: "50-99",
  timestamp: "2025-10-19T12:34:56.789Z",
  ip: "192.168.1.1"
}
```

## Console Logs

When a bulk order is submitted by an authenticated user, you'll see:

```
================================================================================
[BULK ORDER INQUIRY RECEIVED]
================================================================================
Timestamp: 2025-10-19T12:34:56.789Z
From IP: 192.168.1.1
User ID: usr_abc123 (Authenticated)  ← Shows user ID
Name: John Doe
Email: john@example.com
Company: Acme Corp
...
```

## Future Enhancements

With userId tracking in place, you can:

1. **User Dashboard**: Show bulk order history
```typescript
// Example: Fetch user's bulk orders
const orders = await prisma.bulkOrder.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
});
```

2. **Email Notifications**: Auto-link inquiries to user account
```typescript
// When processing inquiry, check if user exists
if (inquiry.userId) {
  const user = await prisma.user.findUnique({
    where: { id: inquiry.userId }
  });
  // Send personalized follow-up
}
```

3. **Analytics**: Track conversion by user type
```typescript
// Compare authenticated vs anonymous inquiries
const authRate = await analytics.getBulkOrdersByAuth();
```

## Testing

### Manual Testing Checklist

1. **Anonymous User Flow**
   - [ ] Visit `/bulk-orders` without signing in
   - [ ] Verify name and email fields are empty
   - [ ] Fill and submit form
   - [ ] Check API logs - should NOT show "User ID"

2. **Authenticated User Flow**
   - [ ] Sign in to the application
   - [ ] Visit `/bulk-orders`
   - [ ] Verify name and email are pre-filled
   - [ ] Submit form with pre-filled data
   - [ ] Check API logs - should show "User ID: xxx (Authenticated)"

3. **Edit Pre-filled Data**
   - [ ] Sign in and visit `/bulk-orders`
   - [ ] Change the pre-filled name
   - [ ] Change the pre-filled email
   - [ ] Submit form
   - [ ] Verify changed data is sent (not original)
   - [ ] Verify userId is still sent correctly

### Automated Testing

```typescript
// Example test
describe('Bulk Orders Auth Integration', () => {
  it('pre-fills data for authenticated users', async () => {
    const user = { id: '123', name: 'John', email: 'john@test.com' };
    const { getByLabelText } = render(<BulkOrderForm user={user} />);

    expect(getByLabelText('Name')).toHaveValue('John');
    expect(getByLabelText('Email')).toHaveValue('john@test.com');
  });

  it('sends userId with authenticated submissions', async () => {
    const user = { id: '123', name: 'John', email: 'john@test.com' };
    const submitSpy = jest.spyOn(api, 'submitBulkOrder');

    const { getByText } = render(<BulkOrderForm user={user} />);
    // ... fill form ...
    fireEvent.click(getByText('Submit Inquiry'));

    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ userId: '123' })
    );
  });
});
```

## Troubleshooting

### Issue: Fields not pre-filling
**Cause**: User data not being passed correctly
**Solution**: Check server component is calling `getCurrentUser()` and passing result to form

### Issue: userId not in submission
**Cause**: User prop not reaching form component
**Solution**: Verify props are passed through: Page → BookBulkOrdersWithAuth → BulkOrderForm

### Issue: Wrong user data displayed
**Cause**: Cached session data
**Solution**: Clear session and sign in again

## Security Considerations

1. **User can modify pre-filled data**: This is intentional - allows flexibility
2. **userId is validated**: API checks userId exists in database before linking
3. **No sensitive data exposed**: Only name and email are pre-filled (already known to user)
4. **Rate limiting still applies**: Authentication doesn't bypass spam protection

## Related Documentation

- `/docs/AUTH_QUICK_START.md` - Authentication setup
- `/BULK_ORDERS_AUTH_SUMMARY.md` - Implementation details
- `/docs/DATABASE.md` - Database schema for bulk orders
