# Live Auction System - Complete UI Implementation Prompt

Build a modern, responsive, and real-time auction platform UI using HTML5, CSS3, and vanilla JavaScript with WebSocket integration. Create a professional, user-friendly interface optimized for both desktop and mobile devices.

---

## 1. LANDING PAGE / HOME MODULE

### Purpose
First impression page showcasing featured auctions, categories, and platform value proposition.

### Components to Build

**Header Section:**
- Sticky navigation bar with logo, search bar, category dropdown, and user menu
- "Sign In" and "Register" buttons for guests
- User avatar dropdown with "My Bids", "My Auctions", "Profile", "Logout" for authenticated users
- Real-time notification bell icon with unread count badge
- Shopping cart icon (for won items pending payment)

**Hero Section:**
- Large banner with rotating featured auctions (carousel/slider)
- Call-to-action buttons: "Start Bidding" and "Sell Your Item"
- Live auction counter: "X Live Auctions | Y Active Bidders"
- Countdown timer for next featured auction

**Featured Auctions Grid:**
- Card-based layout (3-4 columns on desktop, 1-2 on mobile)
- Each card displays: thumbnail image, title, current bid, time remaining, bid count
- Real-time countdown timers on each card
- "Watch" button (heart icon) to add to watchlist
- Hover effect showing quick bid button
- Status badges: "HOT", "ENDING SOON", "NEW", "RESERVE NOT MET"

**Category Section:**
- Grid of category cards with icons (Electronics, Fashion, Collectibles, Art, Vehicles, etc.)
- Item count per category
- Click navigates to filtered auction listings

**How It Works Section:**
- 3-4 step visual guide: Register → Browse → Bid → Win
- Icon-based representation with brief descriptions

**Footer:**
- Links: About, Help Center, Terms, Privacy, Contact
- Social media icons
- Newsletter subscription form
- Copyright and trust badges

### Key Features
- Lazy loading for auction cards (load more on scroll)
- WebSocket connection for live updates on featured auctions
- Responsive grid layout using CSS Grid/Flexbox
- Smooth animations and transitions
- Progressive image loading with blur-up effect

---

## 2. AUTHENTICATION MODULE (Login/Register)

### Purpose
Secure user registration and login with validation and error handling.

### Login Modal/Page Components

**Login Form:**
- Email/Username input field with icon
- Password input field with show/hide toggle icon
- "Remember me" checkbox
- "Forgot Password?" link
- Primary "Login" button with loading spinner state
- Divider with "OR"
- Social login options (Google, Facebook - optional)
- "Don't have an account? Sign Up" link

**Validation & States:**
- Real-time field validation with error messages below inputs
- Red border on invalid fields, green on valid
- Disabled submit button until form is valid
- Loading state with spinner during API call
- Success message with auto-redirect
- Error message display for wrong credentials

### Registration Modal/Page Components

**Registration Form (Multi-step or Single Page):**

**Step 1 - Basic Info:**
- Full Name input
- Email input with format validation
- Username input with availability check (debounced API call)
- Password input with strength meter (weak/medium/strong)
- Confirm Password input with match validation

**Step 2 - Additional Details:**
- Phone number (optional)
- Address fields (for shipping)
- Profile picture upload (optional)
- Date of birth (age verification: 18+)

**Step 3 - Verification:**
- Email verification code input (sent after Step 1)
- Resend code button with cooldown timer
- Terms and conditions checkbox (required)
- Privacy policy checkbox (required)

**Visual Elements:**
- Progress indicator for multi-step forms (Step 1/3, 2/3, 3/3)
- Password requirements checklist (8+ chars, uppercase, number, special char)
- Real-time username availability indicator (green checkmark or red X)
- Success confirmation screen with "Go to Dashboard" button

### Key Features
- Form validation with instant feedback
- CSRF token handling
- Secure password masking with toggle
- Auto-focus on first input field
- Enter key submission
- Session persistence with "Remember me"
- Responsive modal design (overlay on desktop, full screen on mobile)

---

## 3. AUCTION LISTINGS / BROWSE MODULE

### Purpose
Comprehensive auction discovery page with advanced filtering, sorting, and search.

### Layout Structure

**Left Sidebar - Filters (collapsible on mobile):**

**Search Section:**
- Keyword search input with auto-suggest
- Advanced search toggle (title, description, seller)

**Category Filter:**
- Checkbox tree with nested categories
- "Show More" for expanded categories
- Selected filter badges with remove (X) button

**Price Range Filter:**
- Dual-handle slider for min/max price
- Input fields for manual entry
- "Any Price" checkbox

**Auction Status Filter:**
- Checkboxes: Active, Ending Soon (<1 hour), Reserve Not Met, No Reserve
- Radio buttons: All, Buy Now Available, Accepts Offers

**Time Remaining Filter:**
- Radio buttons: Ending Today, Next 3 Days, Next Week, All

**Seller Rating Filter:**
- Star rating checkboxes (5★, 4★+, 3★+)
- "Top Rated Sellers Only" checkbox

**Location Filter:**
- Country dropdown
- "Local Pickup Available" checkbox
- Radius slider (for nearby items)

**Additional Filters:**
- "Free Shipping" checkbox
- "New Items Only" checkbox
- "Auctions I'm Watching" checkbox

**Filter Actions:**
- "Apply Filters" button (mobile)
- "Clear All" link
- Save search option

**Main Content Area:**

**Top Bar:**
- Results count: "Showing X-Y of Z auctions"
- View toggle: Grid view / List view icons
- Sort dropdown: 
  - Ending Soonest
  - Newly Listed
  - Price: Low to High
  - Price: High to Low
  - Most Bids
  - Most Watched
- Items per page selector (20, 50, 100)

**Auction Cards (Grid View):**
```
┌─────────────────────────┐
│   [Image Carousel]      │ ← Multiple images with dots
│   ❤️ Watch  📷 3 photos │ ← Top right badges
├─────────────────────────┤
│ Item Title              │
│ Current Bid: $125.00    │ ← Bold, large font
│ [Bid Now Button]        │ ← Prominent CTA
│ ⏰ 2h 34m remaining     │ ← Countdown timer
│ 🔨 15 bids · 👁️ 234 views│
│ ⭐ Seller: john_doe (98%)│
│ 📍 New York, USA        │
└─────────────────────────┘
```

**Auction Cards (List View):**
- Horizontal layout with thumbnail left, details center, bid section right
- More detailed description visible
- Quick bid input field inline

**Card States & Indicators:**
- "ENDING SOON" red badge (< 1 hour)
- "NEW" blue badge (< 24 hours)
- "HOT" fire icon badge (high activity)
- "RESERVE NOT MET" yellow badge
- "BUY NOW" green badge
- "YOU'RE WINNING" green border
- "YOU'VE BEEN OUTBID" red border
- Pulsing animation on active auctions
- Grayscale filter on ended auctions

**Pagination:**
- Page numbers with prev/next buttons
- "Load More" button (infinite scroll option)
- Jump to page input
- Results per page at bottom

**Empty State:**
- Illustration/icon
- "No auctions found" message
- Suggestions: "Try different filters" or "Clear all filters"

### Key Features
- Real-time updates via WebSocket (new bids, auction endings)
- Skeleton loading placeholders
- Smooth transitions when filtering
- URL parameter persistence (shareable filtered URLs)
- Saved searches for registered users
- Bulk actions: Add multiple to watchlist
- Image lazy loading with blur placeholder

---

## 4. AUCTION DETAIL PAGE MODULE

### Purpose
Comprehensive single auction view with real-time bidding, full details, and interaction options.

### Layout Structure

**Top Section - Breadcrumb Navigation:**
- Home > Category > Subcategory > Item Title
- Back to search results link

**Main Content (Two-Column Layout):**

**Left Column - Image Gallery:**

**Primary Image Display:**
- Large main image (600x600px or responsive)
- Zoom functionality (click to open lightbox, hover to magnify)
- Fullscreen button
- Image counter badge: "1 / 8"

**Thumbnail Strip:**
- Horizontal scrollable thumbnail gallery below main image
- Active thumbnail highlighted with border
- Lazy loading for thumbnails

**Image Lightbox:**
- Full-screen modal overlay
- Arrow navigation between images
- Close button (X)
- Zoom in/out controls
- Touch/swipe support for mobile

**Right Column - Auction Information:**

**Auction Header:**
```
┌─────────────────────────────────────────┐
│ [NEW] [HOT]                    ❤️ Watch │ ← Status badges & watch button
│ Vintage Camera Canon AE-1      [Share ⚡]│ ← Title & share
│ ⭐⭐⭐⭐⭐ (4.8) · 234 watchers           │
└─────────────────────────────────────────┘
```

**Current Bid Section (Prominent Box):**
```
┌─────────────────────────────────────────┐
│ Current Bid                             │
│ $245.00                ⏰ 2h 34m 12s    │ ← Live countdown
│ [15 bids]                               │
│ ━━━━━━━━━━━━━━━━━━━ 85%                │ ← Reserve price indicator
│ Reserve not yet met                     │
│                                         │
│ [ Place Bid: $ _____ ] [BID NOW →]     │ ← Bid input & button
│ Minimum bid: $250.00                    │
│ (Your max bid: $300.00)                 │ ← If user has proxy bid
└─────────────────────────────────────────┘
```

**Quick Actions Bar:**
- [🔨 Place Bid] [💰 Buy Now - $500] [📧 Ask Question]
- [⚡ Make Offer] [🚩 Report Item]

**Seller Information Card:**
```
┌─────────────────────────────────────────┐
│ 👤 Seller: john_doe_collectibles        │
│ ⭐⭐⭐⭐⭐ 98.5% (2,456 ratings)          │
│ Member since: Jan 2018                  │
│ 📍 Location: New York, USA              │
│ Response time: < 2 hours                │
│                                         │
│ [Contact Seller] [View Other Items]     │
└─────────────────────────────────────────┘
```

**Auction Details Tabs:**

**Tab 1 - Description:**
- Rich text description with formatting
- Key features bullet list
- Condition details
- "Read More" expansion for long descriptions
- Seller's notes section

**Tab 2 - Shipping & Payment:**
- Shipping options table (method, cost, estimated delivery)
- Ships to: countries list
- Returns accepted: Yes/No + policy details
- Payment methods accepted (PayPal, Credit Card, etc.)
- Sales tax information

**Tab 3 - Bid History (Real-time):**
```
┌──────────────────────────────────────────┐
│ Time              Bidder        Amount   │
├──────────────────────────────────────────┤
│ 2 mins ago        u***r         $245.00  │ ← Latest bid highlighted
│ 15 mins ago       j***n         $240.00  │
│ 1 hour ago        m***k         $230.00  │
│ 2 hours ago       u***r         $220.00  │
│ ...                                       │
│ [Load More History]                       │
└──────────────────────────────────────────┘
```
- Auto-scrolls to top on new bid
- Your bids highlighted in different color
- Winning bid marked with trophy icon
- Real-time WebSocket updates

