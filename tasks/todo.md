# sector signal Social Media AI Agent - Monthly Plan UI Redesign

## Task: Match Monthly Planning UI to Screenshot Design

### Overview
Redesign the monthly planning page to match the provided screenshot exactly.

### Key Design Elements from Screenshot

1. **Header**:
   - "BrandFlow" branding with logo (stylized "B")
   - Search bar centered
   - Notification bell (with red badge)
   - User avatar icon

2. **Sidebar Navigation**:
   - Menu items: Dashboard, Annual Strategy, Monthly Planning (active), Tactical Campaigns, Analytics, Create Brand, Competitors
   - Clean, minimal design with icons

3. **Monthly Planning Page**:
   - "Back to Year" button with left arrow
   - Large "November 2025" header
   - Brand label "BMW" in top-right
   - **Monthly Theme section**:
     - Title: "Monthly Theme"
     - Description: "Driving Joy & Performance: November focus on exhilarating everyday driving and precision engineering"
     - Edit pencil icon
   - **Post Summary Bar**:
     - "20 total posts" (bold)
     - Platform breakdown: "instagram: 12" (pink), "tiktok: 6" (blue), "facebook: 2" (lavender)
   - **Calendar Grid**:
     - Days header: Sun, Mon, Tue, Wed, Thu, Fri, Sat
     - Numbered content blocks: "Reels 1", "Reels 2", "Reels 9", "TikTok Story 1", "Facebook Post 1"
     - Color-coded blocks by platform (pink for Instagram, blue for TikTok, lavender for Facebook)
     - "+" buttons on empty dates
     - Grid layout with proper spacing

4. **Color Scheme**:
   - Light background (#FFFFFF, #F8F9FA)
   - Pink (#FFC0CB) for Instagram Reels
   - Light blue (#ADD8E6) for TikTok
   - Lavender (#E6E6FA) for Facebook
   - Blue (#007BFF) for active links

### Todo Items

- [ ] **Update Header Component**
  - Change branding from "Sector Signal" to "BrandFlow" with logo icon
  - Add notification bell with red badge dot
  - Update styling to match screenshot

- [ ] **Update Sidebar Component**
  - Verify navigation menu items match screenshot
  - Ensure Monthly Planning shows as active state

- [ ] **Redesign Monthly Plan Page Header**
  - Add "Back to Year" button with left arrow icon
  - Display month/year in large bold text (e.g., "November 2025")
  - Add brand label in top-right corner

- [ ] **Create Monthly Theme Section**
  - Add section with title "Monthly Theme"
  - Display theme description text
  - Add edit pencil icon button
  - Style with proper spacing and typography

- [ ] **Create Post Summary Bar**
  - Display total posts count (e.g., "20 total posts")
  - Show platform breakdown with colored text
  - Calculate actual counts from content calendar data

- [ ] **Update Calendar Component**
  - Modify content blocks to show numbered labels (Reels 1, Reels 2, etc.)
  - Add platform-specific color coding for blocks (not just dots)
  - Add "+" buttons on empty dates for creating new posts
  - Update styling to match screenshot (lighter colors, proper borders)

- [ ] **Update Platform Color Mapping**
  - Instagram: pink/pastel pink (#FFC0CB)
  - TikTok: light blue (#ADD8E6)
  - Facebook: lavender (#E6E6FA)

- [ ] **Test and Verify**
  - Ensure all components match screenshot layout
  - Test add post functionality with "+" buttons
  - Verify responsive behavior

### Files to Modify

1. `components/header.tsx` - Update branding and add notification bell
2. `components/sidebar.tsx` - Verify navigation matches
3. `app/monthly-plan/page.tsx` - Complete redesign of page layout
4. `components/ui/calendar.tsx` - Update calendar cell styling
5. `lib/calendar-utils.ts` - Update platform color mappings

### Expected Outcome

- Monthly planning page matches screenshot design exactly
- Professional, polished UI with proper visual hierarchy
- All interactive elements functional (add post, edit theme, etc.)
