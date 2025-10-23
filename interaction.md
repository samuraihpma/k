# Mood Tracker Journal - Interaction Design

## Core User Journey

### Authentication Flow
- **Login Page**: Email/password login with OAuth options (Google, GitHub)
- **Signup Page**: New user registration with email verification
- **Protected Routes**: All main app features require authentication

### Mood Tracking Interface (Index Page)
- **Daily Mood Selector**: Visual mood scale (1-10) with emoji representations
- **Quick Log Form**: 
  - Mood rating slider with color-coded feedback
  - Text area for journal notes (max 500 characters)
  - Photo upload button for mood-related images
  - Tags for mood categories (work, relationships, health, etc.)
- **Today's Summary**: Shows if mood already logged today with edit option
- **Recent Entries**: Last 7 days of mood entries in card format

### Journal Entries Page
- **Entry Gallery**: Grid layout of all user's mood entries
- **Entry Cards**: Each showing date, mood rating, preview text, and thumbnail
- **Filter Options**: By date range, mood rating, tags
- **Search Functionality**: Text search through journal notes
- **Entry Details**: Click to expand full entry with photo and edit options

### Analytics Dashboard
- **Weekly Mood Chart**: Line graph showing mood trends over 7 days
- **Monthly Overview**: Calendar heatmap with mood color coding
- **Mood Statistics**: Average mood, best/worst days, streak tracking
- **Insights Panel**: AI-generated insights about mood patterns
- **Export Options**: Download mood data as PDF or CSV

## Interactive Components

### 1. Mood Rating Slider
- Custom slider with gradient background (red to green)
- Real-time emoji and color feedback
- Smooth animation transitions
- Click or drag to set rating

### 2. Photo Upload Zone
- Drag-and-drop area for image uploads
- Preview thumbnail before saving
- Image compression and optimization
- Multiple format support (JPEG, PNG, WebP)

### 3. Entry Filter System
- Multi-select dropdown for mood ranges
- Date picker for custom date ranges
- Tag cloud for quick filtering
- Real-time results update

### 4. Mood Analytics Visualization
- Interactive charts using ECharts.js
- Hover tooltips with detailed information
- Zoom and pan functionality for time series
- Color-coded mood categories

## Appwrite Integration Points

### Authentication
- Email/password signup and login
- OAuth integration for Google and GitHub
- Session management and token refresh
- User profile management

### Database Operations
- Mood entries CRUD operations
- User-specific data isolation
- Real-time subscriptions for updates
- Query optimization for large datasets

### Storage
- Photo upload and management
- Image compression and resizing
- Secure file access with permissions
- CDN integration for fast loading

### Functions
- Weekly mood report generation
- Automated insights calculation
- Data backup and export functions
- Email notifications for streaks

## User Experience Flow

1. **First Visit**: Landing page with app introduction and signup/login options
2. **New User**: Registration → Email verification → Tutorial walkthrough
3. **Daily Use**: Quick mood logging → Optional photo/note addition → View recent entries
4. **Reflection**: Browse past entries → View analytics → Export data
5. **Long-term**: Track patterns → Set goals → Celebrate milestones

## Responsive Design Considerations

- Mobile-first approach for on-the-go mood logging
- Touch-friendly interface elements
- Optimized photo upload for mobile cameras
- Swipe gestures for navigation
- Offline capability with sync when online