**Tab 4 - Questions & Answers:**
- Q&A thread interface
- "Ask a Question" input (for logged-in users)
- Previous questions with seller responses
- Timestamps and user names (anonymized)
- Helpful/Unhelpful buttons
- Report inappropriate question

**Tab 5 - Seller Reviews:**
- Overall rating summary with star distribution graph
- Review cards with star rating, date, reviewer name, comment
- Filter by rating (All, 5★, 4★, etc.)
- "Write a Review" button (if purchased before)
- Verified buyer badge

**Specifications Panel:**
- Item-specific attributes (varies by category)
- Example for Electronics: Brand, Model, Year, Condition, Warranty
- Collapsible sections for long lists

**Similar Items Carousel:**
- "You May Also Like" or "Similar Auctions"
- Horizontal scrolling carousel
- 4-6 auction cards with images, titles, current bids, time remaining

**Bottom Section - Additional Information:**

**Terms & Conditions:**
- Auction rules specific to this item
- Buyer requirements
- Disclaimer text

**Sticky Bottom Bar (Mobile):**
- Compact bid info: Current bid + time remaining
- [Place Bid] button always visible
- Collapses on scroll down, reappears on scroll up

### Real-Time Features
- **WebSocket Updates:**
  - New bids instantly update current bid, bid count, and bid history
  - Countdown timer synchronized across all clients
  - "New bid placed" toast notification
  - Outbid alert: "You've been outbid! Current bid: $250"
  - Auction ending warning: "This auction ends in 5 minutes!"
  - Winner announcement when auction ends

- **Visual Feedback:**
  - Bid amount input turns green when valid, red when invalid
  - Success animation on successful bid placement
  - Pulsing effect on bid button when ending soon
  - Confetti animation if user wins

- **Connection Status:**
  - Live indicator: "🟢 Live" or "🔴 Disconnected"
  - Auto-reconnection with "Reconnecting..." message

### Interactive States

**Logged Out User:**
- Bid button shows "Sign in to bid"
- Click redirects to login with return URL

**Logged In User:**
- Can place bids, ask questions, watch item
- Shows "Your bid: $XXX" if user has active bid
- Shows "You're winning!" or "You've been outbid" status

**Auction Ended:**
- Grayed out bid section
- Winner announcement: "🏆 Winning bid: $500 by j***n"
- "Auction Ended" badge
- If user won: "Congratulations! Please proceed to payment"
- If user lost: "You were outbid. View similar items"

### Mobile Optimizations
- Collapsible sections (accordion style)
- Sticky bid button at bottom
- Swipeable image gallery
- Simplified tab navigation
- Reduced information density

---

## 5. BIDDING INTERFACE MODULE

### Purpose
Intuitive, fast, and secure bid placement mechanism with validation and feedback.

### Quick Bid Component (Inline on Listings)

**Hover State on Auction Card:**
```
┌─────────────────────────┐
│   [Image]               │
│   ╔═══════════════════╗ │ ← Overlay appears
│   ║ Quick Bid         ║ │
│   ║ Current: $125     ║ │
│   ║ [ $130 ]          ║ │ ← Pre-calculated next bid
│   ║ [Place Bid →]     ║ │
│   ╚═══════════════════╝ │
└─────────────────────────┘
```

### Detailed Bid Modal (Main Bidding Interface)

**Modal Overlay Triggered By:**
- "Bid Now" button on detail page
- Quick bid from listing cards
- "Place Bid" from watchlist

**Modal Structure:**

**Header:**
```
┌───────────────────────────────────────┐
│ Place Your Bid                    [X] │
│ Vintage Camera Canon AE-1             │
└───────────────────────────────────────┘
```

**Auction Summary:**
```
┌───────────────────────────────────────┐
│ [Thumbnail]  Current Bid: $245.00     │
│              Time Remaining: 2h 34m   │
│              Your current bid: $240   │ ← If applicable
└───────────────────────────────────────┘
```

**Bid Input Section:**
```
┌───────────────────────────────────────┐
│ Your Bid Amount                       │
│ ┌─────────────────────────────────┐   │
│ │ $  [________] USD               │   │
│ └─────────────────────────────────┘   │
│ Minimum bid: $250.00                  │
│ Suggested bids:                       │
│ [$250] [$260] [$275] [$300] [Custom]  │ ← Quick bid buttons
└───────────────────────────────────────┘
```

**Proxy/Maximum Bid Option:**
```
┌───────────────────────────────────────┐
│ ☐ Set Maximum Bid (Automatic Bidding)│
│ ┌─────────────────────────────────┐   │
│ │ Max bid: $ [_____]              │   │
│ └─────────────────────────────────┘   │
│ ℹ️ We'll bid incrementally up to     │
│    this amount to keep you winning    │
└───────────────────────────────────────┘
```

**Review & Confirm:**
```
┌───────────────────────────────────────┐
│ Review Your Bid                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Bid Amount:        $260.00            │
│ Buyer's Premium:   $26.00 (10%)       │
│ Shipping:          $15.00             │
│ Total if you win:  $301.00            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                       │
│ ☑️ I agree to terms and conditions    │
│                                       │
│ [Cancel]            [Confirm Bid →]   │ ← Primary action
└───────────────────────────────────────┘
```

### Validation & Error States

**Real-Time Validation Messages:**
- ❌ "Bid must be at least $250.00"
- ❌ "You cannot bid on your own auction"
- ❌ "Bid amount must be higher than your current bid"
- ❌ "Invalid bid amount"
- ⚠️ "This is a significant increase. Are you sure?"
- ✅ "Valid bid amount"

**Bid Rejection Scenarios:**
- Auction ended during bid placement
- Another user bid higher (race condition)
- User already has winning bid
- Insufficient account balance (if required)
- User is seller

**Error Modal:**
```
┌───────────────────────────────────────┐
│ ⚠️ Bid Failed                         │
│                                       │
│ Another bidder just placed a higher   │
│ bid of $265.00.                       │
│                                       │
│ Current bid: $265.00                  │
│ New minimum: $270.00                  │
│                                       │
│ [Cancel]         [Bid $270 →]         │
└───────────────────────────────────────┘
```

### Success Feedback

**Success Modal:**
```
┌───────────────────────────────────────┐
│ 🎉 Bid Placed Successfully!           │
│                                       │
│ Your bid: $260.00                     │
│ You are currently winning!            │
│                                       │
│ We'll notify you if you're outbid.    │
│                                       │
│ [View Auction]  [My Bids]  [Close]    │
└───────────────────────────────────────┘
```

**Toast Notification (Non-intrusive):**
```
┌─────────────────────────────────┐
│ ✅ Bid placed: $260.00      [X] │
└─────────────────────────────────┘
```

### Optimistic UI Updates

**Immediate Visual Feedback:**
1. Bid button shows spinner: "Placing bid..."
2. Current bid updates instantly (optimistically)
3. User's bid highlighted in history
4. If bid fails, revert to previous state with error message

**Loading States:**
- Button: "Place Bid" → "Placing..." → "✓ Bid Placed"
- Disable form during submission
- Overlay with semi-transparent loading screen

### Mobile Bidding Interface

**Simplified Modal:**
- Full-screen on small devices
- Larger touch targets (buttons 48px minimum height)
- Numeric keypad auto-focus for bid input
- Swipe down to dismiss
- Sticky confirm button at bottom

**One-Tap Quick Bid:**
- "Bid $250" button directly on card
- Confirmation toast instead of modal for speed
- Undo option in toast (5-second window)

### Accessibility Features
- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels for screen readers
- Focus management (trap focus in modal)
- High contrast mode support
- Error messages announced to screen readers

---

## 6. USER DASHBOARD MODULE

### Purpose
Centralized hub for users to manage all auction activities, bids, watchlist, and account.

### Dashboard Layout

**Top Navigation Tabs:**
```
┌────────────────────────────────────────────────────┐
│ [Active Bids] [Watchlist] [Won] [Lost] [Selling]  │
└────────────────────────────────────────────────────┘
```

### Tab 1: Active Bids

**Summary Cards (Top Row):**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🔨 Active    │ │ 🏆 Winning   │ │ ⚠️ Losing    │
│    Bids      │ │    Bids      │ │    Bids      │
│    12        │ │    7         │ │    5         │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Active Bids Table/List:**
```
┌─────────────────────────────────────────────────────────────┐
│ Item | Your Bid | Current Bid | Status | Time Left | Actions│
├─────────────────────────────────────────────────────────────┤
│ [📷] Camera    $250    $250    ✅ Winning  2h 15m   [Bid]  │
│ [👕] Shirt     $30     $35     ❌ Outbid   5h 20m   [Bid]  │
│ [💻] Laptop    $800    $800    ✅ Winning  1d 3h    [Bid]  │
└─────────────────────────────────────────────────────────────┘
```

**Card View (Mobile/Alternative):**
```
┌───────────────────────────────────────┐
│ [Image] Vintage Camera Canon AE-1     │
│                                       │
│ Your bid: $250.00                     │
│ Current bid: $250.00 ✅ You're winning│
│ ⏰ Ends in: 2h 15m                    │
│                                       │
│ [Increase Bid] [Remove Watch] [View]  │
└───────────────────────────────────────┘
```

**Status Indicators:**
- ✅ Green: "Winning" (your bid is highest)
- ❌ Red: "Outbid" (someone bid higher)
- ⏰ Orange: "Ending Soon" (< 1 hour)
- ⚠️ Yellow: "Reserve Not Met"

**Bulk Actions:**
- Select multiple items checkbox
- "Remove from Watchlist" button
- "Export to CSV" option

**Filters:**
- Status: All / Winning / Outbid / Ending Soon
- Time Range: Last 24h / 7 days / 30 days / All
- Sort: Ending Soonest / Highest Bid / Recently Added

### Tab 2: Watchlist

**Watchlist Summary:**
- Total items watched: 24
- "You're watching X items ending today"

**Watchlist Cards:**
```
┌───────────────────────────────────────┐
│ [Image] Vintage Jacket                │
│ Current bid: $125.00                  │
│ 🔨 15 bids · ⏰ 4h 30m left          │
│                                       │
│ ❤️ Remove    [Quick Bid]    [View]   │
└───────────────────────────────────────┘
```

**Features:**
- Add notes to watched items (private)
- Set price alerts: "Notify me if bid goes below $X"
- Organize into folders/categories
- Quick bid directly from watchlist
- Bulk remove items

**Empty State:**
- Illustration of watchlist
- "Your watchlist is empty"
- "Browse auctions and click ❤️ to watch items"
- [Browse Auctions] button

### Tab 3: Won Auctions

