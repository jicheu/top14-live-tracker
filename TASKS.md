# Competition Switcher Implementation

Goal: Add a sidebar with a burger menu to switch between 15 rugby competitions.

- [x] Backend: Add `competition` column to `matches` table in `schema.sql`
- [x] Backend: Implement database migration and update queries in `database.js`
- [x] Backend: Update API routes in `matches.js` to support filtering by competition
- [x] Backend: Enhance `MockProvider.js` to generate data for 15 competitions
- [x] Frontend: Add competition names to `fr.js` i18n
- [x] Frontend: Create `Sidebar.jsx` component
- [x] Frontend: Add Sidebar and Burger menu toggle to `App.jsx`
- [x] Frontend: Manage competition state and update data fetching in `App.jsx`
- [x] Frontend: Add styles for Sidebar, Burger menu, and Backdrop in `app.css`
- [x] Frontend: Add dark/light mode toggle and persistence
- [x] Verification: Verify competition switching works and UI updates correctly
- [x] Verification: Verify real-time updates are filtered by current competition
- [x] Fix: Fetch events for score changes in SportsDbProvider
- [x] Refactor: Remove MockProvider and all associated simulation logic/UI
- [x] Backend: Set SportsDB as the primary data provider
- [x] Frontend: Remove Debug Mode and provider switching from Sidebar
- [x] Frontend: Implement ViewToggle for Live, Results, and Standings
- [x] Backend: Implement calculated Standings API
- [x] Frontend: Implement Standings view component
- [x] Frontend: Finalize CSS for ViewToggle and Standings
- [x] Frontend: Connect view switching logic in App.jsx

## Major Fixes (May 10, 2026)
- [x] Created HybridProvider combining LNR (Top14) + SportsDB (other leagues)
- [x] Fixed standings calculation with proper bonus point rules
- [x] Added try counting to LnrProvider for accurate bonus calculations
- [x] Fixed live view to show next day's matches when no live games
- [x] Cleaned database of duplicate/conflicting data
- [x] Added data validation and error handling across providers
- [x] Improved Top14-specific rules (defensive bonus at 5 points, offensive at 3 tries)
- [x] Fixed SportsDB provider to use more reliable endpoint
- [x] Added partial data warnings in standings view
- [x] **COMPLETE DATABASE RESET** - Wiped and recreated with clean data
- [x] Verified data sources: Top14 from LNR, others from SportsDB
- [x] Confirmed try counting works (50 tries in 6 Top14 matches)
