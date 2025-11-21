# Settings Page

A comprehensive settings page for the AI-Born landing page, built with Next.js App Router and shadcn/ui components.

## Overview

The settings page provides a tabbed interface for managing user account settings, security, preferences, and notifications. It follows the same design patterns as the account page for consistency.

## File Structure

```
src/app/settings/
├── page.tsx              # Server component - route protection & layout
├── SettingsContent.tsx   # Client component - tabs interface
└── README.md            # This file

src/components/settings/
├── ProfileSettings.tsx       # Profile information tab
├── SecuritySettings.tsx      # Security & auth tab
├── PreferencesSettings.tsx   # User preferences tab
└── NotificationsSettings.tsx # Notification preferences tab
```

## Architecture

### Server Component (`page.tsx`)
- **Authentication**: Uses `requireAuth()` to protect the route
- **Layout**: Includes BookNavbarWrapper and BookFooter
- **Metadata**: Sets page title and description for SEO
- **User Context**: Passes authenticated user to client components

### Client Component (`SettingsContent.tsx`)
- **Tabs**: Uses shadcn/ui Tabs component for navigation
- **State Management**: Tracks active tab with useState
- **Responsive Design**: Grid layout on mobile, flex on desktop
- **Brand Styling**: Custom tab styling with brand colors

### Tab Components
Each tab is a separate component in `/src/components/settings/`:

1. **ProfileSettings**: User profile information (name, email, bio, avatar)
2. **SecuritySettings**: Password, 2FA, active sessions
3. **PreferencesSettings**: Theme, language, display preferences
4. **NotificationsSettings**: Email notifications, marketing preferences

## Usage

### Accessing the Page
Navigate to `/settings` - authentication required.

### Component Implementation
Each tab component receives the authenticated user:

```tsx
interface TabSettingsProps {
  user: User;
}

export function TabSettings({ user }: TabSettingsProps) {
  // Implementation
}
```

## Styling

### Tab Navigation
- **Active State**: Brand cyan border and background tint
- **Hover State**: Subtle gray background
- **Responsive**: 2-column grid on mobile, horizontal flex on desktop
- **Dark Mode**: Full dark mode support with appropriate contrast

### Content Cards
- **Container**: Rounded 2xl with shadow-lg
- **Padding**: 6 (mobile) / 8 (desktop)
- **Borders**: Gray 200 (light) / Gray 800 (dark)
- **Background**: White (light) / Gray 900 (dark)

## Brand Integration

Following CLAUDE.md specifications:

### Colors
- **Brand Cyan** (`#00d9ff`): Active tab state, primary accents
- **Brand Obsidian** (`#0a0a0f`): Dark mode backgrounds
- **Brand Porcelain** (`#fafafa`): Light mode text
- **Brand Ember** (`#ff9f40`): Secondary accents (if needed)

### Typography
- **Headlines**: Outfit font, 600-800 weights
- **Body**: Inter font, 400-600 weights
- **Hierarchy**: h1 (page title) → h2 (section titles)

## Accessibility

### WCAG 2.2 AA Compliance
- [x] Semantic HTML5 structure
- [x] Proper heading hierarchy (h1 → h2)
- [x] Keyboard navigation (Tab component handles this)
- [x] Focus states visible on all interactive elements
- [x] Color contrast ≥4.5:1 for body text
- [x] Screen reader friendly labels
- [x] ARIA attributes via Radix UI primitives

### Keyboard Navigation
- **Tab**: Navigate between tab triggers
- **Enter/Space**: Activate tab
- **Arrow Keys**: Navigate tabs (handled by Radix UI)

## Implementation Status

### Completed ✓
- [x] Route protection with requireAuth()
- [x] Page structure and layout
- [x] Tab navigation interface
- [x] Placeholder components for all tabs
- [x] Responsive design
- [x] Dark mode support
- [x] Brand color integration
- [x] Accessibility features

### To Be Implemented
- [ ] ProfileSettings component content
- [ ] SecuritySettings component content
- [ ] PreferencesSettings component content
- [ ] NotificationsSettings component content
- [ ] API endpoints for settings updates
- [ ] Form validation with Zod
- [ ] Success/error toast notifications

## Integration with Other Pages

### Account Page
- Similar layout and design patterns
- Shares BookNavbarWrapper and BookFooter
- Consistent authentication flow
- Can link between pages for related settings

### Authentication
- Uses same auth system (`@/lib/auth`)
- Redirects to `/auth/signin` if not authenticated
- Preserves callback URL for post-login redirect

## Future Enhancements

### Planned Features
1. **Profile Picture Upload**: Avatar selection and upload
2. **Two-Factor Authentication**: TOTP setup and management
3. **Session Management**: View and revoke active sessions
4. **Email Preferences**: Granular notification controls
5. **Theme Toggle**: Light/dark/system preference
6. **Export Data**: GDPR-compliant data export
7. **Account Deletion**: Self-service account closure

### Analytics Events
```javascript
// Settings page view
{
  event: 'settings_page_view',
  user_id: string
}

// Tab change
{
  event: 'settings_tab_change',
  tab_id: 'profile' | 'security' | 'preferences' | 'notifications'
}

// Settings updated
{
  event: 'settings_updated',
  setting_type: string,
  tab: string
}
```

## Development Guidelines

### Adding New Tabs
1. Create component in `/src/components/settings/`
2. Import in `SettingsContent.tsx`
3. Add TabsTrigger and TabsContent
4. Update this README

### Component Standards
- Use TypeScript for all components
- Include JSDoc comments
- Follow existing naming conventions
- Maintain consistent styling
- Ensure accessibility compliance

### Testing Checklist
- [ ] Authentication redirects work correctly
- [ ] All tabs load without errors
- [ ] Responsive design works on all breakpoints
- [ ] Dark mode toggles properly
- [ ] Keyboard navigation functions
- [ ] Screen reader announces changes
- [ ] Forms validate correctly (when implemented)
- [ ] API calls handle errors gracefully (when implemented)

## Related Documentation

- [CLAUDE.md](/Users/iroselli/ai-born-website/CLAUDE.md) - Technical requirements
- [AUTH_IMPLEMENTATION_SUMMARY.md](/Users/iroselli/ai-born-website/AUTH_IMPLEMENTATION_SUMMARY.md) - Auth system
- [Account Page](/Users/iroselli/ai-born-website/src/app/account/page.tsx) - Similar protected page

## Support

For questions or issues:
1. Check CLAUDE.md for specifications
2. Review existing components for patterns
3. Ensure auth system is configured
4. Test in development environment

---

**Last Updated**: October 19, 2025
**Status**: Structure complete, awaiting tab component implementation