**Won Items Table:**
```
┌──────────────────────────────────────────────────────────────┐
│ Item | Won Price | Won Date | Payment | Status | Actions   │
├──────────────────────────────────────────────────────────────┤
│ Camera  $250.00   Dec 5     ✅ Paid    Shipped   [Track]    │
│ Shirt   $35.00    Dec 3     ⏳ Pending Awaiting  [Pay Now]  │
│ Watch   $180.00   Dec 1     ✅ Paid    Delivered [Review]   │
└──────────────────────────────────────────────────────────────┘
```

**Payment Status:**
- ✅ "Paid" - Green
- ⏳ "Payment Pending" - Orange
- ❌ "Payment Failed" - Red
- 🕐 "Payment Due: 2 days remaining" - Warning

**Shipping Status:**
- "Awaiting Payment"
- "Processing"
- "Shipped" (with tracking number)
- "In Transit"
- "Delivered"

**Action Buttons:**
- [Pay Now] - For unpaid items
- [Track Shipment] - For shipped items
- [Contact Seller] - Message button
- [Leave Review] - For delivered items
- [Report Issue] - Problem resolution

**Won Item Detail Card:**
```
┌───────────────────────────────────────┐
│ 🏆 Congratulations!                   │
│ You won: Vintage Camera Canon AE-1    │
│                                       │
│ Winning bid: $250.00                  │
│ Buyer's premium: $25.00               │
│ Shipping: $15.00                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Total: $290.00                        │
│                                       │
│ Payment due by: Dec 12, 2025          │
│                                       │
│ [Pay Now →]  [Contact Seller]         │
└───────────────────────────────────────┘
```

### Tab 4: Lost Auctions

**Lost Bids History:**
```
┌───────────────────────────────────────┐
│ [Image] Vintage Watch                 │
│                                       │
│ Your highest bid: $175.00             │
│ Winning bid: $185.00                  │
│ Lost by: $10.00                       │
│ Ended: 2 days ago                     │
│                                       │
│ [View Similar] [Contact Winner]       │
└───────────────────────────────────────┘
```

**Alternative Purchase Options:**
- "Find similar items" button
- "Contact winner" (if they want to resell)
- "Save search" to get alerts on similar items

**Statistics:**
- Win rate: "You've won 68% of auctions you bid on"
- Average win margin: "$15.00"
- Total amount bid: "$2,450"

### Tab 5: Selling (My Auctions)

**Seller Dashboard Header:**
```
┌────────────────────────────────────────────────────┐
│ [+ Create New Auction]              [Bulk Upload]  │
│                                                    │
│ Active: 8 | Sold: 45 | Unsold: 3 | Draft: 2      │
└────────────────────────────────────────────────────┘
```

**My Auctions Table:**
```
┌──────────────────────────────────────────────────────────────┐
│ Item | Current Bid | Bids | Watchers | Time Left | Actions │
├──────────────────────────────────────────────────────────────┤
│ Camera  $250.00    15    42         2h 15m      [View][Edit]│
│ Shirt   $30.00     8     12         5h 20m      [View][End] │
│ Watch   No bids    0     5          1d 3h       [View][Edit]│
└──────────────────────────────────────────────────────────────┘
```

**Auction Performance Card:**
```
┌───────────────────────────────────────┐
│ 📷 Vintage Camera Canon AE-1          │
│                                       │
│ Current bid: $250.00 (↑ 25%)         │
│ 🔨 15 bids                            │
│ 👁️ 234 views                         │
│ ❤️ 42 watchers                        │
│ ⏰ Ends in: 2h 15m                    │
│                                       │
│ 💬 3 Questions | 📧 5 Messages        │
│                                       │
│ [Edit] [End Early] [Relist] [Stats]  │
└───────────────────────────────────────┘
```

**Actions:**
- [Edit] - Modify description, photos (if no bids)
- [End Early] - End auction prematurely
- [Relist] - Create identical auction
- [Promote] - Boost visibility
- [Answer Questions] - Q&A management
- [View Analytics] - Detailed stats

**Analytics Popup:**
- View count over time (line chart)
- Traffic sources (pie chart)
- Peak viewing times
- Bid activity timeline
- Demographics (location of bidders)

**Sold Items:**
```
┌───────────────────────────────────────┐
│ ✅ Camera SOLD for $250.00            │
│ Winner: j***n                         │
│ Sold: Dec 5, 2025                     │
│                                       │
│ Payment: ✅ Received                  │
│ Shipping: 📦 Label Created            │
│                                       │
│ [Print Label] [Mark Shipped] [Contact]│
└───────────────────────────────────────┘
```

### Additional Dashboard Sections

**Quick Stats Panel (Sidebar):**
```
┌───────────────────────────┐
│ Your Activity             │
├───────────────────────────┤
│ Total Bids: 127           │
│ Win Rate: 68%             │
│ Total Won: $8,450         │
│ Total Sold: $12,300       │
│ Feedback: ⭐ 4.8/5 (156)  │
│ Member Since: Jan 2024    │
└───────────────────────────┘
```

**Notifications Center:**
```
┌───────────────────────────────────────┐
│ 🔔 Notifications (12 unread)          │
├───────────────────────────────────────┤
│ ⚠️ You've been outbid on Camera       │
│    2 minutes ago                      │
│                                       │
│ ✅ You won Vintage Watch auction      │
│    1 hour ago                         │
│                                       │
│ 💬 New message from seller            │
│    3 hours ago                        │
│                                       │
│ [Mark All Read] [Settings]            │
└───────────────────────────────────────┘
```

**Notification Settings:**
- Email notifications toggle
- Push notifications toggle
- Notification types: Outbid, Won, Lost, Messages, Watched item ending, Price drops
- Frequency: Real-time, Daily digest, Weekly summary

### Mobile Dashboard

**Bottom Tab Navigation:**
```
┌─────┬─────┬─────┬─────┬─────┐
│ 🏠  │ 🔍  │ ❤️  │ 🔨  │ 👤  │
│Home │Find │Watch│Bids │ Me  │
└─────┴─────┴─────┴─────┴─────┘
```

**Swipeable Cards:**
- Swipe left to reveal quick actions
- Swipe right to mark as read/archive
- Pull to refresh gesture

**Compact List View:**
- Condensed information density
- Collapsible sections
- Priority information first (status, time, amount)

---

## 7. CREATE/EDIT AUCTION MODULE

### Purpose
Comprehensive auction creation wizard with media upload, detailed input, and preview.

### Multi-Step Creation Wizard

**Progress Indicator:**
```
① Details → ② Media → ③ Pricing → ④ Shipping → ⑤ Review
   ●━━━━━━━○━━━━━━━○━━━━━━━○━━━━━━━○
```

### Step 1: Basic Details

**Category Selection:**
```
┌───────────────────────────────────────┐
│ Select Category *                     │
│ ┌─────────────────────────────────┐   │
│ │ Electronics ▼                   │   │
│ └─────────────────────────────────┘   │
│ ┌─────────────────────────────────┐   │
│ │ Cameras & Photography ▼         │   │
│ └─────────────────────────────────┘   │
│ ┌─────────────────────────────────┐   │
│ │ Film Cameras                    │   │
│ └─────────────────────────────────┘   │
└───────────────────────────────────────┘
```

**Title & Description:**
```
┌───────────────────────────────────────┐
│ Auction Title * (80 characters max)   │
│ ┌─────────────────────────────────┐   │
│ │ Vintage Canon AE-1 Camera       │   │
│ └─────────────────────────────────┘   │
│ 45/80 characters                      │
│                                       │
│ Description *                         │
│ ┌─────────────────────────────────┐   │
│ │                                 │   │
│ │ [Rich Text Editor]              │   │
│ │ - Bold, Italic, List            │   │
│ │ - Links, Headings               │   │
│ │                                 │   │
│ └─────────────────────────────────┘   │
│ ℹ️ Write a detailed description to   │
│    attract more bidders               │
└───────────────────────────────────────┘
```

**Item Specifics (Category-dependent):**
```
┌───────────────────────────────────────┐
│ Brand *                               │
│ ┌─────────────────────────────────┐   │
│ │ Canon                           │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Model                                 │
│ ┌─────────────────────────────────┐   │
│ │ AE-1                            │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Condition *                           │
│ ○ New                                 │
│ ○ Like New                            │
│ ● Used - Excellent                    │
│ ○ Used - Good                         │
│ ○ Used - Fair                         │
│ ○ For Parts/Not Working               │
│                                       │
│ Year of Manufacture                   │
│ ┌─────────────────────────────────┐   │
│ │ 1978                            │   │
│ └─────────────────────────────────┘   │
└───────────────────────────────────────┘
```

### Step 2: Media Upload

**Image Upload Section:**
```
┌───────────────────────────────────────────────┐
│ Add Photos * (8 max, first will be main)     │
├───────────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│ │[📷]│ │ ➕ │ │ ➕ │ │ ➕ │ │ ➕ │          │
│ │ 1  │ │Add │ │Add │ │Add │ │Add │          │
│ │Main│ │    │ │    │ │    │ │    │          │
│ └────┘ └────┘ └────┘ └────┘ └────┘          │
│ [Edit] [Delete] [Set as Main]                │
└───────────────────────────────────────────────┘
```

**Upload Methods:**
- Click to browse files
- Drag & drop zone
- Camera capture (mobile)
- Photo library selection (mobile)

**Image Requirements Display:**
- ✅ JPG, PNG, GIF formats
- ✅ Maximum 10MB per image
- ✅ Minimum 500x500px resolution
- ℹ️ High-quality photos get 3x more bids

**Image Editor (Optional):**
- Crop tool
- Rotate/flip
- Brightness/contrast
- Filters (auto-enhance)
- Add watermark option

**Upload Progress:**
```
┌───────────────────────────────────────┐
│ Uploading image_1.jpg...              │
│ ████████████████░░░░░░░░░░ 65%       │
└───────────────────────────────────────┘
```

**Video Upload (Optional):**
```
┌───────────────────────────────────────┐
│ Add Video (Optional)                  │
│ ┌─────────────────────────────────┐   │
│ │     🎥 Upload Video             │   │
│ │     Max 30 seconds, 100MB       │   │
│ └─────────────────────────────────┘   │
│ ℹ️ Videos increase buyer confidence  │
└───────────────────────────────────────┘
```

### Step 3: Pricing & Duration

**Auction Format:**
```
┌───────────────────────────────────────┐
│ Auction Type *                        │
│ ● Auction (Standard)                  │
│ ○ Buy Now Only                        │
│ ○ Auction with Buy Now                │
└───────────────────────────────────────┘
```

