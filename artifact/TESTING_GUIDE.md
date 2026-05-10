# How to Run and Test the Application

## Quick Start

### 1. Start the Backend Server

```bash
# From the project root
cd backend
npm install  # If not already done
npm start
```

The server will start on `http://localhost:3001` and will:
- Use HybridProvider (LNR for Top 14, SportsDB for other leagues)
- Poll for updates every 30 seconds
- Serve REST API at `/api/matches` and `/api/standings`
- Provide WebSocket updates via Socket.IO

### 2. Start the Frontend Development Server

```bash
# In a new terminal, from project root
cd frontend
npm install  # If not already done
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the Application

Open your browser to `http://localhost:5173`

## Testing the Fixes

### Test 1: Live View with Next Games

1. Click "En direct" (Live) in the view toggle
2. **Expected:** If no matches are currently live, you should see:
   - A section titled "Prochains matchs — [date]"
   - Only matches from the NEXT upcoming day (not multiple days)
   - Matches sorted by time

### Test 2: Standings Accuracy

1. Select "Top 14" from the sidebar menu
2. Click "Classement" (Standings) in the view toggle
3. **Expected:**
   - If partial data: Warning message about limited matches
   - Teams sorted by: Points → Goal difference → Points for
   - Columns: Rank, Team, Played, Won, Drawn, Lost, Points For, Points Against, Diff, Total Points
   - Top 6 teams highlighted (playoff zone)

### Test 3: Other Competitions Work

1. Open sidebar (burger menu)
2. Select different competitions:
   - Premiership
   - URC
   - Pro D2
   - Six Nations (if in season)
3. **Expected:**
   - Matches load for each competition
   - No errors in console
   - Round navigation works

### Test 4: Competition Switching

1. Start on Top 14
2. Switch to another competition (e.g., Premiership)
3. Switch back to Top 14
4. **Expected:**
   - Data updates correctly for each competition
   - No duplicate matches
   - Standings recalculate properly

### Test 5: Real-time Updates (if live matches exist)

1. Keep the app open during a live Top 14 match
2. **Expected:**
   - Scores update automatically every ~30 seconds
   - Status changes (1H → HT → 2H → FT) reflected
   - No need to refresh the page

## Verifying Data Sources

### Check Which Provider is Used

Check the server console output when it starts:
```
[Serveur] Fournisseur de données: Hybrid (LNR + SportsDB)
```

### Check Match Counts

Watch the poller output:
```
[HybridProvider] Fetched X Top14 matches (LNR) + Y other matches (SportsDB)
```

- Top14 should come from LNR (IDs start with "lnr-")
- Other competitions should come from SportsDB (numeric IDs)

## Checking the Database

```bash
# From project root
sqlite3 backend/top14.db

# Check match distribution
SELECT competition, status, COUNT(*) 
FROM matches 
GROUP BY competition, status 
ORDER BY competition, status;

# Check Top14 data source
SELECT id, competition, status, score_home, score_away, home_tries, away_tries, round 
FROM matches 
WHERE competition = 'top14' 
LIMIT 5;

# Verify tries are populated (should not all be 0 for Top14)
SELECT AVG(home_tries + away_tries) as avg_tries_per_match
FROM matches 
WHERE competition = 'top14' AND status = 'FT';
```

## Common Issues and Solutions

### Issue: No matches showing

**Possible causes:**
1. Network issues reaching LNR or SportsDB
2. API rate limiting
3. Database not initialized

**Solution:**
- Check server console for errors
- Restart the backend server
- Check `/api/health` endpoint: `curl http://localhost:3001/api/health`

### Issue: Standings are empty

**Possible causes:**
1. No finished matches in database
2. Competition has no data yet

**Solution:**
- Check database: `SELECT COUNT(*) FROM matches WHERE status='FT' AND competition='top14';`
- Wait for poller to fetch more data
- If it's a new season, there may be no finished matches yet

### Issue: "Mixed" data or duplicates

**Possible causes:**
1. Database has old data from previous provider setup

**Solution:**
```bash
# Clean Top14 duplicates (keep LNR data only)
sqlite3 backend/top14.db "DELETE FROM matches WHERE id NOT LIKE 'lnr-%' AND competition = 'top14';"
```

### Issue: Try counts all showing 0

**Possible causes:**
1. LNR provider not fetching match details
2. Match detail pages not loading

**Solution:**
- Check server logs for LNR fetch errors
- Try restarting the server to re-fetch details
- Check if LNR website structure changed

## API Endpoints

### GET /api/health
Health check endpoint
```json
{
  "status": "ok",
  "provider": "hybrid",
  "timestamp": "2026-05-10T..."
}
```

### GET /api/matches?competition=top14&round=23
Get matches for a competition and optional round
```json
{
  "matches": [...],
  "currentRound": 23,
  "availableRounds": [1, 2, 3, ..., 26]
}
```

### GET /api/standings?competition=top14
Get calculated standings
```json
{
  "standings": [
    {
      "id": "lnr-61",
      "name": "Stade Toulousain",
      "played": 23,
      "won": 18,
      "drawn": 1,
      "lost": 4,
      "points": 79,
      ...
    },
    ...
  ]
}
```

### GET /api/matches/:id
Get single match with events
```json
{
  "match": {...},
  "events": [...]
}
```

## Environment Variables

Create a `.env` file in the project root (optional):

```env
# Port for backend server (default: 3001)
PORT=3001

# SportsDB API Key (default: free tier "123")
SPORTSDB_API_KEY=123
```

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
# You can serve these with the backend by adding:
app.use(express.static(join(__dirname, '../frontend/dist')));
```

## Debugging

### Enable verbose logging

Edit `backend/server.js` and add debug output:
```javascript
const poller = new Poller(provider, (data) => {
  console.log(`[DEBUG] Received ${data.matches.length} matches, ${data.changes.length} changes`);
  // ... rest of poller callback
});
```

### Check WebSocket connection

Open browser console and check for:
```
[Socket] Connecté
```

If disconnected, check CORS settings in `backend/server.js`.

## Performance Tuning

### Adjust polling interval

Edit `backend/services/poller.js`:
```javascript
this.interval = setInterval(..., 30_000);  // 30 seconds (default)
// Change to 60_000 for 1 minute to reduce load
```

### Limit competitions fetched

Edit `backend/providers/SportsDbProvider.js`:
```javascript
const LEAGUE_MAP = {
  'top14': { id: '4430', name: 'French Top 14' },
  'premiership': { id: '4414', name: 'English Prem Rugby' },
  // Comment out competitions you don't need
};
```

## Getting Help

1. Check server console for errors
2. Check browser console for frontend errors
3. Review `artifact/FIXES_SUMMARY.md` for architecture details
4. Check database contents with sqlite3
5. Verify API responses with curl/Postman
