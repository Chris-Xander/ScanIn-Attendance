# User Display System Guide

This guide explains how to implement and use the user display system across your React components.

## Overview

The user display system provides a consistent way to show user information (name, avatar, role) across all components using the `useAuth()` context.

## Key Features

1. **Enhanced AuthContext** - Includes helper functions for user profile management
2. **Reusable UserDisplay Component** - Consistent user information display
3. **Profile Update Functionality** - Users can update their display names
4. **Fallback Handling** - Graceful fallbacks when user data is missing

## Implementation

### 1. Enhanced AuthContext Functions

The `useAuth()` hook now provides these additional functions:

```javascript
const { 
  currentUser, 
  getUserDisplayName, 
  getUserRole, 
  updateUserProfile 
} = useAuth();
```

- `getUserDisplayName()` - Returns the user's display name with fallbacks
- `getUserRole()` - Returns the user's role (admin/member)
- `updateUserProfile(updates)` - Updates the user's profile information

### 2. UserDisplay Component

A reusable component for displaying user information:

```javascript
import UserDisplay from '../components/UserDisplay';

// Basic usage
<UserDisplay />

// With custom styling
<UserDisplay className="compact" />

// Show role information
<UserDisplay showRole={true} />

// Large display for profile sections
<UserDisplay className="large" showRole={true} />
```

### 3. Usage Examples

#### In Admin Page Header
```javascript
import UserDisplay from '../components/UserDisplay';

// In your header
<div className="AdminUser">
    <UserDisplay className="compact" />
</div>
```

#### In Member Profile Section
```javascript
import UserDisplay from '../components/UserDisplay';

// In profile details
<div className="profile-details-card">
    <UserDisplay className="large" showRole={true} />
    <div className="profile-details-row">
        <span>Email</span>
        <span>{currentUser?.email}</span>
    </div>
</div>
```

#### Updating User Profile
```javascript
const { updateUserProfile } = useAuth();

const handleSaveSettings = async () => {
    try {
        await updateUserProfile({ displayName: newName });
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
    }
};
```

## CSS Classes

The UserDisplay component supports these CSS classes:

- `compact` - Smaller avatar and text for headers
- `large` - Larger avatar and text for profile sections
- Default - Standard size for general use

## Fallback Behavior

The system provides intelligent fallbacks:

1. **Display Name**: `currentUser.displayName` → `email.split('@')[0]` → `'User'`
2. **Avatar**: `currentUser.photoURL` → Default avatar image
3. **Role**: `currentUser.photoURL` (stored role) → `'member'`

## Best Practices

1. **Use UserDisplay Component** - For consistent styling across pages
2. **Handle Loading States** - The AuthContext handles loading automatically
3. **Error Handling** - Always wrap profile updates in try-catch blocks
4. **Accessibility** - The component includes proper alt text for images

## Adding to New Components

To add user display to a new component:

1. Import the necessary functions:
```javascript
import { useAuth } from '../contexts/AuthContext';
import UserDisplay from '../components/UserDisplay';
```

2. Use in your component:
```javascript
const { currentUser, getUserDisplayName } = useAuth();

// For simple text display
<span>Welcome, {getUserDisplayName()}!</span>

// For full user display
<UserDisplay showRole={true} />
```

This system ensures consistent user information display across your entire application while providing flexibility for different use cases. 