**Pricing Fields:**
```
┌───────────────────────────────────────┐
│ Starting Bid * (USD)                  │
│ $ ┌──────────────┐                    │
│   │ 100.00       │ ℹ️ Set competitive │
│   └──────────────┘    starting price  │
│                                       │
│ Reserve Price (Optional)              │
│ $ ┌──────────────┐                    │
│   │ 250.00       │ 🔒 Hidden from    │
│   └──────────────┘    bidders         │
│ ℹ️ Auction won't sell below this     │
│                                       │
│ Buy Now Price (Optional)              │
│ $ ┌──────────────┐                    │
│   │ 500.00       │ ⚡ Instant sale   │
│   └──────────────┘    option          │
│                                       │
│ Minimum Bid Increment                 │
│ $ ┌──────────────┐                    │
│   │ 5.00         │ Recommended: $5   │
│   └──────────────┘                    │
└───────────────────────────────────────┘
```

**Duration Settings:**
```
┌───────────────────────────────────────┐
│ Auction Duration *                    │
│ ○ 1 Day                               │
│ ○ 3 Days                              │
│ ● 7 Days (Most Popular)               │
│ ○ 10 Days                             │
│ ○ Custom: ┌────┐ days                 │
│           │    │                      │
│           └────┘                      │
│                                       │
│ Start Time                            │
│ ● Start Immediately                   │
│ ○ Schedule:                           │
│   Date: [Dec 12, 2025 ▼]             │
│   Time: [3:00 PM ▼] PST              │
│                                       │
│ Auto-Extend                           │
│ ☑️ Extend by 2 minutes if bid in     │
│    final 60 seconds                   │
└───────────────────────────────────────┘
```

**Fee Calculator (Real-time):**
```
┌───────────────────────────────────────┐
│ 💰 Estimated Fees                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Starting bid:        $100.00          │
│ Expected price:      $250.00          │
│                                       │
│ Listing fee:         $1.00            │
│ Success fee (10%):   $25.00           │
│ Payment processing:  $7.50            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ You receive:         $216.50          │
└───────────────────────────────────────┘
```

### Step 4: Shipping & Location

**Item Location:**
```
┌───────────────────────────────────────┐
│ Item Location *                       │
│ City: ┌──────────────────┐            │
│       │ New York         │            │
│       └──────────────────┘            │
│ State: ┌──────────────────┐           │
│        │ NY               │           │
│        └──────────────────┘           │
│ ZIP: ┌──────────────────┐             │
│      │ 10001            │             │
│      └──────────────────┘             │
│ ☐ Hide exact location                 │
│    (show city/state only)             │
└───────────────────────────────────────┘
```

**Shipping Options:**
```
┌───────────────────────────────────────┐
│ Shipping Services                     │
│ ☑️ USPS Priority (2-3 days)  $15.00  │
│ ☑️ FedEx Ground (3-5 days)   $12.00  │
│ ☐ UPS Next Day             $45.00  │
│ ☑️ Local Pickup            Free     │
│                                       │
│ Ships To                              │
│ ● United States Only                  │
│ ○ Worldwide                           │
│ ○ Custom: [Select countries ▼]       │
│                                       │
│ Handling Time                         │
│ ┌─────────────────────────────────┐   │
│ │ 1 business day ▼                │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Package Details                       │
│ Weight: [2.5] lbs                     │
│ Dimensions: [12]x[8]x[6] inches       │
│                                       │
│ ☑️ Offer combined shipping           │
│    (discount for multiple wins)       │
│                                       │
│ ☐ Free shipping                       │
│   ℹ️ Increases visibility by 30%     │
└───────────────────────────────────────┘
```

**Returns & Warranty:**
```
┌───────────────────────────────────────┐
│ Return Policy *                       │
│ ● Returns Accepted                    │
│   Within: [30 days ▼]                 │
│   Refund: ● Full  ○ Partial           │
│   Return shipping: ○ Buyer ● Seller   │
│                                       │
│ ○ No Returns                          │
│                                       │
│ Warranty                              │
│ ○ No Warranty                         │
│ ● Manufacturer Warranty (if applicable)│
│ ○ Seller Warranty: ┌────┐ months      │
│                     │    │            │
│                     └────┘            │
└───────────────────────────────────────┘
```

### Step 5: Review & Publish

**Preview Panel:**
```
┌───────────────────────────────────────┐
│ Preview Your Auction                  │
│                                       │
│ [Full auction detail page preview]    │
│ - As bidders will see it              │
│ - Interactive countdown               │
│ - All details formatted               │
│                                       │
│ [Mobile Preview] [Desktop Preview]    │
└───────────────────────────────────────┘
```

**Summary Checklist:**
```
┌───────────────────────────────────────┐
│ ✅ 8 high-quality photos uploaded     │
│ ✅ Detailed description (250+ words)  │
│ ✅ Competitive starting price set     │
│ ✅ Shipping options configured        │
│ ✅ Return policy specified            │
│ ⚠️ Consider adding video              │
│ ⚠️ Reserve price not set              │
└───────────────────────────────────────┘
```

**Final Actions:**
```
┌───────────────────────────────────────┐
│ ☐ Save as draft                       │
│ ☐ Schedule for later                  │
│                                       │
│ Terms & Conditions                    │
│ ☑️ I agree to auction terms           │
│ ☑️ I confirm item description accuracy│
│ ☑️ I have rights to sell this item    │
│                                       │
│ [← Back]    [Save Draft]  [Publish →]│
└───────────────────────────────────────┘
```

**Success Confirmation:**
```
┌───────────────────────────────────────┐
│ 🎉 Auction Created Successfully!      │
│                                       │
│ Your auction is now live!             │
│ Auction ID: #12345678                 │
│                                       │
│ Ends: Dec 19, 2025 at 3:00 PM EST    │
│                                       │
│ [View Auction] [Share] [Create Another]│
│                                       │
│ 💡 Pro Tip: Share on social media     │
│    to get more views!                 │
└───────────────────────────────────────┘
```

### Edit Auction Interface

**Edit Restrictions:**
- If no bids: Full editing allowed
- If bids exist: Limited to description, photos, shipping details
- Warning message: "⚠️ 15 people are bidding. Changes may affect them."

**Quick Edit Panel:**
```
┌───────────────────────────────────────┐
│ Quick Actions                         │
│ [Add Photos] [Update Price]           │
│ [Extend Duration] [End Early]         │
│ [Promote] [Answer Questions]          │
└───────────────────────────────────────┘
```

### Mobile Creation Experience

**Simplified Wizard:**
- One field per screen
- Large touch targets
- Camera integration for instant photo capture
- Voice input for description
- Template descriptions

**Quick List Feature:**
- Barcode scanner for products
- Auto-fill from product database
- One-tap category selection
- Suggested pricing based on similar items

---

## 8. SEARCH & FILTERS MODULE

### Purpose
Powerful search interface with advanced filtering, autocomplete, and saved searches.

### Global Search Bar (Header)

**Search Input:**
```
┌─────────────────────────────────────────────┐
│ 🔍 Search auctions, categories, sellers...  │
└─────────────────────────────────────────────┘
```

**Autocomplete Dropdown:**
```
┌─────────────────────────────────────────────┐
│ 🔍 canon camera                             │
├─────────────────────────────────────────────┤
│ 🔎 Suggestions                              │
│    canon camera ae-1                        │
│    canon camera lens                        │
│    canon camera vintage                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 📷 Categories                               │
│    Cameras & Photography (1,234)            │
│    Film Cameras (456)                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 👤 Sellers                                  │
│    camera_collector (⭐ 4.9)                │
│    vintage_tech_store (⭐ 4.7)              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ⏱️ Recent Searches                          │
│    vintage watches                          │
│    designer handbags                        │
└─────────────────────────────────────────────┘
```

**Search History:**
- Last 10 searches saved
- Clear history option
- Click to re-search

### Advanced Search Panel

**Toggle Button:**
```
[🔍 Basic Search] / [⚙️ Advanced Search]
```

**Advanced Search Form:**
```
┌───────────────────────────────────────────────┐
│ ADVANCED SEARCH                               │
├───────────────────────────────────────────────┤
│ Keywords                                      │
│ Include: ┌─────────────────────────────────┐  │
│          │ vintage camera                  │  │
│          └─────────────────────────────────┘  │
│ Exclude: ┌─────────────────────────────────┐  │
│          │ broken, parts                   │  │
│          └─────────────────────────────────┘  │
│                                               │
│ Search In                                     │
│ ☑️ Title                                      │
│ ☑️ Description                                │
│ ☐ Seller Username                            │
│ ☐ Item Number                                │
│                                               │
│ Category                                      │
│ ┌─────────────────────────────────────────┐  │
│ │ All Categories ▼                        │  │
│ └─────────────────────────────────────────┘  │
│                                               │
│ Price Range                                   │
│ Min: $ ┌──────┐  Max: $ ┌──────┐            │
│        │ 50   │          │ 500  │            │
│        └──────┘          └──────┘            │
│ [━━●━━━━━━━━━━━━━━━━━━━━━━━━●━━━]           │
│                                               │
│ Condition                                     │
│ ☑️ New  ☑️ Used  ☐ Refurbished  ☐ For Parts │
│                                               │
│ Auction Type                                  │
│ ☑️ Auction  ☑️ Buy Now  ☐ Best Offer         │
│                                               │
│ Time Remaining                                │
│ ○ All Listings                                │
│ ○ Ending Today                                │
│ ○ Ending Within 3 Days                        │
│ ● Custom: From [Dec 12 ▼] To [Dec 19 ▼]     │
│                                               │
│ Location                                      │
│ Country: ┌──────────────────────────────┐    │
│          │ United States ▼              │    │
│          └──────────────────────────────┘    │
│ Within: ┌──────┐ miles of ZIP: ┌────────┐   │
│         │ 50   │                │ 10001  │   │
│         └──────┘                └────────┘   │
│ ☐ Local Pickup Only                          │
│                                               │
│ Seller Criteria                               │
│ Min Rating: ┌────┐ ⭐ (e.g., 4.5)            │
│             │4.5 │                           │
│             └────┘                           │
│ ☐ Top Rated Sellers Only                     │
│ ☐ Business Sellers                           │
│ ☐ Individual Sellers                         │
│                                               │
│ Shipping Options                              │
│ ☐ Free Shipping                              │
│ ☐ Expedited Shipping Available               │
│ ☐ International Shipping                     │
│                                               │
│ Additional Options                            │
│ ☐ Completed Listings (sold items)           │
│ ☐ Sold Listings Only                         │
│ ☐ Items I Haven't Bid On                    │
│ ☐ Authorized Sellers Only                   │
│                                               │
│ [Clear All]          [Search] [Save Search]  │
└───────────────────────────────────────────────┘
```

### Filter Sidebar (On Results Page)

**Active Filters Display:**
```
┌───────────────────────────────────┐
│ Active Filters (5)      [Clear All]│
├───────────────────────────────────┤
│ 🏷️ Category: Cameras        [×]  │
│ 💰 $50 - $500               [×]  │
│ ⭐ Rating: 4.5+             [×]  │
│ 📦 Free Shipping            [×]  │
│ ⏰ Ending Today             [×]  │
└───────────────────────────────────┘
```

**Collapsible Filter Sections:**

**Category (Tree Structure):**
```
┌───────────────────────────────────┐
│ ▼ Category                        │
│   ☑️ Electronics (2,345)          │
│     ▼ Cameras (456)               │
│       ☑️ Film Cameras (123)       │
│       ☐ Digital Cameras (234)     │
│       ☐ Camera Lenses (99)        │
│   ☐ Fashion (1,234)               │
│   ☐ Collectibles (890)            │
│   [Show More...]                  │
└───────────────────────────────────┘
```

**Price Histogram:**
```
┌───────────────────────────────────┐
│ ▼ Price                           │
│   ┌─────────────────────────────┐ │
│   │     ▂▃▅▇█▅▃▂▁               │ │
│   │ ╋───┴──────────────────────╋ │ │
│   │ $50                      $500│ │
│   └─────────────────────────────┘ │
│   Min: $ [50]  Max: $ [500]       │
│   ☐ Under $25                     │
│   ☑️ $25 - $100                   │
│   ☑️ $100 - $500                  │
│   ☐ Over $500                     │
└───────────────────────────────────┘
```

**Condition Filter:**
```
┌───────────────────────────────────┐
│ ▼ Condition                       │
│   ☑️ New (234)                    │
│   ☑️ Like New (145)               │
│   ☑️ Used - Excellent (567)       │
│   ☐ Used - Good (345)             │
│   ☐ For Parts (67)                │
└───────────────────────────────────┘
```

**Time Remaining:**
```
┌───────────────────────────────────┐
│ ▼ Time Remaining                  │
│   ● All Listings                  │
│   ○ Ending in 1 hour (45)         │
│   ○ Ending Today (234)            │
│   ○ Ending in 3 Days (567)        │
│   ○ Ending in 7 Days (890)        │
└───────────────────────────────────┘
```

**Seller Rating (Star Selector):**
```
┌───────────────────────────────────┐
│ ▼ Seller Rating                   │
│   ☐ ⭐⭐⭐⭐⭐ 5 Stars (45)         │
│   ☑️ ⭐⭐⭐⭐ 4+ Stars (234)        │
│   ☐ ⭐⭐⭐ 3+ Stars (567)          │
│   ☐ All Sellers                   │
│   ☐ Top Rated Only (123)          │
└───────────────────────────────────┘
```

**Location & Shipping:**
```
┌───────────────────────────────────┐
│ ▼ Location & Shipping             │
│   Country: [United States ▼]      │
│   Within [50] miles of [10001]    │
│   ☑️ Free Shipping (456)          │
│   ☐ Local Pickup (123)            │
│   ☐ International (234)           │
└───────────────────────────────────┘
```

**Custom Attributes (Category-specific):**
```
┌───────────────────────────────────┐
│ ▼ Brand                           │
│   ☑️ Canon (234)                  │
│   ☐ Nikon (187)                   │
│   ☐ Sony (156)                    │
│   [Show More...]                  │
│                                   │
│ ▼ Format                          │
│   ☑️ 35mm (345)                   │
│   ☐ Medium Format (89)            │
│   ☐ Instant (67)                  │
└───────────────────────────────────┘
```

### Saved Searches

**Saved Search Panel:**
```
┌───────────────────────────────────────┐
│ 💾 Saved Searches                     │
├───────────────────────────────────────┤
│ 📷 Vintage Cameras < $200             │
│    Last run: 2 hours ago              │
│    New items: 12                      │
│    [Run] [Edit] [Delete]              │
│    ☑️ Email alerts: Daily             │
│                                       │
│ 👕 Designer Shirts Size M             │
│    Last run: 1 day ago                │
│    New items: 3                       │
│    [Run] [Edit] [Delete]              │
│    ☐ Email alerts                     │
│                                       │
│ [+ Create New Saved Search]           │
└───────────────────────────────────────┘
```

**Save Search Modal:**
```
┌───────────────────────────────────────┐
│ Save This Search                      │
├───────────────────────────────────────┤
│ Search Name *                         │
│ ┌─────────────────────────────────┐   │
│ │ Vintage Canon Cameras           │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Email Notifications                   │
│ ○ Never                               │
│ ● Daily digest                        │
│ ○ Weekly digest                       │
│ ○ Instant (as posted)                 │
│                                       │
│ Price Alert (Optional)                │
│ Notify me if price drops below:       │
│ $ ┌──────┐                            │
│   │ 150  │                            │
│   └──────┘                            │
│                                       │
│ [Cancel]              [Save Search →] │
└───────────────────────────────────────┘
```

### Sort Options

**Sort Dropdown:**
```
┌─────────────────────────────────┐
│ Sort by: Ending Soonest ▼       │
├─────────────────────────────────┤
│ ● Ending Soonest               │
│ ○ Newly Listed                  │
│ ○ Price: Low to High            │
│ ○ Price: High to Low            │
│ ○ Most Bids                     │
│ ○ Most Watched                  │
│ ○ Best Match (Relevance)        │
│ ○ Distance: Nearest First       │
└─────────────────────────────────┘
```

### Search Results Insights

**Summary Bar:**
```
┌────────────────────────────────────────────────┐
│ Found 234 results for "vintage camera"         │
│                                                │
│ 💡 Insights:                                   │
│ • Average price: $275                          │
│ • 45 ending today                              │
│ • Most popular: Canon AE-1 (23 listings)       │
│ • Peak posting time: Sundays at 8 PM           │
└────────────────────────────────────────────────┘
```

**Search Tips (Empty/Low Results):**
```
┌───────────────────────────────────────┐
│ No results found                      │
│                                       │
│
Try these tips:                       │
│ • Check your spelling                 │
│ • Use fewer or different keywords     │
│ • Remove some filters                 │
│ • Try broader categories              │
│                                       │
│ Similar searches:                     │
│ • vintage cameras                     │
│ • canon camera                        │
│ • film camera                         │
└───────────────────────────────────────┘
```

### Mobile Search Interface

**Slide-out Filter Panel:**
- Full-screen overlay
- [Apply] and [Cancel] buttons at bottom
- Filter count badge on filter button
- Sticky "Clear All" at top

**Quick Filters (Chips):**
```
┌─────────────────────────────────────────┐
│ [Free Shipping] [Ending Today] [New]    │
│ [< $100] [⭐ 4+] [+More Filters]        │
└─────────────────────────────────────────┘
```

**Voice Search:**
- Microphone icon in search bar
- "Listening..." animation
- Speech-to-text conversion
- Confirmation before search

---

## 9. NOTIFICATIONS & ALERTS MODULE

### Purpose
Real-time and digest notifications for bid updates, auction endings, messages, and account activity.

### Notification Bell (Header)

**Bell Icon with Badge:**
```
🔔 (12)  ← Red badge with unread count
```

**Dropdown Panel:**
```
┌─────────────────────────────────────────┐
│ Notifications (12 unread) [Mark All Read]│
├──────────────────────────────────────────┤
│ 🔨 You've been outbid!                  │
│ Vintage Camera - Current: $260          │
│ 2 minutes ago             [Bid Now →]   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ ⏰ Auction ending soon                  │
│ Designer Watch - Ends in 15 mins        │
│ 15 minutes ago           [View]         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ 🏆 You won an auction!                  │
│ Vintage Jacket - Won for $85            │
│ 1 hour ago               [Pay Now]      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ 💬 New message from seller              │
│ Re: Shipping question                   │
│ 2 hours ago              [Reply]        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ 📦 Item shipped!                        │
│ Vintage Camera - Track: #123456         │
│ 3 hours ago              [Track]        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [View All Notifications]                │
└──────────────────────────────────────────┘
```

### Notification Types & Designs

**1. Outbid Alert (High Priority):**
```
┌─────────────────────────────────────────┐
│ ⚠️ YOU'VE BEEN OUTBID!                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [📷 Image]  Vintage Canon Camera        │
│             Your bid: $250.00           │
│             Current bid: $260.00        │
│             Time left: 2h 15m           │
│                                         │
│ [Place New Bid →]        [Dismiss]      │
└─────────────────────────────────────────┘
```

**2. Auction Won (Celebration):**
```
┌─────────────────────────────────────────┐
│ 🎉 CONGRATULATIONS!                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [📷 Image]  You won!                    │
│             Vintage Jacket              │
│             Winning bid: $85.00         │
│             Seller: vintage_shop        │
│                                         │
│ Please complete payment by Dec 15       │
│                                         │
│ [Pay Now →]    [Contact Seller]         │
└─────────────────────────────────────────┘
```

**3. Auction Ending Soon (Urgent):**
```
┌─────────────────────────────────────────┐
│ ⏰ ENDING SOON!                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [📷 Image]  Designer Watch              │
│             Current bid: $180.00        │
│             ⏰ 15 minutes remaining      │
│             You're winning! ✅          │
│                                         │
│ [View Auction]           [Dismiss]      │
└─────────────────────────────────────────┘
```

**4. New Message:**
```
┌─────────────────────────────────────────┐
│ 💬 NEW MESSAGE                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ From: vintage_collector (⭐ 4.9)        │
│ Re: Vintage Camera                      │
│                                         │
│ "Is the lens included with the camera?" │
│                                         │
│ [Reply]        [View Conversation]      │
└─────────────────────────────────────────┘
```

**5. Price Drop Alert:**
```
┌─────────────────────────────────────────┐
│ 💰 PRICE DROP!                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [📷 Image]  Vintage Camera              │
│             Was: $300.00                │
│             Now: $250.00 ↓ 17%          │
│             From saved search           │
│                                         │
│ [View Auction]      [Add to Watchlist]  │
└─────────────────────────────────────────┘
```

**6. Payment Received (Seller):**
```
┌─────────────────────────────────────────┐
│ ✅ PAYMENT RECEIVED                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [📷 Image]  Vintage Camera              │
│             Buyer: tech_enthusiast      │
│             Amount: $260.00             │
│                                         │
│ Ship by: Dec 12, 2025                   │
│                                         │
│ [Print Label]        [Mark Shipped]     │
└─────────────────────────────────────────┘
```

**7. Item Shipped (Buyer):**
```
┌─────────────────────────────────────────┐
│ 📦 YOUR ITEM HAS SHIPPED!               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [📷 Image]  Vintage Camera              │
│             Tracking: USPS #1234567890  │
│             Est. Delivery: Dec 14       │
│                                         │
│ [Track Package →]    [Contact Seller]   │
└─────────────────────────────────────────┘
```

**8. Review Request:**
```
┌─────────────────────────────────────────┐
│ ⭐ HOW WAS YOUR EXPERIENCE?             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ [📷 Image]  Vintage Camera              │
│             Received on: Dec 10         │
│                                         │
│ Rate your experience with vintage_shop  │
│                                         │
│ [Leave Review →]         [Later]        │
└─────────────────────────────────────────┘
```

### Notification Center (Full Page)

**Tab Navigation:**
```
[All (12)] [Bids (5)] [Messages (3)] [Activity (4)]
```

**Filter & Sort:**
```
┌───────────────────────────────────────────┐
│ [Unread Only] [Type ▼] [Date ▼]          │
│ [Mark All as Read] [Delete All]           │
└───────────────────────────────────────────┘
```

**Notification List (Grouped by Date):**
```
┌───────────────────────────────────────────┐
│ Today                                     │
├───────────────────────────────────────────┤
│ ●  🔨 Outbid - Vintage Camera            │
│     2 minutes ago        [Bid] [Dismiss]  │
│                                           │
│ ●  ⏰ Ending Soon - Watch                │
│     15 minutes ago              [View]    │
│                                           │
│    🏆 Won - Vintage Jacket                │
│     1 hour ago            [Pay] [View]    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Yesterday                                 │
├───────────────────────────────────────────┤
│    📦 Shipped - Camera Lens               │
│     Dec 9              [Track] [Contact]  │
│                                           │
│    💬 Message - Camera question           │
│     Dec 9                [Reply] [View]   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ This Week                                 │
├───────────────────────────────────────────┤
│    ⭐ Review Request - Vintage Watch      │
│     Dec 7              [Review] [Later]   │
│                                           │
│ [Load More...]                            │
└───────────────────────────────────────────┘
```

### Notification Settings

**Settings Panel:**
```
┌───────────────────────────────────────────┐
│ NOTIFICATION PREFERENCES                  │
├───────────────────────────────────────────┤
│ Bid Updates                               │
│ ☑️ When I'm outbid         [🔔][📧][📱] │
│ ☑️ When auction ends       [🔔][📧][📱] │
│ ☑️ When I win              [🔔][📧][📱] │
│ ☐ When bid is placed      [🔔][📧][📱] │
│                                           │
│ Watched Items                             │
│ ☑️ Price drops             [🔔][📧][  ] │
│ ☑️ Ending in 1 hour        [🔔][  ][📱] │
│ ☐ New similar items       [  ][📧][  ] │
│                                           │
│ Messages                                  │
│ ☑️ New message             [🔔][📧][📱] │
│ ☑️ Message replied         [🔔][  ][  ] │
│                                           │
│ Selling                                   │
│ ☑️ New bid received        [🔔][📧][  ] │
│ ☑️ Question asked          [🔔][📧][📱] │
│ ☑️ Item sold               [🔔][📧][📱] │
│ ☑️ Payment received        [🔔][📧][📱] │
│                                           │
│ Account Activity                          │
│ ☑️ Login from new device   [🔔][📧][📱] │
│ ☑️ Password changed        [🔔][📧][📱] │
│ ☐ Weekly summary           [  ][📧][  ] │
│                                           │
│ 🔔 Push  📧 Email  📱 SMS                 │
│                                           │
│ Quiet Hours                               │
│ From: [10:00 PM ▼] To: [7:00 AM ▼]      │
│ ☑️ Enable quiet hours                    │
│                                           │
│ [Save Preferences]                        │
└───────────────────────────────────────────┘
```

### Push Notifications (Browser/Mobile)

**Permission Request:**
```
┌───────────────────────────────────────────┐
│ Enable Notifications                      │
│                                           │
│ Get instant alerts for:                   │
│ • Bid updates                             │
│ • Auction endings                         │
│ • Messages                                │
│ • Winning auctions                        │
│                                           │
│ [Enable]                        [Later]   │
└───────────────────────────────────────────┘
```

**Push Notification Appearance:**
```
╔═══════════════════════════════════════╗
║ 🔔 AuctionHub                         ║
║ You've been outbid!                   ║
║ Vintage Camera - Now $260             ║
║ [Bid Now] [Dismiss]                   ║
╚═══════════════════════════════════════╝
```

### Email Notifications

**Immediate Email Template:**
```
Subject: ⚠️ You've been outbid - Vintage Canon Camera

Hi [Username],

Someone just placed a higher bid on:

Vintage Canon Camera AE-1
Your bid: $250.00
Current bid: $260.00
Time remaining: 2 hours 15 minutes

[Place New Bid]

Don't miss out!

━━━━━━━━━━━━━━━━━━━━━━━━
[Unsubscribe] [Notification Settings]
```

**Daily Digest Email:**
```
Subject: Your Daily Auction Summary - 5 Updates

Good morning [Username]!

Here's what happened in your auctions:

URGENT (2)
⚠️ Outbid on Vintage Camera (-$10)
⏰ Watch ending in 3 hours

WON (1)
🏆 You won Vintage Jacket for $85!

ACTIVITY (2)
💬 New message from vintage_collector
📦 Item shipped - Track #123456

[View All Activity]

━━━━━━━━━━━━━━━━━━━━━━━━
```

### Toast Notifications (On-page)

**Success Toast:**
```
┌─────────────────────────────────┐
│ ✅ Bid placed successfully!  [×]│
└─────────────────────────────────┘
```

**Error Toast:**
```
┌─────────────────────────────────┐
│ ❌ Bid failed. Try again.    [×]│
└─────────────────────────────────┘
```

**Info Toast:**
```
┌─────────────────────────────────┐
│ ℹ️ Auction ends in 5 minutes [×]│
└─────────────────────────────────┘
```

**Position:** Bottom-right corner
**Duration:** 3-5 seconds auto-dismiss
**Actions:** Close button, optional action button
**Stack:** Multiple toasts stack vertically

### Live Activity Feed (Dashboard Widget)

```
┌───────────────────────────────────────┐
│ 🔴 LIVE ACTIVITY                      │
├───────────────────────────────────────┤
│ Just now                              │
│ 🔨 New bid on Vintage Camera - $260   │
│                                       │
│ 2 mins ago                            │
│ 👀 5 people watching your auction     │
│                                       │
│ 5 mins ago                            │
│ 💬 New question on Designer Watch     │
│                                       │
│ [View All]                            │
└───────────────────────────────────────┘
```

### Notification Badge Updates

**Real-time WebSocket Updates:**
- Increment badge on new notification
- Decrement on mark as read
- Clear badge when all read
- Pulse animation on new critical notification

**Browser Tab Title:**
- "(3) AuctionHub - You've been outbid!"
- Update dynamically with WebSocket

---

## 10. USER PROFILE & SETTINGS MODULE

### Purpose
Comprehensive user profile management, account settings, preferences, and public seller/buyer profiles.

### Profile Navigation Tabs

```
[Public Profile] [Account Settings] [Payment] [Shipping] [Privacy] [Preferences]
```

### Public Profile View

**Profile Header:**
```
┌───────────────────────────────────────────────────┐
│ [Avatar]  john_doe_collectibles                   │
│ 📷        ⭐⭐⭐⭐⭐ 4.9 (1,245 ratings)          │
│           Member since: January 2020              │
│           📍 New York, USA                        │
│           🏆 Top Rated Seller                     │
│           Response time: < 2 hours                │
│                                                   │
│ [✉️ Contact] [⚠️ Report] [Share Profile]         │
└───────────────────────────────────────────────────┘
```

**About Section:**
```
┌───────────────────────────────────────┐
│ About                                 │
├───────────────────────────────────────┤
│ Passionate collector of vintage      │
│ cameras and photography equipment.    │
│ All items carefully tested and        │
│ accurately described. Fast shipping!  │
│                                       │
│ Specialties:                          │
│ • Vintage Film Cameras                │
│ • Camera Lenses                       │
│ • Photography Accessories             │
└───────────────────────────────────────┘
```

**Statistics Panel:**
```
┌──────────┬──────────┬──────────┬──────────┐
│ 1,245    │ 98.5%    │ 2,340    │ 45       │
│ Ratings  │ Positive │ Items    │ Active   │
│          │          │ Sold     │ Listings │
└──────────┴──────────┴──────────┴──────────┘
```

**Active Listings Section:**
```
┌───────────────────────────────────────┐
│ Current Auctions (45)      [View All] │
├───────────────────────────────────────┤
│ [Grid of 4-6 auction cards]          │
│ • Thumbnail images                    │
│ • Current bid                         │
│ • Time remaining                      │
└───────────────────────────────────────┘
```

**Reviews Section:**
```
┌───────────────────────────────────────┐
│ Buyer Reviews                         │
├───────────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ (1,056) 85%                  │
│ ⭐⭐⭐⭐  (145)  12%                   │
│ ⭐⭐⭐   (34)   3%                    │
│ ⭐⭐    (8)    0%                     │
│ ⭐     (2)    0%                      │
│                                       │
│ [All] [Positive] [Neutral] [Negative] │
├───────────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ by tech_buyer               │
│ "Fast shipping, item exactly as       │
│  described. Great seller!"            │
│ Dec 8, 2025                           │
│ Purchase: Vintage Canon Camera        │
│                                       │
│ ⭐⭐⭐⭐⭐ by vintage_fan              │
│ "Excellent communication and          │
│  packaging. Highly recommend!"        │
│ Dec 5, 2025                           │
│ Purchase: Camera Lens 50mm            │
│                                       │
│ [Load More Reviews]                   │
└───────────────────────────────────────┘
```

### Account Settings

**Personal Information:**
```
┌───────────────────────────────────────┐
│ PERSONAL INFORMATION                  │
├───────────────────────────────────────┤
│ Profile Picture                       │
│ [Avatar   ] [Change Photo] [Remove]   │
│ 150x150px │                           │
│                                       │
│ Full Name *                           │
│ ┌─────────────────────────────────┐   │
│ │ John Doe                        │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Username *                            │
│ ┌─────────────────────────────────┐   │
│ │ john_doe_collectibles           │   │
│ └─────────────────────────────────┘   │
│ ℹ️ Username appears publicly          │
│                                       │
│ Email Address *                       │
│ ┌─────────────────────────────────┐   │
│ │ john@example.com                │   │
│ └─────────────────────────────────┘   │
│ ✅ Verified [Change Email]            │
│                                       │
│ Phone Number                          │
│ ┌─────────────────────────────────┐   │
│ │ +1 (555) 123-4567               │   │
│ └─────────────────────────────────┘   │
│ ✅ Verified [Change Number]           │
│                                       │
│ Bio (500 characters)                  │
│ ┌─────────────────────────────────┐   │
│ │ [Text area for bio]             │   │
│ │                                 │   │
│ └─────────────────────────────────┘   │
│ 245/500 characters                    │
│                                       │
│ Specialties (Tags)                    │
│ [vintage cameras ×] [lenses ×]        │
│ [+ Add specialty]                     │
│                                       │
│ [Save Changes]                        │
└───────────────────────────────────────┘
```

**Security Settings:**
```
┌───────────────────────────────────────┐
│ SECURITY                              │
├───────────────────────────────────────┤
│ Password                              │
│ Last changed: Nov 15, 2025            │
│ [Change Password]                     │
│                                       │
│ Two-Factor Authentication             │
│ ✅ Enabled via SMS                    │
│ Backup codes: 8 remaining             │
│ [Manage 2FA]                          │
│                                       │
│ Login Sessions                        │
│ ┌─────────────────────────────────┐   │
│ │ 🖥️ Chrome - New York (Current)   │   │
│ │ Dec 10, 2025 at 2:30 PM          │   │
│ ├─────────────────────────────────┤   │
│ │ 📱 iPhone - New York              │   │
│ │ Dec 10, 2025 at 8:15 AM  [Revoke]│   │
│ ├─────────────────────────────────┤   │
│ │ 🖥️ Safari - Los Angeles          │   │
│ │ Dec 8, 2025 at 5:45 PM   [Revoke]│   │
│ └─────────────────────────────────┘   │
│ [Logout All Other Sessions]           │
│                                       │
│ Login Alerts                          │
│ ☑️ Email me for logins from new      │
│    devices                            │
│ ☑️ Require 2FA for new devices       │
│                                       │
│ Account Recovery                      │
│ Recovery email: j***e@gmail.com       │
│ Recovery phone: +1 (555) xxx-4567     │
│ [Update Recovery Options]             │
└───────────────────────────────────────┘
```

**Change Password Modal:**
```
┌───────────────────────────────────────┐
│ Change Password                       │
├───────────────────────────────────────┤
│ Current Password *                    │
│ ┌─────────────────────────────────┐   │
│ │ ●●●●●●●●        👁️            │   │
│ └─────────────────────────────────┘   │
│                                       │
│ New Password *                        │
│ ┌─────────────────────────────────┐   │
│ │ ●●●●●●●●        👁️            │   │
│ └─────────────────────────────────┘   │
│ Password Strength: ████████░░ Strong  │
│                                       │
│ Requirements:                         │
│ ✅ At least 8 characters              │
│ ✅ One uppercase letter               │
│ ✅ One number                         │
│ ✅ One special character              │
│                                       │
│ Confirm New Password *                │
│ ┌─────────────────────────────────┐   │
│ │ ●●●●●●●●        👁️            │   │
│ └─────────────────────────────────┘   │
│ ✅ Passwords match                    │
│                                       │
│ [Cancel]         [Change Password]    │
└───────────────────────────────────────┘
```

### Payment Settings

**Payment Methods:**
```
┌───────────────────────────────────────┐
│ PAYMENT METHODS                       │
├───────────────────────────────────────┤
│ Credit/Debit Cards                    │
│ ┌─────────────────────────────────┐   │
│ │ 💳 Visa ●●●● 4242    ✅ Default │   │
│ │ Expires: 12/2026                │   │
│ │ [Edit] [Remove] [Set Default]   │   │
│ ├─────────────────────────────────┤   │
│ │ 💳 Mastercard ●●●● 8888          │   │
│ │ Expires: 08/2025                │   │
│ │ [Edit] [Remove] [Set Default]   │   │
│ └─────────────────────────────────┘   │
│ [+ Add New Card]                      │
│                                       │
│ PayPal                                │
│ ✅ Connected: john@example.com        │
│ [Disconnect] [Change Account]         │
│                                       │
│ Bank Account (ACH)                    │
│ ○ Not connected                       │
│ [Connect Bank Account]                │
│                                       │
│ Billing Address                       │
│ ┌─────────────────────────────────┐   │
│ │ John Doe                        │   │
│ │ 123 Main Street, Apt 4B         │   │
│ │ New York, NY 10001              │   │
│ │ United States                   │   │
│ └─────────────────────────────────┘   │
│ [Edit Billing Address]                │
│                                       │
│ Payout Method (For Sellers)           │
│ Bank Transfer to: Chase ●●●● 1234     │
│ [Change Payout Method]                │
│                                       │
│ Transaction History                   │
│ [View All Transactions]               │
└───────────────────────────────────────┘
```

**Add Payment Method Modal:**
```
┌───────────────────────────────────────┐
│ Add Payment Method                    │
├───────────────────────────────────────┤
│ Card Number *                         │
│ ┌─────────────────────────────────┐   │
│ │ 1234 5678 9012 3456   💳        │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Cardholder Name *                     │
│ ┌─────────────────────────────────┐   │
│ │ John Doe                        │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Expiry Date *        CVV *            │
│ ┌──────────┐       ┌──────┐          │
│ │ MM / YY  │       │ 123  │          │
│ └──────────┘       └──────┘          │
│                                       │
│ ☐ Set as default payment method       │
│ ☑️ Save for future purchases          │
│                                       │
│ 🔒 Your payment information is secure │
│                                       │
│ [Cancel]              [Add Card]      │
└───────────────────────────────────────┘
```

### Shipping Addresses

```
┌───────────────────────────────────────┐
│ SHIPPING ADDRESSES                    │
├───────────────────────────────────────┤
│ ┌─────────────────────────────────┐   │
│ │ 🏠 HOME ✅ Default               │   │
│ │ John Doe                        │   │
│ │ 123 Main Street, Apt 4B         │   │
│ │ New York, NY 10001              │   │
│ │ United States                   │   │
│ │ Phone: +1 (555) 123-4567        │   │
│ │                                 │   │
│ │ [Edit] [Remove] [Set Default]   │   │
│ └─────────────────────────────────┘   │
│                                       │
│ ┌─────────────────────────────────┐   │
│ │ 💼 WORK                          │   │
│ │ John Doe                        │   │
│ │ 456 Business Ave, Suite 200     │   │
│ │ New York, NY 10002              │   │
│ │ United States                   │   │
│ │ Phone: +1 (555) 987-6543        │   │
│ │                                 │   │
│ │ [Edit] [Remove] [Set Default]   │   │
│ └─────────────────────────────────┘   │
│                                       │
│ [+ Add New Address]                   │
└───────────────────────────────────────┘
```

### Privacy Settings

```
┌───────────────────────────────────────┐
│ PRIVACY SETTINGS                      │
├───────────────────────────────────────┤
│ Profile Visibility                    │
│ ● Public (Anyone can view)            │
│ ○ Members Only (Registered users)     │
│ ○ Private (Only you)                  │
│                                       │
│ Show on Profile                       │
│ ☑️ Feedback ratings                   │
│ ☑️ Member since date                  │
│ ☑️ Active listings count              │
│ ☐ Items sold count                    │
│ ☑️ Location (city/state only)         │
│ ☐ Email address                       │
│                                       │
│ Bid Privacy                           │
│ ☑️ Hide my username in bid history    │
│    (show as u***r)                    │
│ ☐ Allow others to see my bid history │
│                                       │
│ Search Engine Indexing                │
│ ☑️ Allow search engines to index my   │
│    public profile                     │
│                                       │
│ Data & Download                       │
│ [Download My Data]                    │
│ [Delete My Account]                   │
│                                       │
│ Blocked Users (3)                     │
│ [Manage Blocked Users]                │
│                                       │
│ [Save Privacy Settings]               │
└───────────────────────────────────────┘
```

### User Preferences

```
┌───────────────────────────────────────┐
│ PREFERENCES                           │
├───────────────────────────────────────┤
│ Language & Region                     │
│ Language: ┌──────────────────┐        │
│           │ English (US) ▼   │        │
│           └──────────────────┘        │
│ Currency: ┌──────────────────┐        │
│           │ USD ($) ▼        │        │
│           └──────────────────┘        │
│ Timezone: ┌──────────────────┐        │
│           │ EST (UTC-5) ▼    │        │
│           └──────────────────┘        │
│                                       │
│ Display Preferences                   │
│ Theme: ● Light  ○ Dark  ○ Auto       │
│ Density: ● Comfortable  ○ Compact     │
│ ☑️ Show auction thumbnails in lists   │
│ ☑️ Enable animations                  │
│                                       │
│ Auction Preferences                   │
│ Default auction duration:             │
│ ┌──────────────────┐                  │
│ │ 7 days ▼         │                  │
│ └──────────────────┘                  │
│ Default starting bid increment:       │
│ $ ┌──────┐                            │
│   │ 5.00 │                            │
│   └──────┘                            │
│ ☑️ Auto-extend auctions when bid in   │
│    final 60 seconds                   │
│                                       │
│ Search Preferences                    │
│ Default sort: ┌──────────────────┐    │
│               │ Ending Soonest ▼ │    │
│               └──────────────────┘    │
│ Results per page: ┌────┐              │
│                   │ 50 │              │
│                   └────┘              │
│ ☑️ Save search history                │
│                                       │
│ Email Frequency                       │
│ Promotional emails:                   │
│ ○ Daily  ● Weekly  ○ Monthly  ○ Never│
│                                       │
│ [Save Preferences]                    │
└───────────────────────────────────────┘
```

### Seller Dashboard (Additional Tab)

```
┌───────────────────────────────────────┐
│ SELLER DASHBOARD                      │
├───────────────────────────────────────┤
│ Performance Metrics (Last 30 Days)    │
│ ┌──────┬──────┬──────┬──────┐        │
│ │ $2,340│ 45   │ 92%  │ 4.9★ │        │
│ │ Sales │Listings│ Sell │Rating│       │
│ └──────┴──────┴──────┴──────┘        │
│                                       │
│ Seller Level                          │
│ 🏆 Top Rated Seller                   │
│ Next level: Power Seller              │
│ ████████████░░░░░░ 65%                │
│ • Complete 20 more sales              │
│ • Maintain 4.8+ rating                │
│                                       │
│ Seller Tools                          │
│ [Bulk Upload] [Create Template]       │
│ [Print Labels] [Analytics]            │
│                                       │
│ Seller Policies                       │
│ [Edit Return Policy]                  │
│ [Edit Shipping Policy]                │
│ [Edit Terms & Conditions]             │
│                                       │
│ Fees & Commissions                    │
│ Standard rate: 10%                    │
│ Your rate: 8% (Top Seller discount)   │
│ [View Fee Schedule]                   │
└───────────────────────────────────────┘
```

### Mobile Profile Navigation

**Bottom Sheet Menu:**
```
┌───────────────────────────────────────┐
│ ⚙️ Settings                           │
├───────────────────────────────────────┤
│ 👤 Edit Profile                       │
│ 🔒 Security                           │
│ 💳 Payment Methods                    │
│ 📦 Shipping Addresses                 │
│ 🔔 Notifications                      │
│ 🌐 Language & Region                  │
│ 🎨 Appearance                         │
│ 🛡️ Privacy                            │
│ ❓ Help & Support                     │
│ 📄 Terms & Policies                   │
│ 🚪 Logout                             │
└───────────────────────────────────────┘
```

---

## 11. MESSAGING SYSTEM MODULE

### Purpose
Secure communication between buyers and sellers with message threading, attachments, and quick replies.

### Messages Inbox

**Inbox Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 💬 Messages                                    [Compose ✏️] │
├──────────────────────┬──────────────────────────────────────┤
│ CONVERSATIONS        │ Selected Conversation                │
│ [All] [Unread (3)]  │                                      │
│ [Buying] [Selling]  │                                      │
│ ─────────────────── │ ───────────────────────────────────  │
│                      │ vintage_collector (⭐ 4.9)           │
│ ● vintage_collector  │ Re: Vintage Canon Camera             │
│   "Is the lens..."   │ ────────────────────────────────────│
│   2 mins ago        │                                      │
│                      │ [Camera Thumbnail]                   │
│   tech_enthusiast    │ Auction: Vintage Canon AE-1          │
│   "Package arrived!" │ Current bid: $250                    │
│   1 hour ago        │ Time left: 2h 15m  [View Auction]   │
│                      │ ────────────────────────────────────│
│ ● camera_shop       │                                      │
│   "What's the...    │ vintage_collector              Dec 10│
│   3 hours ago       │ "Is the lens included with the       │
│                      │  camera? Also, does it come with    │
│   antique_seller     │  the original case?"                │
│   "Shipping info"    │                                      │
│   Yesterday          │ You                         Dec 10   │
│                      │ "Yes, the 50mm lens is included.    │
│   [Load More...]     │  The original case is also          │
│                      │  included in excellent condition."   │
│                      │                                      │
│                      │ vintage_collector              Dec 10│
│                      │ "Perfect! One more question..."      │
│                      │                                      │
│                      │ ────────────────────────────────────│
│                      │ ┌─────────────────────────────────┐ │
│                      │ │ Type a message...        [📎]   │ │
│                      │ │                                 │ │
│                      │ └─────────────────────────────────┘ │
│                      │ [Quick Reply Templates ▼]  [Send →]│
└──────────────────────┴──────────────────────────────────────┘
```

### Conversation List Item

```
┌───────────────────────────────────────┐
│ ● [Avatar] vintage_collector          │
│            ⭐ 4.9 (156 reviews)        │
│            "Is the lens included?"    │
│            2 minutes ago              │
│            📷 Vintage Canon Camera    │
└───────────────────────────────────────┘
```

**Status Indicators:**
- ● Blue dot: Unread message
- ✓ Single check: Sent
- ✓✓ Double check: Delivered
- ✓✓ Blue checks: Read

### Message Thread View

**Auction Context Card (Top of Thread):**
```
┌───────────────────────────────────────┐
│ About this auction                    │
│ ┌──────┐                              │
│ │ [📷] │ Vintage Canon Camera AE-1    │
│ │ IMG  │ Current bid: $250.00         │
│ └──────┘ Time left: 2h 15m            │
│          Status: ✅ You're winning    │
│          [View Full Auction →]        │
└───────────────────────────────────────┘
```

**Message Bubbles:**

**Received Message:**
```
┌───────────────────────────────────────┐
│ [Avatar] vintage_collector     Dec 10 │
│          3:45 PM                      │
│ ┌─────────────────────────────────┐   │
│ │ Is the lens included with the   │   │
│ │ camera? Also, does it come with │   │
│ │ the original case?              │   │
│ └─────────────────────────────────┘   │
└───────────────────────────────────────┘
```

**Sent Message:**
```
┌───────────────────────────────────────┐
│               Dec 10    You [Avatar]  │
│               3:50 PM                 │
│   ┌─────────────────────────────────┐ │
│   │ Yes, the 50mm lens is included. │ │
│   │ The original case is also       │ │
│   │ included in excellent condition.│ │
│   └─────────────────────────────────┘ │
│                                  ✓✓   │
└───────────────────────────────────────┘
```

**Message with Attachment:**
```
┌───────────────────────────────────────┐
│               Dec 10    You [Avatar]  │
│               4:00 PM                 │
│   ┌─────────────────────────────────┐ │
│   │ Here are additional photos:     │ │
│   │ ┌──────┐ ┌──────┐ ┌──────┐     │ │
│   │ │[IMG1]│ │[IMG2]│ │[IMG3]│     │ │
│   │ └──────┘ └──────┘ └──────┘     │ │
│   └─────────────────────────────────┘ │
│                                  ✓✓   │
└───────────────────────────────────────┘
```

**System Message:**
```
┌───────────────────────────────────────┐
│          ═══ Dec 10, 2025 ═══         │
│     🏆 You won this auction!          │
│     Please proceed to payment         │
└───────────────────────────────────────┘
```

### Compose Message

**New Message Modal:**
```
┌───────────────────────────────────────┐
│ New Message                       [×] │
├───────────────────────────────────────┤
│ To:                                   │
│ ┌─────────────────────────────────┐   │
│ │ Search users...             🔍  │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Regarding (Optional):                 │
│ ┌─────────────────────────────────┐   │
│ │ Vintage Canon Camera ▼          │   │
│ └─────────────────────────────────┘   │
│ [Camera thumbnail and details]        │
│                                       │
│ Subject:                              │
│ ┌─────────────────────────────────┐   │
│ │ Question about camera           │   │
│ └─────────────────────────────────┘   │
│                                       │
│ Message:                              │
│ ┌─────────────────────────────────┐   │
│ │                                 │   │
│ │ [Text area]                     │   │
│ │                                 │   │
│ │                                 │   │
│ └─────────────────────────────────┘   │
│ [📎 Attach] [😊 Emoji]                │
│                                       │
│ [Cancel]                    [Send →]  │
└───────────────────────────────────────┘
```

### Quick Reply Templates

**Template Selector:**
```
┌───────────────────────────────────────┐
│ Quick Replies                         │
├───────────────────────────────────────┤
│ • "Is this still available?"          │
│ • "What's the condition?"             │
│ • "Can you ship internationally?"     │
│ • "Do you accept offers?"             │
│ • "When can you ship?"                │
│ • "Is the price negotiable?"          │
│ ───────────────────────────────       │
│ Seller Templates:                     │
│ • "Yes, item is available!"           │
│ • "I ship within 24 hours"            │
│ • "Shipping cost is $X"               │
│ • "Thanks for your purchase!"         │
│ ───────────────────────────────       │
│ [+ Create Custom Template]            │
└───────────────────────────────────────┘
```

### Message Actions

**Message Options Menu (Long Press/Right Click):**
```
┌───────────────────────────────────────┐
│ 📋 Copy Text                          │
│ ↩️ Reply                              │
│ ⭐ Star Message                       │
│ 🚩 Report                             │
│ 🗑️ Delete                             │
└───────────────────────────────────────┘
```

**Conversation Actions (Top Bar):**
```
[⭐ Star] [🔔 Mute] [🚫 Block] [⚠️ Report] [🗑️ Delete]
```

### Message Notifications

**New Message Toast:**
```
┌─────────────────────────────────────┐
│ 💬 New message from vintage_collector│
│ "Is the lens included?"          [×]│
│ [Reply]              [View]          │
└─────────────────────────────────────┘
```

### Mobile Messaging Interface

**Conversation List (Mobile):**
```
┌───────────────────────────────────────┐
│ ← Messages                      [✏️]  │
├───────────────────────────────────────┤
│ ● [👤] vintage_collector              │
│        "Is the lens..."        2m ago │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   [👤] tech_enthusiast                │
│        "Package arrived!"      1h ago │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   [👤] camera_shop                    │
│        "What's the..."         3h ago │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [Load More...]                        │
└───────────────────────────────────────┘
```

**Message Thread (Mobile):**
- Full-screen view
- Back button to conversation list
- Sticky input bar at bottom
- Auction context card at top
- Swipe right to go back

### Safety & Moderation

**Warning Banners:**
```
┌───────────────────────────────────────┐
│ ⚠️ Safety Tip                         │
│ Never share payment info in messages. │
│ Always complete transactions through  │
│ our secure platform.          [Dismiss]│
└───────────────────────────────────────┘
```

**Suspicious Message Detection:**
```
┌───────────────────────────────────────┐
│ ⚠️ Potential Scam Detected            │
│ This message contains suspicious      │
│ content. Be cautious.                 │
│ [Report] [Learn More] [I Understand]  │
└───────────────────────────────────────┘
```

**Blocked User Message:**
```
┌───────────────────────────────────────┐
│ 🚫 This user has been blocked         │
│ You will no longer receive messages.  │
│ [Unblock User]                        │
└───────────────────────────────────────┘
```

---

## 12. RESPONSIVE & MOBILE CONSIDERATIONS

### Purpose
Ensure optimal experience across all devices with touch-friendly interfaces and mobile-specific features.

### Mobile Navigation

**Bottom Tab Bar:**
```
┌─────┬─────┬─────┬─────┬─────┐
│ 🏠  │ 🔍  │  ➕ │ 💬  │ 👤  │
│Home │Search│Post │Msgs │ Me  │
└─────┴─────┴─────┴─────┴─────┘
```

**Hamburger Menu (Slide-out):**
```
┌───────────────────────────────────────┐
│ [Avatar] john_doe                 [×] │
│ john@example.com                      │
├───────────────────────────────────────┤
│ 🏠 Home                               │
│ 🔍 Browse Auctions                    │
│ 🔨 My Bids                            │
│ ❤️ Watchlist                          │
│ 📦 Won Items                          │
│ 💰 Selling                            │
│ 💬 Messages (3)                       │
│ 🔔 Notifications (12)                 │
│ ⭐ Saved Searches                     │
│ ⚙️ Settings                           │
│ ❓ Help & Support                     │
│ 🚪 Logout                             │
└───────────────────────────────────────┘
```

### Touch Gestures

- **Swipe Right:** Go back / Close modal
- **Swipe Left:** View actions / Delete
- **Pull Down:** Refresh content
- **Long Press:** Context menu / Quick actions
- **Pinch to Zoom:** Image galleries
- **Double Tap:** Like / Watch item

### Mobile-Specific Features

**Quick Actions (Swipe Left on List Items):**
```
┌────────────────────────────────┐
│ Vintage Camera        ◀◀◀      │
│ $250 - 2h left   [Watch] [Bid] │
└────────────────────────────────┘
```

**Floating Action Button (FAB):**
```
                           ┌─────┐
                           │  ➕  │
                           └─────┘
```
- Primary action based on context
- Create auction, Place bid, etc.

### Responsive Breakpoints

**Mobile (< 768px):**
- Single column layout
- Full-width cards
- Bottom navigation
- Collapsible filters
- Sticky bid buttons

**Tablet (768px - 1024px):**
- Two-column grid
- Side navigation
- Split view (list + detail)
- Floating toolbars

**Desktop (> 1024px):**
- Multi-column layouts
- Fixed sidebars
- Hover effects
- Advanced filtering panels

---

This comprehensive UI implementation guide covers all major modules of the live auction system. Each module includes detailed descriptions, visual layouts, interactive elements, states, and mobile considerations. Use this prompt to build a complete, professional, and user-friendly auction platform interface.